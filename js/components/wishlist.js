/**
 * TIMBER LIGHT — WISHLIST ENGINE (js/components/wishlist.js)
 * Clean, lightweight wishlist drawer and storage.
 */

window.WishlistEngine = (function() {
  
  let wishlist = []; // array of product IDs

  let drawer = null;
  let itemsContainer = null;
  let navbarBadge = null;

  function init() {
    loadWishlist();

    drawer = document.getElementById("wishlist-drawer-modal");
    itemsContainer = document.getElementById("wishlist-drawer-items");
    navbarBadge = document.getElementById("wishlist-count");

    const trigger = document.getElementById("wishlist-trigger");
    const closeBtn = document.getElementById("wishlist-drawer-close");
    const backdrop = document.getElementById("wishlist-drawer-backdrop");

    if (trigger) trigger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);

    render();
  }

  function loadWishlist() {
    try {
      const saved = localStorage.getItem("timber_wishlist");
      wishlist = saved ? JSON.parse(saved) : [];
    } catch (e) {
      wishlist = [];
    }
  }

  function saveWishlist() {
    try {
      localStorage.setItem("timber_wishlist", JSON.stringify(wishlist));
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

  function isInWishlist(productId) {
    return wishlist.includes(productId);
  }

  function toggleItem(productId) {
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
      if (window.TimberHelpers) TimberHelpers.showToast("Removed from wishlist.", "danger");
    } else {
      wishlist.push(productId);
      if (window.TimberHelpers) TimberHelpers.showToast("Saved to wishlist!", "success");
    }
    saveWishlist();
    render();
  }

  function render() {
    if (navbarBadge) {
      navbarBadge.textContent = wishlist.length;
    }

    if (!itemsContainer) return;

    if (wishlist.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align:center; padding: 3rem 1rem; color:var(--text-muted);">
          <i class="fa-regular fa-heart" style="font-size:2.5rem; margin-bottom:1rem; opacity:0.3;"></i>
          <h4 style="font-size:1.1rem; color:var(--text-main); margin-bottom:0.5rem;">Your wishlist is empty</h4>
          <p style="font-size:0.85rem;">Save your favourite architectural profile luminaires here.</p>
        </div>
      `;
      return;
    }

    const fmt = window.TimberHelpers ? TimberHelpers.formatINR : (n) => `₹${n}`;

    itemsContainer.innerHTML = wishlist.map(id => {
      const p = window.TIMBER_PRODUCTS ? TIMBER_PRODUCTS.find(x => x.id === id) : null;
      if (!p) return '';
      return `
        <div class="cart-item-card">
          <div class="cart-item-thumb">
            <img src="${p.image}" alt="${p.model}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" onerror="this.onerror=null; this.src='images/products/tl_baluster_finial.jpg'">
          </div>
          <div class="cart-item-details">
            <h4>${p.name}</h4>
            <div class="cart-item-meta">Height: ${p.height} &bull; ${p.wood}</div>
            <div class="cart-item-price">${fmt(p.price)}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:flex-end;">
            <button class="cart-item-remove-btn" onclick="WishlistEngine.toggleItem('${p.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
            <button class="btn btn-primary btn-sm" onclick="CartEngine.addItem('${p.id}', 1, event); WishlistEngine.toggleItem('${p.id}');">
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  return {
    init,
    open,
    close,
    isInWishlist,
    toggleItem
  };
})();
