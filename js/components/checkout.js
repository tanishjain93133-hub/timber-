/**
 * TIMBER LIGHT — CHECKOUT ENGINE (js/components/checkout.js)
 * Clean, lightweight checkout modal with shipping form, payment options, and order summary.
 */

window.CheckoutEngine = (function() {
  
  let modal = null;
  let form = null;
  let summaryItems = null;
  let subtotalEl = null;
  let totalEl = null;
  let closeBtn = null;

  function init() {
    modal = document.getElementById("checkout-modal");
    form = document.getElementById("checkout-form");
    summaryItems = document.getElementById("checkout-items-summary");
    subtotalEl = document.getElementById("chk-subtotal");
    totalEl = document.getElementById("chk-total");
    closeBtn = document.getElementById("checkout-modal-close");

    if (closeBtn) closeBtn.addEventListener("click", close);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }

    if (form) {
      form.addEventListener("submit", handleCheckoutSubmit);
    }
  }

  function open() {
    if (!modal) return;
    renderSummary();
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

  function renderSummary() {
    if (!window.CartEngine) return;
    const summary = CartEngine.getCartSummary();
    const fmt = window.TimberHelpers ? TimberHelpers.formatINR : (n) => `₹${n}`;

    if (subtotalEl) subtotalEl.textContent = fmt(summary.subtotal);
    if (totalEl) totalEl.textContent = fmt(summary.total);

    if (summaryItems) {
      summaryItems.innerHTML = summary.items.map(item => `
        <div class="summary-item-row">
          <span>${item.name} &times; ${item.quantity}</span>
          <strong>${fmt(item.itemTotal)}</strong>
        </div>
      `).join("");
    }
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("chk-name")?.value.trim();
    const phone = document.getElementById("chk-phone")?.value.trim();
    const email = document.getElementById("chk-email")?.value.trim();
    const address = document.getElementById("chk-address")?.value.trim();
    const city = document.getElementById("chk-city")?.value.trim();
    const pincode = document.getElementById("chk-pincode")?.value.trim();

    if (!name || !phone || !email || !address || !city || !pincode) {
      if (window.TimberHelpers) TimberHelpers.showToast("Please complete all shipping details.", "danger");
      return;
    }

    const orderId = `TL-${Math.floor(100000 + Math.random() * 900000)}`;

    if (window.CartEngine) CartEngine.clearCart();
    close();

    if (window.TimberHelpers) {
      TimberHelpers.playTactileSound("light-on");
      TimberHelpers.showToast(`Order #${orderId} placed successfully! Invoice sent to ${email}.`, "success");
    }

    if (form) form.reset();
  }

  return {
    init,
    open,
    close
  };
})();
