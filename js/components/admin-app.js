/**
 * THE TIMBER LIGHTS — MASTER ADMIN APPLICATION (js/components/admin-app.js)
 * Full control engine: Supabase-backed Catalog, Orders, Leads, Site Settings, Live Queries
 */

(function () {
  'use strict';

  // ───────────────────────────────────────────────────────
  // CONSTANTS
  // ───────────────────────────────────────────────────────
  const DEFAULT_ADMIN = { user: 'admin', pass: 'timber2026' };

  // ───────────────────────────────────────────────────────
  // STATE
  // ───────────────────────────────────────────────────────
  let isAuthenticated = false;
  let currentTab = 'dashboard';
  let realtimeSubs = [];
  let liveQueriesData = [];

  // ───────────────────────────────────────────────────────
  // DOM CACHE
  // ───────────────────────────────────────────────────────
  const loginWrapper = document.getElementById('admin-login-wrapper');
  const loginForm    = document.getElementById('admin-login-form');
  const loginUser    = document.getElementById('admin-user-input');
  const loginPass    = document.getElementById('admin-pass-input');
  const loginError   = document.getElementById('admin-login-error');
  const appRoot      = document.getElementById('admin-app-root');
  const navTabs      = document.querySelectorAll('.admin-nav-item');
  const panes        = document.querySelectorAll('.admin-pane');
  const paneTitle    = document.getElementById('current-pane-title');
  const sidebar      = document.getElementById('admin-sidebar');
  const mobileToggle = document.getElementById('admin-mobile-toggle');
  const prodModal    = document.getElementById('product-edit-modal');
  const prodModalClose = document.getElementById('product-modal-close');
  const prodForm     = document.getElementById('product-edit-form');
  const settingsForm = document.getElementById('site-settings-form');
  const pwdForm      = document.getElementById('change-password-form');

  // ───────────────────────────────────────────────────────
  // DB HELPER (wait until SupabaseDB is ready)
  // ───────────────────────────────────────────────────────
  function db() { return window.SupabaseDB; }

  // ───────────────────────────────────────────────────────
  // AUTH (Supabase Auth JWT)
  // ───────────────────────────────────────────────────────
  function checkAuthSession() {
    if (db() && db().isAuthenticated()) {
      isAuthenticated = true; showApp();
    } else { showLogin(); }
  }

  function showLogin() {
    if (loginWrapper) loginWrapper.style.display = 'flex';
    if (appRoot) appRoot.style.display = 'none';
  }

  function showApp() {
    if (loginWrapper) loginWrapper.style.display = 'none';
    if (appRoot) appRoot.style.display = 'flex';
    loadAllData();
    startRealtimeSubscriptions();
  }

  async function handleLogin(e) {
    e.preventDefault();
    const u = loginUser.value.trim();
    const p = loginPass.value.trim();
    const btn = loginForm ? loginForm.querySelector('[type="submit"]') : null;
    if (btn) { btn.disabled = true; btn.innerHTML = '<span>Signing in...</span> <i class="fa-solid fa-spinner fa-spin"></i>'; }

    const res = await db().signIn(u, p);
    if (btn) { btn.disabled = false; btn.innerHTML = '<span>Sign In to Admin Workspace</span> <i class="fa-solid fa-arrow-right"></i>'; }

    if (res && res.ok) {
      isAuthenticated = true;
      if (loginError) loginError.style.display = 'none';
      showApp();
    } else {
      if (loginError) {
        loginError.textContent = (res && res.error) ? res.error : 'Invalid username or password.';
        loginError.style.display = 'block';
      }
    }
  }

  async function handleLogout() {
    realtimeSubs.forEach(s => s && s.close && s.close());
    realtimeSubs = [];
    if (db() && db().signOut) await db().signOut();
    isAuthenticated = false;
    showLogin();
  }

  // ───────────────────────────────────────────────────────
  // EVENTS
  // ───────────────────────────────────────────────────────
  function attachEvents() {
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    document.querySelectorAll('.admin-logout-btn').forEach(b => b.addEventListener('click', handleLogout));
    navTabs.forEach(t => t.addEventListener('click', () => switchTab(t.getAttribute('data-tab'))));
    if (mobileToggle) mobileToggle.addEventListener('click', () => sidebar && sidebar.classList.toggle('mobile-open'));
    if (prodModalClose) prodModalClose.addEventListener('click', () => prodModal && prodModal.classList.remove('active'));
    if (prodForm) prodForm.addEventListener('submit', saveProduct);
    if (settingsForm) settingsForm.addEventListener('submit', saveSiteSettings);
    if (pwdForm) pwdForm.addEventListener('submit', changePassword);

    const searchInput = document.getElementById('admin-product-search');
    if (searchInput) searchInput.addEventListener('input', (e) => renderProductsTable(e.target.value.toLowerCase()));
    const addBtn = document.getElementById('btn-add-product');
    if (addBtn) addBtn.addEventListener('click', () => openProductModal(null));
  }

  function switchTab(tabName) {
    currentTab = tabName;
    navTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tabName));
    panes.forEach(p => p.classList.toggle('active', p.id === `pane-${tabName}`));
    const titles = {
      dashboard: 'Executive Dashboard', products: 'Catalog & Product Management',
      orders: 'Customer Orders & Deliveries', leads: 'Consultation Leads',
      settings: 'Storefront Content & Hero Settings', security: 'Admin Credentials & Security',
      livedata: 'Live User Activity'
    };
    if (paneTitle) paneTitle.textContent = titles[tabName] || 'Control Panel';
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Always fetch fresh data when switching tabs
    if (isAuthenticated) {
      if (tabName === 'orders') renderOrdersTable();
      else if (tabName === 'leads') renderLeadsTable();
      else if (tabName === 'products') renderProductsTable();
      else if (tabName === 'livedata') loadLiveQueries();
      else if (tabName === 'dashboard') { renderKPIs(); renderOrdersTable(); }
    }
  }

  // ───────────────────────────────────────────────────────
  // LOAD ALL DATA FROM SUPABASE
  // ───────────────────────────────────────────────────────
  async function loadAllData() {
    showLoadingKPIs();
    try {
      await Promise.all([
        renderKPIs(),
        renderProductsTable(),
        renderOrdersTable(),
        renderLeadsTable(),
        populateSiteSettings()
      ]);
    } catch (e) {
      console.error('loadAllData error:', e);
    }
  }

  function showLoadingKPIs() {
    ['kpi-total-revenue','kpi-total-orders','kpi-total-products','kpi-total-leads'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<span class="kpi-loading">Loading...</span>';
    });
  }

  // ───────────────────────────────────────────────────────
  // KPI DASHBOARD
  // ───────────────────────────────────────────────────────
  async function renderKPIs() {
    const [products, orders, leads] = await Promise.all([
      db().select('products'),
      db().select('orders'),
      db().select('leads')
    ]);

    const totalRev = orders.reduce((s, o) => s + (o.totals?.finalTotal || 0), 0);
    const activeOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'In Assembly').length;

    const elRev    = document.getElementById('kpi-total-revenue');
    const elOrders = document.getElementById('kpi-total-orders');
    const elProds  = document.getElementById('kpi-total-products');
    const elLeads  = document.getElementById('kpi-total-leads');

    if (elRev)    elRev.textContent    = `₹${totalRev.toLocaleString('en-IN')}`;
    if (elOrders) elOrders.textContent = `${orders.length} (${activeOrders} Active)`;
    if (elProds)  elProds.textContent  = `${products.length} Models`;
    if (elLeads)  elLeads.textContent  = `${leads.length} Enquiries`;

    const ordersBadge = document.getElementById('orders-nav-badge');
    if (ordersBadge) ordersBadge.textContent = orders.length;
  }

  // ───────────────────────────────────────────────────────
  // PRODUCTS
  // ───────────────────────────────────────────────────────
  async function renderProductsTable(filterQuery = '') {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--adm-text-muted); padding:2rem;">Loading products from Supabase...</td></tr>`;

    let prods = await db().select('products', { order: 'created_at.asc' });

    // If no products in DB yet, seed from local JS data
    if (prods.length === 0 && window.TIMBER_PRODUCTS && window.TIMBER_PRODUCTS.length > 0) {
      await seedProductsToDB();
      prods = await db().select('products', { order: 'created_at.asc' });
    }

    if (filterQuery) {
      prods = prods.filter(p =>
        (p.name  && p.name.toLowerCase().includes(filterQuery)) ||
        (p.model && p.model.toLowerCase().includes(filterQuery)) ||
        (p.wood  && p.wood.toLowerCase().includes(filterQuery))
      );
    }

    if (prods.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--adm-text-muted); padding:2rem;">No products found.</td></tr>`;
      return;
    }

    tbody.innerHTML = prods.map((p) => `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${p.image || 'images/products/tl_baluster_finial.jpg'}" alt="${p.model}" class="product-cell-thumb" onerror="this.src='images/hero_timber_dining.png'">
            <div>
              <span class="product-cell-name">${(p.name || '').split('—')[1] || p.name}</span>
              <span class="product-cell-sku">Model: <strong>${p.model || p.id}</strong> &bull; Height: ${p.height || '18"'}</span>
            </div>
          </div>
        </td>
        <td><span class="status-pill confirmed">Ghana Teak</span></td>
        <td><strong style="color:var(--adm-amber-light);">₹${Number(p.price || 0).toLocaleString('en-IN')}</strong></td>
        <td><span class="status-pill ${(p.stock || 0) > 10 ? 'delivered' : 'pending'}">${p.stock || 20} in stock</span></td>
        <td>
          <button class="action-icon-btn" onclick="window.AdminApp.editProduct('${p.id}')" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="action-icon-btn btn-delete" onclick="window.AdminApp.deleteProduct('${p.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  async function seedProductsToDB() {
    const products = window.TIMBER_PRODUCTS || [];
    if (!products.length) return;
    // Upsert all products
    for (const p of products) {
      await db().upsert('products', {
        id: p.id,
        model: p.model,
        name: p.name,
        height: p.height,
        wood: p.wood || 'Premium Ghana Teak Wood',
        price: p.price,
        price_unit: p.priceUnit || 'MRP (Incl. of all taxes)',
        category: p.category || 'hanging',
        category_label: p.categoryLabel || 'Wooden Hanging Light',
        image: p.image || '',
        page: p.page || 1,
        is_featured: p.isFeatured !== false,
        stock: p.stock || 20,
        rating: p.rating || 5,
        reviews_count: p.reviewsCount || 30,
        size_note: p.sizeNote || 'Size mentioned is net wood size. Bulb will be as per actual.',
        short_desc: p.shortDesc || '',
        features: p.features || [],
        specifications: p.specifications || {}
      }, 'id');
    }
    console.log('[Admin] Seeded', products.length, 'products to Supabase');
  }

  // ───────────────────────────────────────────────────────
  // ORDERS
  // ───────────────────────────────────────────────────────
  async function renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-tbody');
    const dashTbody = document.getElementById('dashboard-recent-orders-tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--adm-text-muted);">Loading orders...</td></tr>`;

    let orders = await db().select('orders', { order: 'created_at.desc' });

    if (orders.length === 0) {
      const emptyRow = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--adm-text-muted);">No orders yet. Orders from the checkout form will appear here live.</td></tr>`;
      if (tbody) tbody.innerHTML = emptyRow;
      if (dashTbody) dashTbody.innerHTML = emptyRow;
      return;
    }

    const esc = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

    const renderRows = (list) => list.map((o) => {
      const c = o.customer || {};
      const fullLocation = [c.address, c.city, c.state].filter(Boolean).join(', ') + (c.pincode ? ` - ${c.pincode}` : '');
      const payLabel = o.payment_method ? String(o.payment_method).toUpperCase() : 'N/A';

      return `
      <tr>
        <td><strong>${esc(o.order_id)}</strong><br><small style="color:var(--adm-text-muted);">${esc(o.date || new Date(o.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }))}</small></td>
        <td>
          <strong>${esc(c.name || 'Customer')}</strong><br>
          <small style="color:var(--adm-amber-light);">
            <i class="fa-solid fa-phone" style="font-size:0.65rem;"></i> ${esc(c.phone || '—')}
            ${c.email ? ` &bull; <a href="mailto:${esc(c.email)}" style="color:var(--adm-amber-light); text-decoration:none;"><i class="fa-solid fa-envelope" style="font-size:0.65rem;"></i> ${esc(c.email)}</a>` : ''}
          </small><br>
          <small style="color:var(--adm-text-muted); display:inline-block; margin-top:0.2rem; line-height:1.35;">
            <i class="fa-solid fa-location-dot" style="font-size:0.65rem;"></i> ${esc(fullLocation || 'Address not provided')}
          </small>
        </td>
        <td><small>${(o.items || []).map(i => `${i.qty || i.quantity || 1}x ${esc(i.name)} (${esc(i.polish || 'Teak')}${i.coating ? ', ' + esc(i.coating) : ''})`).join('<br>') || 'Timber Light'}</small></td>
        <td>
          <strong style="color:var(--adm-amber-light);">₹${Number(o.totals?.finalTotal || 0).toLocaleString('en-IN')}</strong><br>
          <small style="color:var(--adm-text-muted); text-transform:uppercase; font-size:0.68rem;">${esc(payLabel)}</small>
        </td>
        <td>
          <select class="admin-form-select" style="padding:0.3rem 0.5rem; font-size:0.75rem;" onchange="window.AdminApp.changeOrderStatus('${o.id}', this.value)">
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="In Assembly" ${o.status === 'In Assembly' ? 'selected' : ''}>In Assembly</option>
            <option value="Dispatched" ${o.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `; }).join('');

    if (tbody) tbody.innerHTML = renderRows(orders);
    if (dashTbody) dashTbody.innerHTML = renderRows(orders.slice(0, 5));
  }

  async function changeOrderStatus(orderId, newStatus) {
    await db().update('orders', `id=eq.${orderId}`, { status: newStatus, updated_at: new Date().toISOString() });
    renderOrdersTable();
    renderKPIs();
  }

  // ───────────────────────────────────────────────────────
  // LEADS
  // ───────────────────────────────────────────────────────
  async function renderLeadsTable() {
    const tbody = document.getElementById('admin-leads-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--adm-text-muted);">Loading enquiries...</td></tr>`;

    const leads = await db().select('leads', { order: 'created_at.desc' });

    if (leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--adm-text-muted);">No enquiries yet. Contact form submissions will appear here live.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(l => `
      <tr>
        <td><strong>${l.name}</strong><br><small style="color:var(--adm-text-muted);">${new Date(l.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</small></td>
        <td><a href="tel:${l.phone}" style="color:var(--adm-amber-light); text-decoration:none;">${l.phone || '—'}</a><br><small style="color:var(--adm-text-muted);">${l.email || ''}</small></td>
        <td><p style="font-size:0.82rem; line-height:1.4; color:var(--adm-text);">${l.message || 'Consultation requested'}</p></td>
        <td>
          <span class="status-pill delivered">Active Lead</span>
          <button class="action-icon-btn btn-delete" style="margin-top:0.3rem;" onclick="window.AdminApp.deleteLead('${l.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }

  async function deleteLead(id) {
    if (!confirm('Remove this lead?')) return;
    await db().del('leads', `id=eq.${id}`);
    renderLeadsTable();
    renderKPIs();
  }

  // ───────────────────────────────────────────────────────
  // SITE SETTINGS
  // ───────────────────────────────────────────────────────
  async function populateSiteSettings() {
    const rows = await db().select('site_settings', { filter: 'id=eq.1' });
    const s = rows[0] || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('set-hero-title',   s.hero_title   || 'The Timber Lights');
    set('set-hero-tagline', s.hero_tagline || 'Architectural Handcrafted Wooden Lighting • Collection 2026');
    set('set-phone',        s.phone        || '+91 9376177250');
    set('set-email',        s.email        || 'thetimberlight@gmail.com');
    set('set-address',      s.address      || 'Paldi, Ahmedabad, Gujarat, India');
    set('set-banner',       s.banner_text  || '');
  }

  async function saveSiteSettings(e) {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...'; }

    const updated = {
      hero_title:   document.getElementById('set-hero-title')?.value.trim(),
      hero_tagline: document.getElementById('set-hero-tagline')?.value.trim(),
      phone:        document.getElementById('set-phone')?.value.trim(),
      email:        document.getElementById('set-email')?.value.trim(),
      address:      document.getElementById('set-address')?.value.trim(),
      banner_text:  document.getElementById('set-banner')?.value.trim(),
      updated_at:   new Date().toISOString()
    };

    await db().update('site_settings', 'id=eq.1', updated);

    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save & Apply Live to Website'; }
    showAdminToast('Site settings saved to Supabase! Live on storefront. ✓', 'success');
  }

  // ───────────────────────────────────────────────────────
  // PASSWORD CHANGE (Supabase Auth)
  // ───────────────────────────────────────────────────────
  async function changePassword(e) {
    e.preventDefault();
    const newP = document.getElementById('pwd-new')?.value.trim();
    if (!newP || newP.length < 6) {
      showAdminToast('New password must be at least 6 characters.', 'danger');
      return;
    }
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...'; }

    const res = await db().updatePassword(newP);
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-key"></i> Update Password'; }

    if (res && res.ok) {
      showAdminToast('Supabase Auth password updated successfully! ✓', 'success');
      e.target.reset();
    } else {
      showAdminToast((res && res.error) || 'Failed to update password.', 'danger');
    }
  }

  // ───────────────────────────────────────────────────────
  // PRODUCT MODAL (EDIT / CREATE)
  // ───────────────────────────────────────────────────────
  async function openProductModal(prodId) {
    const modalTitle = document.getElementById('modal-product-title');
    if (prodId) {
      const rows = await db().select('products', { filter: `id=eq.${prodId}` });
      const p = rows[0];
      if (!p) return;
      if (modalTitle) modalTitle.textContent = `Edit Model: ${p.model}`;
      document.getElementById('edit-prod-id').value    = p.id;
      document.getElementById('edit-prod-model').value = p.model || '';
      document.getElementById('edit-prod-name').value  = p.name  || '';
      document.getElementById('edit-prod-height').value = p.height || '18"';
      document.getElementById('edit-prod-price').value  = p.price  || 19500;
      document.getElementById('edit-prod-stock').value  = p.stock  || 20;
      document.getElementById('edit-prod-image').value  = p.image  || '';
      document.getElementById('edit-prod-desc').value   = p.short_desc || '';
    } else {
      if (modalTitle) modalTitle.textContent = 'Add New Timber Light Model';
      const newId = 'tl_custom_' + Date.now().toString(36);
      document.getElementById('edit-prod-id').value     = newId;
      document.getElementById('edit-prod-model').value  = 'TL-NEW' + Math.floor(Math.random() * 90 + 10);
      document.getElementById('edit-prod-name').value   = 'The Timber Lights — Architectural Pendant';
      document.getElementById('edit-prod-height').value = '20"';
      document.getElementById('edit-prod-price').value  = '21000';
      document.getElementById('edit-prod-stock').value  = '15';
      document.getElementById('edit-prod-image').value  = 'images/products/tl_baluster_finial.jpg';
      document.getElementById('edit-prod-desc').value   = 'Handcrafted Solid Ghana Teak Wood signature hanging light.';
    }
    if (prodModal) prodModal.classList.add('active');
  }

  async function saveProduct(e) {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...'; }

    const id     = document.getElementById('edit-prod-id').value;
    const model  = document.getElementById('edit-prod-model').value.trim();
    const name   = document.getElementById('edit-prod-name').value.trim();
    const height = document.getElementById('edit-prod-height').value.trim();
    const price  = Number(document.getElementById('edit-prod-price').value);
    const stock  = Number(document.getElementById('edit-prod-stock').value);
    const image  = document.getElementById('edit-prod-image').value.trim();
    const desc   = document.getElementById('edit-prod-desc').value.trim();

    const productObj = {
      id, model, name, height,
      wood: 'Premium Ghana Teak Wood',
      price, price_unit: 'MRP (Incl. of all taxes)',
      category: 'hanging', category_label: 'Wooden Hanging Light',
      image: image || 'images/products/tl_baluster_finial.jpg',
      page: 1, is_featured: true, stock,
      rating: 5, reviews_count: 30,
      size_note: 'Size mentioned is net wood size. Bulb will be as per actual.',
      short_desc: desc,
      features: [
        'Artisan lathe-turned solid Ghana Teak silhouette',
        'Net Wood Height: ' + height,
        'Available in 8 Wood Polish Colors',
        'Coating Options: Laquer, Melamine, PU, Wax (Matt / Semi / Glossy)',
        '3-Year Comprehensive Craftsmanship Warranty'
      ],
      specifications: {
        'Model Number': model, 'Height': height,
        'Wood Material': 'Premium Ghana Teak Wood',
        'MRP': '₹' + price.toLocaleString('en-IN')
      },
      updated_at: new Date().toISOString()
    };

    await db().upsert('products', productObj, 'id');

    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i> Save Product Model'; }
    if (prodModal) prodModal.classList.remove('active');
    showAdminToast(`Model ${model} saved to Supabase! ✓`, 'success');
    renderProductsTable();
    renderKPIs();
  }

  async function deleteProduct(prodId) {
    if (!confirm('Remove this model from the catalog?')) return;
    await db().del('products', `id=eq.${prodId}`);
    renderProductsTable();
    renderKPIs();
  }

  // ───────────────────────────────────────────────────────
  // LIVE USER QUERIES (REALTIME)
  // ───────────────────────────────────────────────────────
  async function loadLiveQueries() {
    const pane = document.getElementById('live-queries-list');
    if (!pane) return;
    // Load last 50 queries
    const queries = await db().select('user_queries', { order: 'created_at.desc', limit: 50 });
    liveQueriesData = queries;
    renderLiveQueriesList();
  }

  function renderLiveQueriesList() {
    const pane = document.getElementById('live-queries-list');
    if (!pane) return;

    if (!liveQueriesData.length) {
      pane.innerHTML = `
        <div style="text-align:center; padding:3rem; color:var(--adm-text-muted);">
          <i class="fa-solid fa-wave-square" style="font-size:2rem; display:block; margin-bottom:1rem; opacity:0.3;"></i>
          <p>No user activity yet. Activity from the live website will appear here in real time.</p>
        </div>`;
      return;
    }

    const typeIcon = {
      'search': 'fa-magnifying-glass',
      'product_view': 'fa-eye',
      'cart_add': 'fa-cart-plus',
      'wishlist_add': 'fa-heart',
      'checkout': 'fa-bag-shopping',
      'contact': 'fa-envelope',
      'page_visit': 'fa-globe',
      'filter': 'fa-filter'
    };
    const typeColor = {
      'search': '#60a5fa',
      'product_view': '#a78bfa',
      'cart_add': '#34d399',
      'wishlist_add': '#f87171',
      'checkout': '#D4A853',
      'contact': '#fbbf24',
      'page_visit': '#94a3b8',
      'filter': '#67e8f9'
    };

    // Update stats
    const statMap = { product_view: 'stat-product-views', search: 'stat-searches', cart_add: 'stat-cart-adds', checkout: 'stat-checkouts', contact: 'stat-contacts' };
    Object.entries(statMap).forEach(([type, id]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = liveQueriesData.filter(q => q.query_type === type).length;
    });

    // Reset badge
    const badge = document.getElementById('live-queries-badge');
    if (badge && currentTab === 'livedata') { badge.style.display = 'none'; badge.textContent = '0'; }

    pane.innerHTML = liveQueriesData.map(q => {
      const icon  = typeIcon[q.query_type]  || 'fa-circle-dot';
      const color = typeColor[q.query_type] || 'var(--adm-text-muted)';
      const time  = new Date(q.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const date  = new Date(q.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const label = q.query_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      return `
        <div class="live-query-row" style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem 1rem; border-bottom:1px solid var(--adm-border); animation:fadeSlideIn 0.3s ease;">
          <div style="width:32px; height:32px; border-radius:50%; background:${color}22; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:0.1rem;">
            <i class="fa-solid ${icon}" style="color:${color}; font-size:0.75rem;"></i>
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">
              <span style="font-size:0.72rem; font-weight:700; color:${color}; text-transform:uppercase; letter-spacing:0.05em;">${label}</span>
              <span style="font-size:0.68rem; color:var(--adm-text-muted);">${date} ${time}</span>
            </div>
            ${q.query_text ? `<p style="font-size:0.82rem; color:var(--adm-text); margin:0 0 0.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">"${q.query_text}"</p>` : ''}
            ${q.product_name ? `<p style="font-size:0.78rem; color:var(--adm-amber-light); margin:0;"><i class="fa-solid fa-lightbulb" style="font-size:0.65rem;"></i> ${q.product_name}</p>` : ''}
            <p style="font-size:0.68rem; color:var(--adm-text-muted); margin:0.1rem 0 0;">Session: ${q.session_id || '—'}</p>
          </div>
        </div>`;
    }).join('');
  }

  function startRealtimeSubscriptions() {
    // Subscribe to new user_queries
    const sub1 = db().subscribeRealtime('user_queries', (payload) => {
      if (payload.type === 'INSERT') {
        liveQueriesData.unshift(payload.record);
        if (liveQueriesData.length > 100) liveQueriesData.pop();
        renderLiveQueriesList();
        // Update badge
        const badge = document.getElementById('live-queries-badge');
        if (badge && currentTab !== 'livedata') {
          const count = parseInt(badge.textContent || '0') + 1;
          badge.textContent = count;
          badge.style.display = 'inline-flex';
        }
      }
    });

    // Subscribe to new leads
    const sub2 = db().subscribeRealtime('leads', (payload) => {
      if (payload.type === 'INSERT') {
        renderLeadsTable();
        renderKPIs();
        showAdminToast(`New inquiry from ${payload.record?.name || 'visitor'}! 🔔`, 'success');
      }
    });

    // Subscribe to new orders
    const sub3 = db().subscribeRealtime('orders', (payload) => {
      if (payload.type === 'INSERT') {
        renderOrdersTable();
        renderKPIs();
        showAdminToast(`New order placed: ${payload.record?.order_id || ''}! 🎉`, 'success');
      }
    });

    realtimeSubs = [sub1, sub2, sub3];

    // Also load initial queries
    loadLiveQueries();
  }

  // ───────────────────────────────────────────────────────
  // ADMIN TOAST
  // ───────────────────────────────────────────────────────
  function showAdminToast(msg, type) {
    const existing = document.getElementById('admin-toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'admin-toast-notification';
    const bg = type === 'success' ? '#16a34a' : type === 'danger' ? '#dc2626' : '#D4A853';
    toast.style.cssText = `position:fixed; bottom:1.5rem; right:1.5rem; background:${bg}; color:#fff; padding:0.75rem 1.25rem; border-radius:0.5rem; font-size:0.85rem; font-weight:600; z-index:99999; box-shadow:0 4px 20px rgba(0,0,0,0.3); animation:fadeSlideIn 0.3s ease;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
  }

  // ───────────────────────────────────────────────────────
  // INIT
  // ───────────────────────────────────────────────────────
  function init() {
    checkAuthSession();
    attachEvents();
  }

  // Global API
  window.AdminApp = {
    editProduct: openProductModal,
    deleteProduct: deleteProduct,
    changeOrderStatus: changeOrderStatus,
    deleteLead: deleteLead,
    switchTab: switchTab,
    loadLiveQueries: loadLiveQueries,
    refreshOrders: () => { renderOrdersTable(); renderKPIs(); }
  };

  // Add animation keyframes if not present
  if (!document.getElementById('admin-anim-style')) {
    const style = document.createElement('style');
    style.id = 'admin-anim-style';
    style.textContent = `
      @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      .kpi-loading { opacity:0.5; font-size:0.8rem; }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
