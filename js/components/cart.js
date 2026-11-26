/**
 * TIMBER LIGHT — CART ENGINE (js/components/cart.js)
 * Clean, lightweight cart drawer with quantity steppers, subtotal, 18% GST, and checkout.
 */

window.CartEngine = (function() {
  
  let cart = []; // [{ id, quantity }]

  let drawer = null;
  let drawerItems = null;
  let drawerCount = null;
  let navbarCount = null;
  let subtotalEl = null;
  let gstEl = null;
  let totalEl = null;

  function init() {
    loadCart();

    drawer = document.getElementById("cart-drawer-modal");
    drawerItems = document.getElementById("cart-drawer-items");
    drawerCount = document.getElementById("cart-drawer-count");
    navbarCount = document.getElementById("cart-count");
    subtotalEl = document.getElementById("cart-subtotal-val");
    gstEl = document.getElementById("cart-gst-val");
    totalEl = document.getElementById("cart-total-val");

    const trigger = document.getElementById("cart-trigger");
    const closeBtn = document.getElementById("cart-drawer-close");
    const backdrop = document.getElementById("cart-drawer-backdrop");
    const continueBtn = document.getElementById("cart-continue-btn");
    const checkoutBtn = document.getElementById("cart-checkout-btn");

    if (trigger) trigger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
    if (continueBtn) continueBtn.addEventListener("click", close);

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          if (window.TimberHelpers) TimberHelpers.showToast("Your cart is empty.", "danger");
          return;
        }
        close();
        if (window.CheckoutEngine) CheckoutEngine.open();
      });
    }

    render();
  }

  function loadCart() {
    try {
      const saved = localStorage.getItem("timber_cart");
      cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem("timber_cart", JSON.stringify(cart));
    } catch (e) {}
  }

  function open() {
    if (drawer) {
      drawer.classList.add("active");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    render();
    syncLiveOrders();
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

  function renderOrderHistoryHtml() {
    const orders = getMyOrders();
    if (!orders.length) return "";
    const steps = ["Confirmed", "In Assembly", "Dispatched", "Delivered"];

    return `
      <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="font-size:0.9rem; font-weight:700; margin:0; display:flex; align-items:center; gap:0.4rem;">
            <i class="fa-solid fa-box-open" style="color:var(--amber-core, #D4A853);"></i>
            <span>Your Orders &amp; Delivery (${orders.length})</span>
          </h4>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.65rem;">
          ${orders.slice(0, 5).map(o => {
            const currentIdx = Math.max(0, steps.indexOf(o.status || "Confirmed"));
            const itemsSummary = (o.items || [])
              .map(i => `${i.qty || 1}&times; ${i.model || i.name} (${i.polish || "Teak"}${i.coating ? ", " + i.coating : ""})`)
              .join("<br>");
            const total = Number(o.totals?.finalTotal || 0).toLocaleString("en-IN");
            const pay = o.payment_method ? String(o.payment_method).toUpperCase() : "COD";
            return `
              <div style="background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; padding:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem; font-size:0.82rem;">
                  <strong>#${o.order_id}</strong>
                  <span style="font-size:0.72rem; font-weight:700; color:var(--amber-dark, #b45309); background:var(--amber-soft, #fef3c7); padding:0.15rem 0.5rem; border-radius:999px;">${o.status || "Confirmed"}</span>
                </div>
                <div style="font-size:0.76rem; color:var(--text-muted); line-height:1.4; margin-bottom:0.45rem;">
                  ${itemsSummary}
                </div>
                <div style="display:flex; align-items:center; gap:0.2rem; margin:0.4rem 0;">
                  ${steps.map((step, idx) => {
                    const active = idx <= currentIdx;
                    return `
                      <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:0.15rem;">
                        <div style="width:100%; height:3px; border-radius:2px; background:${active ? "var(--amber-core, #D4A853)" : "var(--border-color, #e2e8f0)"};"></div>
                        <span style="font-size:0.6rem; font-weight:${active ? "700" : "500"}; color:${active ? "var(--amber-dark, #b45309)" : "var(--text-muted)"};">${step}</span>
                      </div>
                    `;
                  }).join("")}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-muted); margin-top:0.35rem;">
                  <span>${o.date || ""} &bull; ${pay}</span>
                  <strong style="color:var(--text-main);">₹${total}</strong>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function close() {
    if (drawer) {
      drawer.classList.remove("active");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  function addItem(productId, qty = 1, event = null, options = null) {
    if (event) event.stopPropagation();

    const polish = (options && options.polish) ? options.polish : "Teak";
    const coating = (options && options.coating) ? options.coating : "PU";
    const tone = (options && options.tone) ? options.tone : "Matt";
    const silent = !!(options && options.silent);

    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += qty;
      if (options && options.polish) existing.polish = polish;
      if (options && options.coating) existing.coating = coating;
      if (options && options.tone) existing.tone = tone;
    } else {
      cart.push({ id: productId, quantity: qty, polish, coating, tone });
    }

    saveCart();
    render();
    
    const p = window.TIMBER_PRODUCTS ? TIMBER_PRODUCTS.find(x => x.id === productId) : null;
    const title = p ? p.name : "Product";
    if (window.TimberHelpers && !silent) {
      TimberHelpers.showToast(`${title} added to cart!`, "success");
    }
    // Log cart add to Supabase
    if (window.SupabaseDB) {
      SupabaseDB.logQuery('cart_add', `${polish} / ${coating} ${tone}`, productId, title);
    }

    if (!silent) open();
  }

  function updateQuantity(productId, delta) {
    const item = cart.find(x => x.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeItem(productId);
    } else {
      saveCart();
      render();
    }
  }

  function removeItem(productId) {
    cart = cart.filter(x => x.id !== productId);
    saveCart();
    render();
    if (window.TimberHelpers) TimberHelpers.showToast("Item removed from cart.", "danger");
  }

  function getCartSummary() {
    let subtotal = 0;
    let totalItems = 0;
    const items = [];

    cart.forEach(item => {
      const p = window.TIMBER_PRODUCTS ? TIMBER_PRODUCTS.find(x => x.id === item.id) : null;
      if (p) {
        const itemTotal = p.price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;
        items.push({
          ...p,
          quantity: item.quantity,
          polish: item.polish || "Teak",
          coating: item.coating || "PU",
          tone: item.tone || "Matt",
          itemTotal
        });
      }
    });

    const gst = Math.round(subtotal * 0.18);
    const total = subtotal; // GST inclusive in pricing

    return {
      items,
      subtotal,
      gst,
      total,
      totalItems
    };
  }

  function render() {
    const summary = getCartSummary();

    // Update Badges
    if (navbarCount) navbarCount.textContent = summary.totalItems;
    if (drawerCount) drawerCount.textContent = `(${summary.totalItems} item${summary.totalItems === 1 ? '' : 's'})`;

    // Update Totals
    const fmt = window.TimberHelpers ? TimberHelpers.formatINR : (n) => `₹${n}`;
    if (subtotalEl) subtotalEl.textContent = fmt(summary.subtotal);
    if (gstEl) gstEl.textContent = fmt(summary.gst);
    if (totalEl) totalEl.textContent = fmt(summary.total);

    // Render Items
    if (!drawerItems) return;

    if (summary.items.length === 0) {
      drawerItems.innerHTML = `
        <div style="text-align:center; padding: 2rem 1rem 1rem; color:var(--text-muted);">
          <i class="fa-solid fa-bag-shopping" style="font-size:2.5rem; margin-bottom:1rem; opacity:0.3;"></i>
          <h4 style="font-size:1.1rem; color:var(--text-main); margin-bottom:0.5rem;">Your cart is empty</h4>
          <p style="font-size:0.85rem;">Discover our handcrafted wooden lighting collection.</p>
        </div>
        ${renderOrderHistoryHtml()}
      `;
      return;
    }

    drawerItems.innerHTML = summary.items.map(item => `
      <div class="cart-item-card">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.model}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" onerror="this.onerror=null; this.src='images/products/tl_baluster_finial.jpg'">
        </div>

        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-meta">Height: ${item.height} &bull; ${item.polish || 'Teak'} (${item.coating || 'PU'} ${item.tone || 'Matt'})</div>
          <div class="cart-item-price">${fmt(item.itemTotal)}</div>
        </div>

        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
          <button class="cart-item-remove-btn" onclick="CartEngine.removeItem('${item.id}')" title="Remove Item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          
          <div class="cart-qty-stepper">
            <button type="button" class="cart-qty-btn" onclick="CartEngine.updateQuantity('${item.id}', -1)">-</button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button type="button" class="cart-qty-btn" onclick="CartEngine.updateQuantity('${item.id}', 1)">+</button>
          </div>
        </div>
      </div>
    `).join("") + renderOrderHistoryHtml();
  }

  function clearCart() {
    cart = [];
    saveCart();
    render();
  }

  return {
    init,
    open,
    close,
    addItem,
    updateQuantity,
    removeItem,
    getCartSummary,
    clearCart
  };
})();
