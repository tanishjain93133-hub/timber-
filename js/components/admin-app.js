/**
 * THE TIMBER LIGHTS — MASTER ADMIN APPLICATION SCRIPT (js/components/admin-app.js)
 * Full control engine for Catalog, Stock, Orders, Inquiries, Site Settings, and Authentication
 */

(function() {
  'use strict';

  // Default credentials
  const DEFAULT_ADMIN = {
    user: "admin",
    pass: "timber2026"
  };

  // State
  let isAuthenticated = false;
  let currentTab = "dashboard";

  // Cache Elements
  const loginWrapper = document.getElementById("admin-login-wrapper");
  const loginForm = document.getElementById("admin-login-form");
  const loginUser = document.getElementById("admin-user-input");
  const loginPass = document.getElementById("admin-pass-input");
  const loginError = document.getElementById("admin-login-error");

  const appRoot = document.getElementById("admin-app-root");
  const navTabs = document.querySelectorAll(".admin-nav-item");
  const panes = document.querySelectorAll(".admin-pane");
  const paneTitle = document.getElementById("current-pane-title");

  // Mobile sidebar
  const sidebar = document.getElementById("admin-sidebar");
  const mobileToggle = document.getElementById("admin-mobile-toggle");

  // Product modal elements
  const prodModal = document.getElementById("product-edit-modal");
  const prodModalClose = document.getElementById("product-modal-close");
  const prodForm = document.getElementById("product-edit-form");

  // Settings elements
  const settingsForm = document.getElementById("site-settings-form");
  const pwdForm = document.getElementById("change-password-form");

  // Initialize
  function init() {
    checkAuthSession();
    attachEvents();
    if (isAuthenticated) {
      loadAllData();
    }
  }

  function getStoredCredentials() {
    try {
      const stored = localStorage.getItem("timber_admin_creds");
      return stored ? JSON.parse(stored) : DEFAULT_ADMIN;
    } catch(e) {
      return DEFAULT_ADMIN;
    }
  }

  function checkAuthSession() {
    const sessionToken = sessionStorage.getItem("timber_admin_auth");
    if (sessionToken === "true") {
      isAuthenticated = true;
      showApp();
    } else {
      isAuthenticated = false;
      showLogin();
    }
  }

  function showLogin() {
    if (loginWrapper) loginWrapper.style.display = "flex";
    if (appRoot) appRoot.style.display = "none";
  }

  function showApp() {
    if (loginWrapper) loginWrapper.style.display = "none";
    if (appRoot) appRoot.style.display = "flex";
    loadAllData();
  }

  function handleLogin(e) {
    e.preventDefault();
    const u = loginUser.value.trim();
    const p = loginPass.value.trim();
    const creds = getStoredCredentials();

    if (u === creds.user && p === creds.pass) {
      isAuthenticated = true;
      sessionStorage.setItem("timber_admin_auth", "true");
      if (loginError) loginError.style.display = "none";
      showApp();
    } else {
      if (loginError) {
        loginError.textContent = "Invalid username or password. Please try again.";
        loginError.style.display = "block";
      }
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("timber_admin_auth");
    isAuthenticated = false;
    showLogin();
  }

  function attachEvents() {
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    document.querySelectorAll(".admin-logout-btn").forEach(btn => {
      btn.addEventListener("click", handleLogout);
    });

    navTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const tabName = tab.getAttribute("data-tab");
        switchTab(tabName);
      });
    });

    if (mobileToggle) {
      mobileToggle.addEventListener("click", () => {
        if (sidebar) sidebar.classList.toggle("mobile-open");
      });
    }

    // Modal close
    if (prodModalClose) {
      prodModalClose.addEventListener("click", () => {
        if (prodModal) prodModal.classList.remove("active");
      });
    }

    if (prodForm) prodForm.addEventListener("submit", saveProduct);
    if (settingsForm) settingsForm.addEventListener("submit", saveSiteSettings);
    if (pwdForm) pwdForm.addEventListener("submit", changePassword);

    // Search bar
    const searchInput = document.getElementById("admin-product-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        renderProductsTable(e.target.value.toLowerCase());
      });
    }

    // Add product trigger
    const addBtn = document.getElementById("btn-add-product");
    if (addBtn) {
      addBtn.addEventListener("click", () => openProductModal(null));
    }
  }

  function switchTab(tabName) {
    currentTab = tabName;
    navTabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-tab") === tabName));
    panes.forEach(p => p.classList.toggle("active", p.id === `pane-${tabName}`));

    const titles = {
      "dashboard": "Executive Dashboard",
      "products": "Catalog & Product Management",
      "orders": "Customer Orders & Deliveries",
      "leads": "Architectural Consultation Leads",
      "settings": "Storefront Content & Hero Settings",
      "security": "Admin Credentials & Security"
    };

    if (paneTitle) paneTitle.textContent = titles[tabName] || "Control Panel";
    if (sidebar) sidebar.classList.remove("mobile-open");
  }

  // --- DATA MANAGEMENT ---
  function getProducts() {
    try {
      const stored = localStorage.getItem("timber_products_v2");
      if (stored) return JSON.parse(stored);
      if (window.TIMBER_PRODUCTS) {
        localStorage.setItem("timber_products_v2", JSON.stringify(window.TIMBER_PRODUCTS));
        return window.TIMBER_PRODUCTS;
      }
      return [];
    } catch(e) {
      return window.TIMBER_PRODUCTS || [];
    }
  }

  function saveProducts(prods) {
    localStorage.setItem("timber_products_v2", JSON.stringify(prods));
    window.TIMBER_PRODUCTS = prods;
    loadAllData();
  }

  function getOrders() {
    try {
      const stored = localStorage.getItem("timber_all_orders_v1");
      if (stored) return JSON.parse(stored);
      // Sample defaults
      const sampleOrders = [
        {
          orderId: "TL-2026-9041",
          date: "29 Sep 2026",
          status: "Confirmed",
          customer: { name: "Ar. Rohan Varma", phone: "+91 98201 55432", email: "rohan@varma-architects.com", city: "Mumbai, MH" },
          items: [{ name: "TL-BAL18 Baluster Finial Pendant", qty: 2, polish: "Walnut", coating: "PU Matt", price: 19500 }],
          totals: { finalTotal: 39000 }
        },
        {
          orderId: "TL-2026-8812",
          date: "27 Sep 2026",
          status: "In Assembly",
          customer: { name: "Meera Sen (Villa 14)", phone: "+91 99340 11289", email: "meera.sen@gmail.com", city: "Bengaluru, KA" },
          items: [{ name: "TL-WBD20 Walnut Totem Pendant", qty: 4, polish: "Teak", coating: "Melamine Semi", price: 22000 }],
          totals: { finalTotal: 88000 }
        },
        {
          orderId: "TL-2026-7640",
          date: "25 Sep 2026",
          status: "Dispatched",
          customer: { name: "Studio Matrix Design", phone: "+91 98110 44321", email: "matrix@designstudio.in", city: "New Delhi, DL" },
          items: [{ name: "TL-CHAN54 Slotted Linear Beam", qty: 1, polish: "Oak", coating: "PU Glossy", price: 34500 }],
          totals: { finalTotal: 34500 }
        }
      ];
      localStorage.setItem("timber_all_orders_v1", JSON.stringify(sampleOrders));
      return sampleOrders;
    } catch(e) {
      return [];
    }
  }

  function getLeads() {
    try {
      const stored = localStorage.getItem("timber_consult_leads");
      if (stored) return JSON.parse(stored);
      const sampleLeads = [
        { name: "Ananya Mehta", phone: "+91 94250 88712", email: "ananya@mehta-interiors.com", date: "29 Sep 2026", message: "Need Ghana Teak hanging lights for 5 luxury penthouses in Ahmedabad." },
        { name: "Vikramaditya Singhania", phone: "+91 98210 33499", email: "vikram@singhaniagroup.in", date: "28 Sep 2026", message: "Enquiry for customized 54-inch linear beam for hotel reception." }
      ];
      localStorage.setItem("timber_consult_leads", JSON.stringify(sampleLeads));
      return sampleLeads;
    } catch(e) {
      return [];
    }
  }

  function getSiteSettings() {
    try {
      const stored = localStorage.getItem("timber_site_settings");
      if (stored) return JSON.parse(stored);
      const defaults = {
        heroTitle: "The Timber Lights",
        heroTagline: "Architectural Handcrafted Wooden Lighting • Collection 2026",
        phone: "+91 9376177250",
        email: "thetimberlight@gmail.com",
        address: "Paldi, Ahmedabad, Gujarat, India",
        bannerText: "Collection 2026 • 25 Signature Ghanaian Teak Wood Lighting Fixtures"
      };
      localStorage.setItem("timber_site_settings", JSON.stringify(defaults));
      return defaults;
    } catch(e) {
      return {};
    }
  }

  function loadAllData() {
    renderKPIs();
    renderProductsTable();
    renderOrdersTable();
    renderLeadsTable();
    populateSiteSettings();
  }

  function renderKPIs() {
    const prods = getProducts();
    const orders = getOrders();
    const leads = getLeads();

    const totalRev = orders.reduce((sum, o) => sum + (o.totals?.finalTotal || 0), 0);
    const activeProds = prods.length;
    const pendingOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'In Assembly').length;

    const elRev = document.getElementById("kpi-total-revenue");
    const elOrders = document.getElementById("kpi-total-orders");
    const elProds = document.getElementById("kpi-total-products");
    const elLeads = document.getElementById("kpi-total-leads");

    if (elRev) elRev.textContent = `₹${totalRev.toLocaleString('en-IN')}`;
    if (elOrders) elOrders.textContent = `${orders.length} (${pendingOrders} Active)`;
    if (elProds) elProds.textContent = `${activeProds} Models`;
    if (elLeads) elLeads.textContent = `${leads.length} Enquiries`;
  }

  function renderProductsTable(filterQuery = "") {
    const tbody = document.getElementById("admin-products-tbody");
    if (!tbody) return;

    let prods = getProducts();
    if (filterQuery) {
      prods = prods.filter(p => 
        (p.name && p.name.toLowerCase().includes(filterQuery)) ||
        (p.model && p.model.toLowerCase().includes(filterQuery)) ||
        (p.wood && p.wood.toLowerCase().includes(filterQuery))
      );
    }

    tbody.innerHTML = prods.map((p, idx) => `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${p.image || 'images/products/tl_baluster_finial.jpg'}" alt="${p.model}" class="product-cell-thumb" onerror="this.src='images/hero_timber_dining.png'">
            <div>
              <span class="product-cell-name">${p.name.split('—')[1] || p.name}</span>
              <span class="product-cell-sku">Model: <strong>${p.model || 'TL-' + idx}</strong> &bull; Height: ${p.height || '18"'}</span>
            </div>
          </div>
        </td>
        <td><span class="status-pill confirmed">Ghana Teak</span></td>
        <td><strong style="color:var(--adm-amber-light);">₹${Number(p.price).toLocaleString('en-IN')}</strong></td>
        <td><span class="status-pill ${p.stock > 10 ? 'delivered' : 'pending'}">${p.stock || 20} in stock</span></td>
        <td>
          <button class="action-icon-btn" onclick="window.AdminApp.editProduct('${p.id}')" title="Edit Model"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="action-icon-btn btn-delete" onclick="window.AdminApp.deleteProduct('${p.id}')" title="Delete Model"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join("");
  }

  function renderOrdersTable() {
    const tbody = document.getElementById("admin-orders-tbody");
    if (!tbody) return;

    const orders = getOrders();
    tbody.innerHTML = orders.map((o, idx) => `
      <tr>
        <td><strong>${o.orderId}</strong><br><small style="color:var(--adm-text-muted);">${o.date}</small></td>
        <td>
          <strong>${o.customer?.name || 'Customer'}</strong><br>
          <small style="color:var(--adm-text-muted);">${o.customer?.phone || ''} &bull; ${o.customer?.city || ''}</small>
        </td>
        <td>
          <small>${o.items?.map(i => `${i.qty}x ${i.name} (${i.polish || 'Teak'})`).join('<br>') || 'Timber Light'}</small>
        </td>
        <td><strong style="color:var(--adm-amber-light);">₹${Number(o.totals?.finalTotal || 0).toLocaleString('en-IN')}</strong></td>
        <td>
          <select class="admin-form-select" style="padding:0.3rem 0.5rem; font-size:0.75rem;" onchange="window.AdminApp.changeOrderStatus(${idx}, this.value)">
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="In Assembly" ${o.status === 'In Assembly' ? 'selected' : ''}>In Assembly</option>
            <option value="Dispatched" ${o.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `).join("");
  }

  function renderLeadsTable() {
    const tbody = document.getElementById("admin-leads-tbody");
    if (!tbody) return;

    const leads = getLeads();
    tbody.innerHTML = leads.map(l => `
      <tr>
        <td><strong>${l.name}</strong><br><small style="color:var(--adm-text-muted);">${l.date || 'Recent'}</small></td>
        <td><a href="tel:${l.phone}" style="color:var(--adm-amber-light); text-decoration:none;">${l.phone}</a><br><small style="color:var(--adm-text-muted);">${l.email}</small></td>
        <td><p style="font-size:0.82rem; line-height:1.4; color:var(--adm-text);">${l.message || 'Consultation requested'}</p></td>
        <td><span class="status-pill delivered">Active Lead</span></td>
      </tr>
    `).join("");
  }

  function populateSiteSettings() {
    const s = getSiteSettings();
    if (document.getElementById("set-hero-title")) document.getElementById("set-hero-title").value = s.heroTitle || "";
    if (document.getElementById("set-hero-tagline")) document.getElementById("set-hero-tagline").value = s.heroTagline || "";
    if (document.getElementById("set-phone")) document.getElementById("set-phone").value = s.phone || "";
    if (document.getElementById("set-email")) document.getElementById("set-email").value = s.email || "";
    if (document.getElementById("set-address")) document.getElementById("set-address").value = s.address || "";
    if (document.getElementById("set-banner")) document.getElementById("set-banner").value = s.bannerText || "";
  }

  function saveSiteSettings(e) {
    e.preventDefault();
    const updated = {
      heroTitle: document.getElementById("set-hero-title").value.trim(),
      heroTagline: document.getElementById("set-hero-tagline").value.trim(),
      phone: document.getElementById("set-phone").value.trim(),
      email: document.getElementById("set-email").value.trim(),
      address: document.getElementById("set-address").value.trim(),
      bannerText: document.getElementById("set-banner").value.trim()
    };
    localStorage.setItem("timber_site_settings", JSON.stringify(updated));
    alert("Site Settings saved successfully! Changes are live on the storefront.");
  }

  function changePassword(e) {
    e.preventDefault();
    const oldP = document.getElementById("pwd-current").value.trim();
    const newP = document.getElementById("pwd-new").value.trim();
    const creds = getStoredCredentials();

    if (oldP !== creds.pass) {
      alert("Current password does not match.");
      return;
    }
    if (newP.length < 4) {
      alert("New password must be at least 4 characters.");
      return;
    }

    creds.pass = newP;
    localStorage.setItem("timber_admin_creds", JSON.stringify(creds));
    alert("Admin password updated successfully!");
    e.target.reset();
  }

  function openProductModal(prodId) {
    const prods = getProducts();
    const modalTitle = document.getElementById("modal-product-title");

    if (prodId) {
      const p = prods.find(item => item.id === prodId);
      if (!p) return;
      if (modalTitle) modalTitle.textContent = `Edit Model: ${p.model}`;
      document.getElementById("edit-prod-id").value = p.id;
      document.getElementById("edit-prod-model").value = p.model || "";
      document.getElementById("edit-prod-name").value = p.name || "";
      document.getElementById("edit-prod-height").value = p.height || "18\"";
      document.getElementById("edit-prod-price").value = p.price || 19500;
      document.getElementById("edit-prod-stock").value = p.stock || 20;
      document.getElementById("edit-prod-image").value = p.image || "";
      document.getElementById("edit-prod-desc").value = p.shortDesc || "";
    } else {
      if (modalTitle) modalTitle.textContent = "Add New Timber Light Model";
      document.getElementById("edit-prod-id").value = "tl_custom_" + Date.now().toString(36);
      document.getElementById("edit-prod-model").value = "TL-NEW" + Math.floor(Math.random() * 90 + 10);
      document.getElementById("edit-prod-name").value = "The Timber Lights — Architectural Pendant";
      document.getElementById("edit-prod-height").value = "20\"";
      document.getElementById("edit-prod-price").value = "21000";
      document.getElementById("edit-prod-stock").value = "15";
      document.getElementById("edit-prod-image").value = "images/products/tl_baluster_finial.jpg";
      document.getElementById("edit-prod-desc").value = "Handcrafted Solid Ghana Teak Wood signature hanging light.";
    }

    if (prodModal) prodModal.classList.add("active");
  }

  function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById("edit-prod-id").value;
    const model = document.getElementById("edit-prod-model").value.trim();
    const name = document.getElementById("edit-prod-name").value.trim();
    const height = document.getElementById("edit-prod-height").value.trim();
    const price = Number(document.getElementById("edit-prod-price").value);
    const stock = Number(document.getElementById("edit-prod-stock").value);
    const image = document.getElementById("edit-prod-image").value.trim();
    const desc = document.getElementById("edit-prod-desc").value.trim();

    const prods = getProducts();
    const existingIdx = prods.findIndex(p => p.id === id);

    const productObj = {
      id: id,
      model: model,
      name: name,
      height: height,
      wood: "Premium Ghana Teak Wood",
      price: price,
      priceUnit: "MRP (Incl. of all taxes)",
      category: "hanging",
      categoryLabel: "Wooden Hanging Light",
      image: image || "images/products/tl_baluster_finial.jpg",
      page: 1,
      isFeatured: true,
      stock: stock,
      rating: 5,
      reviewsCount: 30,
      sizeNote: "Size mentioned is net wood size. Bulb will be as per actual.",
      shortDesc: desc,
      features: [
        "Artisan lathe-turned solid Ghana Teak silhouette",
        "Net Wood Height: " + height,
        "Available in 8 Wood Polish Colors",
        "Coating Options: Laquer, Melamine, PU, Wax (Matt / Semi / Glossy)",
        "3-Year Comprehensive Craftsmanship Warranty"
      ],
      specifications: {
        "Model Number": model,
        "Height": height,
        "Wood Material": "Premium Ghana Teak Wood",
        "MRP": "₹" + price.toLocaleString('en-IN')
      }
    };

    if (existingIdx >= 0) {
      prods[existingIdx] = { ...prods[existingIdx], ...productObj };
    } else {
      prods.unshift(productObj);
    }

    saveProducts(prods);
    if (prodModal) prodModal.classList.remove("active");
    alert(`Model ${model} saved and updated in catalog!`);
  }

  function deleteProduct(prodId) {
    if (!confirm("Are you sure you want to remove this model from the catalog?")) return;
    let prods = getProducts();
    prods = prods.filter(p => p.id !== prodId);
    saveProducts(prods);
  }

  function changeOrderStatus(orderIdx, newStatus) {
    const orders = getOrders();
    if (orders[orderIdx]) {
      orders[orderIdx].status = newStatus;
      localStorage.setItem("timber_all_orders_v1", JSON.stringify(orders));
      renderOrdersTable();
      renderKPIs();
    }
  }

  // Export functions to global
  window.AdminApp = {
    editProduct: openProductModal,
    deleteProduct: deleteProduct,
    changeOrderStatus: changeOrderStatus,
    switchTab: switchTab
  };

  // Run on load
  document.addEventListener("DOMContentLoaded", init);

})();
