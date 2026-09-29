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
  }

  function close() {
    if (drawer) {
      drawer.classList.remove("active");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  function addItem(productId, qty = 1, event = null) {
    if (event) event.stopPropagation();

    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ id: productId, quantity: qty });
    }

    saveCart();
    render();
    
    if (window.TimberHelpers) {
      const p = window.TIMBER_PRODUCTS ? TIMBER_PRODUCTS.find(x => x.id === productId) : null;
      const title = p ? p.name : "Product";
      TimberHelpers.showToast(`${title} added to cart!`, "success");
    }

    open();
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
        <div style="text-align:center; padding: 3rem 1rem; color:var(--text-muted);">
          <i class="fa-solid fa-bag-shopping" style="font-size:2.5rem; margin-bottom:1rem; opacity:0.3;"></i>
          <h4 style="font-size:1.1rem; color:var(--text-main); margin-bottom:0.5rem;">Your cart is empty</h4>
          <p style="font-size:0.85rem;">Discover our handcrafted wooden lighting collection.</p>
        </div>
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
          <div class="cart-item-meta">Height: ${item.height} &bull; ${item.wood}</div>
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
    `).join("");
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
