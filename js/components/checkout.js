/**
 * TIMBER LIGHT — CHECKOUT ENGINE (js/components/checkout.js)
 * Saves orders to Supabase + local user order history + logs query activity
 */

window.CheckoutEngine = (function () {

  let modal        = null;
  let form         = null;
  let summaryItems = null;
  let subtotalEl   = null;
  let totalEl      = null;
  let closeBtn     = null;

  function init() {
    modal        = document.getElementById('checkout-modal');
    form         = document.getElementById('checkout-form');
    summaryItems = document.getElementById('checkout-items-summary');
    subtotalEl   = document.getElementById('chk-subtotal');
    totalEl      = document.getElementById('chk-total');
    closeBtn     = document.getElementById('checkout-modal-close');

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    if (form)  form.addEventListener('submit', handleCheckoutSubmit);
  }

  function open() {
    if (!modal) return;
    renderSummary();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (window.SupabaseDB) {
      SupabaseDB.logQuery('checkout', 'Checkout modal opened', null, null);
    }
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderSummary() {
    if (!window.CartEngine) return;
    const summary = CartEngine.getCartSummary();
    const fmt = window.TimberHelpers ? TimberHelpers.formatINR : (n) => `₹${n}`;
    if (subtotalEl) subtotalEl.textContent = fmt(summary.subtotal);
    if (totalEl)    totalEl.textContent    = fmt(summary.total);
    if (summaryItems) {
      summaryItems.innerHTML = summary.items.map(item => `
        <div class="summary-item-row">
          <span>${item.name} &times; ${item.quantity} <small style="color:var(--text-muted);">(${item.polish || 'Teak'})</small></span>
          <strong>${fmt(item.itemTotal)}</strong>
        </div>
      `).join('');
    }
  }

  function saveLocalOrder(orderData) {
    try {
      const existing = JSON.parse(localStorage.getItem('timber_my_orders') || '[]');
      existing.unshift(orderData);
      localStorage.setItem('timber_my_orders', JSON.stringify(existing.slice(0, 30)));
    } catch (e) {}
  }

  async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name     = document.getElementById('chk-name')?.value.trim();
    const phone    = document.getElementById('chk-phone')?.value.trim();
    const email    = document.getElementById('chk-email')?.value.trim();
    const address  = document.getElementById('chk-address')?.value.trim();
    const city     = document.getElementById('chk-city')?.value.trim();
    const state    = document.getElementById('chk-state')?.value.trim();
    const pincode  = document.getElementById('chk-pincode')?.value.trim();
    const payment  = document.querySelector('input[name="payment-method"]:checked')?.value || 'upi';

    if (!name || !phone || !email || !address || !city || !pincode) {
      if (window.TimberHelpers) TimberHelpers.showToast('Please complete all shipping details.', 'danger');
      return;
    }

    const summary = window.CartEngine ? CartEngine.getCartSummary() : { items: [], subtotal: 0, total: 0 };
    if (!summary.items || summary.items.length === 0) {
      if (window.TimberHelpers) TimberHelpers.showToast('Your cart is empty. Please add a product first.', 'danger');
      return;
    }

    const submitBtn = form ? form.querySelector('[type="submit"]') : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Placing Order...';
    }

    const orderId = `TL-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderData = {
      order_id: orderId,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Confirmed',
      customer: { name, phone, email, address, city, state, pincode },
      items: summary.items.map(i => ({
        id: i.id,
        model: i.model,
        name: i.name,
        qty: i.quantity,
        price: i.price,
        polish: i.polish || 'Teak',
        coating: `${i.coating || 'PU'} ${i.tone || 'Matt'}`
      })),
      totals: { subtotal: summary.subtotal, finalTotal: summary.total },
      payment_method: payment
    };

    let savedToDb = false;
    if (window.SupabaseDB) {
      try {
        const res = await SupabaseDB.insert('orders', orderData, { returning: false });
        if (res) {
          savedToDb = true;
          const itemNames = orderData.items.map(i => `${i.qty}x ${i.model || i.name}`).join(', ');
          SupabaseDB.logQuery('checkout', `Order #${orderId} (${payment.toUpperCase()})`, orderData.items[0]?.id || null, itemNames);
        }
      } catch (err) {
        console.error('Order save error:', err);
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }

    if (window.SupabaseDB && !savedToDb) {
      if (window.TimberHelpers) {
        TimberHelpers.showToast('Could not save order to server. Please try again.', 'danger');
      }
      return;
    }

    saveLocalOrder(orderData);
    if (window.CartEngine) CartEngine.clearCart();
    close();

    if (window.TimberHelpers) {
      TimberHelpers.playTactileSound && TimberHelpers.playTactileSound('light-on');
      TimberHelpers.showToast(`Order #${orderId} placed! View it anytime in My Account.`, 'success');
    }
    if (form) form.reset();
  }

  return { init, open, close };
})();
