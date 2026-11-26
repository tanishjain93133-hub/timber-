/**
 * TIMBER LIGHT — ACCOUNT ENGINE (js/components/account.js)
 * Displays the customer's placed orders with live Supabase delivery status.
 */

window.AccountEngine = (function () {

  let modal = null;
  let modalBody = null;
  let closeBtn = null;

  const STATUS_STEPS = ["Confirmed", "In Assembly", "Dispatched", "Delivered"];

  function init() {
    modal = document.getElementById("account-modal");
    modalBody = document.getElementById("account-modal-body");
    closeBtn = document.getElementById("account-modal-close");

    const trigger = document.getElementById("account-trigger");

    if (trigger) trigger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }
  }

  function open() {
    if (!modal) return;
    render();
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    syncLiveOrders();
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function getMyOrders() {
    try {
      return JSON.parse(localStorage.getItem("timber_my_orders") || "[]");
    } catch (e) {
      return [];
    }
  }

  async function syncLiveOrders() {
    const orders = getMyOrders();
    if (!orders.length || !window.SupabaseDB || !window.SupabaseDB.fetchMyOrdersStatus) return;
    const ids = orders.map(o => o.order_id).filter(Boolean);
    if (!ids.length) return;
    const live = await window.SupabaseDB.fetchMyOrdersStatus(ids);
    if (Array.isArray(live) && live.length > 0) {
      const byId = {};
      live.forEach(row => { byId[row.order_id] = row; });
      const merged = orders.map(o => byId[o.order_id] ? { ...o, status: byId[o.order_id].status } : o);
      try { localStorage.setItem("timber_my_orders", JSON.stringify(merged)); } catch (e) {}
      render();
    }
  }

  function renderDeliveryTracker(status) {
    const currentIdx = Math.max(0, STATUS_STEPS.indexOf(status || "Confirmed"));
    return `
      <div style="display:flex; align-items:center; gap:0.25rem; margin:0.55rem 0 0.45rem;">
        ${STATUS_STEPS.map((step, idx) => {
          const active = idx <= currentIdx;
          return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:0.2rem;">
              <div style="width:100%; height:4px; border-radius:2px; background:${active ? 'var(--amber-core, #D4A853)' : 'var(--border-color, #e2e8f0)'};"></div>
              <span style="font-size:0.65rem; font-weight:${active ? '700' : '500'}; color:${active ? 'var(--amber-dark, #b45309)' : 'var(--text-muted)'}; text-align:center;">${step}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function render() {
    if (!modalBody) return;

    const orders = getMyOrders();
    const latestCustomer = orders[0]?.customer;
    const displayName = latestCustomer?.name || "Guest Customer";
    const displaySub = latestCustomer?.email || "Your placed orders & delivery status appear below";

    const ordersHtml = orders.length === 0
      ? `
        <div style="text-align:center; padding:2rem 1rem; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:var(--radius-sm);">
          <i class="fa-solid fa-box-open" style="font-size:2rem; color:var(--text-muted); opacity:0.4; margin-bottom:0.75rem; display:block;"></i>
          <p style="font-size:0.9rem; font-weight:600; margin-bottom:0.35rem;">No orders placed yet</p>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">When you buy a wooden light, your order and delivery tracking will appear here.</p>
          <a href="#shop-section" onclick="AccountEngine.close()" class="btn btn-primary btn-xs">Explore Models</a>
        </div>
      `
      : orders.map(o => {
          const itemsSummary = (o.items || [])
            .map(i => `${i.qty || 1}&times; ${i.model || i.name} (${i.polish || 'Teak'}${i.coating ? ', ' + i.coating : ''})`)
            .join(", ");
          const total = Number(o.totals?.finalTotal || 0).toLocaleString('en-IN');
          const pay = o.payment_method ? String(o.payment_method).toUpperCase() : 'COD';
          return `
            <div style="background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.85rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; font-size:0.85rem;">
                <strong>Order #${o.order_id}</strong>
                <span class="text-success" style="font-weight:700;">${o.status || 'Confirmed'}</span>
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.35rem;">
                ${itemsSummary} &bull; <strong>₹${total}</strong> (${pay})
              </div>
              ${renderDeliveryTracker(o.status)}
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.35rem;">
                <span style="font-size:0.72rem; color:var(--text-muted);">${o.date || ''} &bull; ${o.customer?.city || ''}</span>
                <span style="font-size:0.72rem; color:var(--text-muted);">${o.customer?.address || ''}</span>
              </div>
            </div>
          `;
        }).join("");

    modalBody.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div style="display:flex; align-items:center; gap:1rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--amber-soft); border:1px solid var(--amber-border); color:var(--amber-dark); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <h4 style="font-size:1.05rem; margin-bottom:0.15rem;">${displayName}</h4>
            <span style="font-size:0.8rem; color:var(--text-muted);">${displaySub}</span>
          </div>
        </div>

        <h4 style="font-size:0.95rem; font-weight:700;">Purchase History &amp; Delivery (${orders.length})</h4>

        <div style="display:flex; flex-direction:column; gap:0.75rem; max-height:380px; overflow-y:auto;">
          ${ordersHtml}
        </div>
      </div>
    `;
  }

  return {
    init,
    open,
    close
  };
})();
