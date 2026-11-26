/**
 * TIMBER LIGHT — ACCOUNT ENGINE (js/components/account.js)
 * Displays the customer's placed orders from localStorage (saved on checkout).
 */

window.AccountEngine = (function () {

  let modal = null;
  let modalBody = null;
  let closeBtn = null;

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

  function render() {
    if (!modalBody) return;

    const orders = getMyOrders();
    const latestCustomer = orders[0]?.customer;
    const displayName = latestCustomer?.name || "Guest Customer";
    const displaySub = latestCustomer?.email || "Your placed orders appear below";

    const ordersHtml = orders.length === 0
      ? `
        <div style="text-align:center; padding:2rem 1rem; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:var(--radius-sm);">
          <i class="fa-solid fa-box-open" style="font-size:2rem; color:var(--text-muted); opacity:0.4; margin-bottom:0.75rem; display:block;"></i>
          <p style="font-size:0.9rem; font-weight:600; margin-bottom:0.35rem;">No orders placed yet</p>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">When you buy a wooden light, your order and invoice details will appear here.</p>
          <a href="#shop-section" onclick="AccountEngine.close()" class="btn btn-primary btn-xs">Explore Models</a>
        </div>
      `
      : orders.map(o => {
          const itemsSummary = (o.items || [])
            .map(i => `${i.qty || 1}&times; ${i.model || i.name} (${i.polish || 'Teak'})`)
            .join(", ");
          const total = Number(o.totals?.finalTotal || 0).toLocaleString('en-IN');
          return `
            <div style="background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.85rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; font-size:0.85rem;">
                <strong>Order #${o.order_id}</strong>
                <span class="text-success" style="font-weight:700;">${o.status || 'Confirmed'}</span>
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.5rem;">
                ${itemsSummary} &bull; Total: ₹${total}
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.72rem; color:var(--text-muted);">${o.date || ''} &bull; ${o.customer?.city || ''}</span>
                <button class="btn btn-outline btn-xs" onclick="TimberHelpers.showToast('Order #${o.order_id} summary saved.', 'success')">Order Details</button>
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

        <h4 style="font-size:0.95rem; font-weight:700;">My Orders (${orders.length})</h4>

        <div style="display:flex; flex-direction:column; gap:0.75rem; max-height:360px; overflow-y:auto;">
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
