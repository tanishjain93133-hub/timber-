/**
 * TIMBER LIGHT — ADMIN DASHBOARD & CATALOG MANAGEMENT ENGINE (js/components/admin.js)
 * Full E-Commerce Admin System to manage Products, Stock, Pricing, SKU, Orders, Revenue & Customers
 */

window.AdminEngine = (function() {
  
  const modal = document.getElementById("admin-modal");
  const closeBtn = document.getElementById("admin-close-btn");
  const triggerBtns = document.querySelectorAll(".admin-panel-trigger");
  const navTabs = document.querySelectorAll(".admin-nav-tab");
  const contentPanes = document.querySelectorAll(".admin-pane");

  let currentTab = "dashboard";

  function init() {
    triggerBtns.forEach(btn => {
      btn.addEventListener("click", open);
    });

    if (closeBtn) closeBtn.addEventListener("click", close);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }

    navTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const tabKey = tab.getAttribute("data-admin-tab");
        switchTab(tabKey);
      });
    });

    // Product Form Submit
    const prodForm = document.getElementById("admin-product-form");
    if (prodForm) {
      prodForm.addEventListener("submit", handleProductSave);
    }
  }

  function open() {
    renderDashboard();
    renderProductsList();
    renderOrdersList();
    renderCustomersList();

    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
    TimberHelpers.playTactileSound("click");
  }

  function close() {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function switchTab(tabKey) {
    currentTab = tabKey;
    navTabs.forEach(t => t.classList.toggle("active", t.getAttribute("data-admin-tab") === tabKey));
    contentPanes.forEach(p => p.classList.toggle("active", p.id === `admin-pane-${tabKey}`));
    TimberHelpers.playTactileSound("click");
  }

  function getGlobalOrders() {
    try {
      return JSON.parse(localStorage.getItem("timber_all_orders_v1")) || [
        {
          orderId: "TL-2026-78214",
          date: "24 Sep 2026",
          status: "Dispatched",
          customer: { name: "Ar. Kabir Singhal", phone: "+91 98110 99887", email: "kabir@studio.in", city: "New Delhi" },
          paymentMethod: "UPI",
          items: [{ name: "Timber TTL-1035 High-Flux Profile", qty: 4, length: "2m", price: 3600 }],
          totals: { finalTotal: 15570 }
        },
        {
          orderId: "TL-2026-65490",
          date: "22 Sep 2026",
          status: "Delivered",
          customer: { name: "Matrix Interiors Pvt Ltd", phone: "+91 99200 44556", email: "procurement@matrix.in", city: "Mumbai" },
          paymentMethod: "NETBANKING",
          items: [{ name: "Timber Ultra-24W Commercial", qty: 12, length: "3m", price: 8400 }],
          totals: { finalTotal: 100800 }
        }
      ];
    } catch (e) {
      return [];
    }
  }

  function renderDashboard() {
    const orders = getGlobalOrders();
    const products = window.TIMBER_PRODUCTS || [];

    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totals?.finalTotal || 0), 0);
    const lowStockCount = products.filter(p => p.stock < 60).length;

    // KPI Counters
    const kpiOrders = document.getElementById("admin-kpi-orders");
    const kpiRevenue = document.getElementById("admin-kpi-revenue");
    const kpiProducts = document.getElementById("admin-kpi-products");
    const kpiCustomers = document.getElementById("admin-kpi-customers");
    const kpiLowStock = document.getElementById("admin-kpi-lowstock");

    if (kpiOrders) kpiOrders.textContent = totalOrdersCount;
    if (kpiRevenue) kpiRevenue.textContent = TimberHelpers.formatINR(totalRevenue);
    if (kpiProducts) kpiProducts.textContent = products.length;
    if (kpiCustomers) kpiCustomers.textContent = "48 Trade Accounts";
    if (kpiLowStock) kpiLowStock.textContent = lowStockCount;
  }

  function renderProductsList() {
    const tableBody = document.getElementById("admin-products-table-body");
    if (!tableBody) return;

    const products = window.TIMBER_PRODUCTS || [];

    tableBody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div class="flex items-center gap-2">
            <span class="admin-prod-indicator ${p.stock < 60 ? 'low-stock' : 'in-stock'}"></span>
            <div>
              <strong class="text-white text-xs block">${p.name}</strong>
              <small class="text-muted">SKU: ${p.sku || 'TL-2026'}</small>
            </div>
          </div>
        </td>
        <td class="text-xs text-muted">${p.categoryLabel}</td>
        <td class="text-xs font-bold text-amber">${TimberHelpers.formatINR(p.price)}</td>
        <td class="text-xs text-white">${p.wattageLabel}</td>
        <td>
          <span class="stock-badge ${p.stock < 60 ? 'badge-low' : 'badge-ok'}">${p.stock} units</span>
        </td>
        <td>
          <button class="btn btn-ghost btn-xs" onclick="window.ProductDetailEngine.open('${p.id}'); window.AdminEngine.close();">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </td>
      </tr>
    `).join("");
  }

  function renderOrdersList() {
    const tableBody = document.getElementById("admin-orders-table-body");
    if (!tableBody) return;

    const orders = getGlobalOrders();

    tableBody.innerHTML = orders.map((order, idx) => `
      <tr>
        <td><strong class="text-white text-xs">${order.orderId}</strong><br><small class="text-muted">${order.date}</small></td>
        <td>
          <span class="text-xs text-white block">${order.customer?.name || 'Architect Partner'}</span>
          <small class="text-muted">${order.customer?.city || 'India'} &bull; ${order.customer?.phone || ''}</small>
        </td>
        <td>
          <span class="badge-tag-amber text-xs">${order.paymentMethod || 'UPI'}</span>
        </td>
        <td class="text-xs font-bold text-amber">${TimberHelpers.formatINR(order.totals?.finalTotal || 0)}</td>
        <td>
          <select class="admin-status-select" onchange="window.AdminEngine.updateOrderStatus(${idx}, this.value)">
            <option value="Order Confirmed" ${order.status === 'Order Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Millimeter Assembly" ${order.status === 'Millimeter Assembly' ? 'selected' : ''}>Assembly</option>
            <option value="Dispatched" ${order.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `).join("");
  }

  function updateOrderStatus(orderIndex, newStatus) {
    const orders = getGlobalOrders();
    if (orders[orderIndex]) {
      orders[orderIndex].status = newStatus;
      localStorage.setItem("timber_all_orders_v1", JSON.stringify(orders));
      TimberHelpers.showToast(`Order status updated to "${newStatus}"`, "success");
      renderOrdersList();
      renderDashboard();
    }
  }

  function renderCustomersList() {
    const custContainer = document.getElementById("admin-customers-table-body");
    if (!custContainer) return;

    const customers = [
      { name: "Studio Lotus & Matrix Design", contact: "Ar. Rajesh Sharma", email: "rajesh@studiolotus.in", city: "New Delhi", tier: "Gold Trade Partner", orders: "8 Orders (₹ 3,45,000)" },
      { name: "Morphogenesis Partner Architects", contact: "Sonali Rastogi", email: "sonali@morphogenesis.org", city: "Bengaluru", tier: "Platinum Enterprise", orders: "14 Orders (₹ 8,90,000)" },
      { name: "Atelier Urban Form", contact: "Vikramaditya Rao", email: "vikram@urbanform.in", city: "Mumbai", tier: "Gold Trade Partner", orders: "5 Orders (₹ 2,10,000)" },
      { name: "Earth & Light Architecture", contact: "Ananya Mehta", email: "ananya@earthlight.com", city: "Hyderabad", tier: "Verified Partner", orders: "3 Orders (₹ 98,500)" }
    ];

    custContainer.innerHTML = customers.map(c => `
      <tr>
        <td>
          <strong class="text-white text-xs block">${c.name}</strong>
          <small class="text-muted">Contact: ${c.contact}</small>
        </td>
        <td class="text-xs text-muted">${c.email}</td>
        <td class="text-xs text-white">${c.city}</td>
        <td><span class="badge-tag-amber text-xs">${c.tier}</span></td>
        <td class="text-xs font-bold text-amber">${c.orders}</td>
      </tr>
    `).join("");
  }

  function handleProductSave(e) {
    e.preventDefault();

    const name = document.getElementById("adm-prod-name")?.value.trim();
    const sku = document.getElementById("adm-prod-sku")?.value.trim();
    const price = Number(document.getElementById("adm-prod-price")?.value);
    const category = document.getElementById("adm-prod-category")?.value;
    const wattage = document.getElementById("adm-prod-wattage")?.value;
    const stock = Number(document.getElementById("adm-prod-stock")?.value);
    const desc = document.getElementById("adm-prod-desc")?.value.trim();

    if (!name || !sku || isNaN(price)) {
      TimberHelpers.showToast("Please enter product name, SKU, and price.", "danger");
      return;
    }

    const categoryLabels = {
      "ttl-profile": "TTL Profile Lights",
      "recessed-profile": "Recessed Profiles",
      "trimless-linear": "Trimless Linear",
      "architectural": "Architectural Lights",
      "commercial": "Commercial & Office",
      "accessories": "Drivers & Accessories"
    };

    const newProduct = {
      id: "prod-" + Date.now().toString(36),
      sku: sku,
      name: name,
      category: category,
      categoryGroup: category,
      categoryLabel: categoryLabels[category] || "Profile Lights",
      badge: "New Release",
      shortDesc: desc || "Architectural continuous linear luminaire engineered for luxury spaces.",
      price: price,
      priceUnit: "per 1 Meter",
      stock: stock || 50,
      rating: 5.0,
      reviewsCount: 1,
      wattage: wattage,
      wattageLabel: `${wattage.toUpperCase()} / 1ft`,
      luminousFlux: "1,150 lm/ft",
      cri: "CRI 95+",
      cctOptions: ["warm", "neutral", "cool"],
      defaultCCT: "neutral",
      lengths: [
        { label: "1 Meter", value: "1m", multiplier: 1.0 },
        { label: "2 Meters", value: "2m", multiplier: 1.95 },
        { label: "3 Meters", value: "3m", multiplier: 2.85 }
      ],
      finishes: [
        { name: "Anodized Deep Black", value: "black", colorHex: "#111317" },
        { name: "Architectural Pure White", value: "white", colorHex: "#F8F9FA" }
      ],
      features: [
        "High density continuous phosphor linear emitter",
        "Ultra-slim in-profile GaN driver",
        "3-Year direct replacement guarantee"
      ],
      specifications: {
        "Input Voltage": "220-240V AC",
        "Efficacy": "115 lm/Watt"
      },
      applications: ["Living Rooms", "Offices", "Luxury Residences"],
      applicationKey: "residential",
      isFeatured: true,
      isBestseller: false
    };

    window.TIMBER_PRODUCTS.unshift(newProduct);
    if (window.CatalogEngine) window.CatalogEngine.render();
    if (window.CatalogEngine) window.CatalogEngine.renderHomeShowcase();

    renderProductsList();
    renderDashboard();

    TimberHelpers.showToast(`Product "${name}" added to catalog successfully!`, "success");
    e.target.reset();
  }

  return {
    init,
    open,
    close,
    switchTab,
    updateOrderStatus
  };

})();
