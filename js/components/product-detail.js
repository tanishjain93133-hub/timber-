/**
 * THE TIMBER LIGHTS — PRODUCT DETAIL (PDP) ENGINE (js/components/product-detail.js)
 * Clean, lightweight product modal with model details, size note, wood polish, coating, and finish options.
 */

window.ProductDetailEngine = (function() {
  
  let currentProduct = null;
  let selectedPolish = "Teak";
  let selectedCoating = "PU";
  let selectedTone = "Matt";
  let quantity = 1;

  let modal = null;
  let modalBody = null;
  let closeBtn = null;

  function init() {
    modal = document.getElementById("product-detail-modal");
    modalBody = document.getElementById("product-detail-body");
    closeBtn = document.getElementById("pdp-modal-close");

    if (closeBtn) {
      closeBtn.addEventListener("click", close);
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("active")) {
        close();
      }
    });
  }

  function open(productId) {
    if (!window.TIMBER_PRODUCTS) return;
    currentProduct = window.TIMBER_PRODUCTS.find(p => p.id === productId);
    if (!currentProduct) return;

    selectedPolish = "Teak";
    selectedCoating = "PU";
    selectedTone = "Matt";
    quantity = 1;

    render();

    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  }

  function close() {
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  function render() {
    if (!modalBody || !currentProduct) return;

    const p = currentProduct;
    const formattedPrice = window.TimberHelpers ? TimberHelpers.formatINR(p.price) : `₹${p.price.toLocaleString('en-IN')}`;

    const polishOptions = window.TIMBER_WOOD_POLISH_OPTIONS || [
      "Walnut", "Oak", "Teak", "Mahogany", "Cherry", "Maple", "Ash", "Cedar"
    ];

    const coatingOptions = window.TIMBER_WOOD_COATING_OPTIONS || [
      "Laquer", "Melamine", "PU", "Wax"
    ];

    const finishOptions = window.TIMBER_COATING_FINISH_OPTIONS || [
      "Matt", "Semi", "Glossy"
    ];

    modalBody.innerHTML = `
      <div class="pdp-layout">
        
        <!-- Top Row: Gallery & Details -->
        <div class="pdp-top-grid">
          
          <!-- Left: Large Product Image -->
          <div class="pdp-gallery">
            <div class="pdp-main-img-box">
              <img src="${p.image}" alt="${p.model}" class="pdp-large-img" onerror="this.onerror=null; this.src='images/products/tl_baluster_finial.jpg'">
            </div>
            
            <!-- Wood Grain Swatch Preview -->
            <div class="pdp-wood-swatches-info">
              <div class="swatch-info-title"><i class="fa-solid fa-tree text-accent"></i> 100% Solid Natural Wood</div>
              <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Handcrafted from ${p.wood}. Unique natural grain pattern on every piece.</p>
            </div>
          </div>

          <!-- Right: Product Information & Customization -->
          <div class="pdp-info-panel">
            <div class="pdp-model-badge">MODEL: ${p.model}</div>
            <h2 class="pdp-title">${p.model}</h2>
            
            <!-- Key Attributes Row -->
            <div class="pdp-key-specs-row">
              <div class="key-spec-item">
                <span class="spec-label">HEIGHT</span>
                <span class="spec-val">${p.height}</span>
              </div>
              <div class="key-spec-item">
                <span class="spec-label">WOOD TYPE</span>
                <span class="spec-val">${p.wood}</span>
              </div>
              <div class="key-spec-item">
                <span class="spec-label">WARRANTY</span>
                <span class="spec-val">3 Years</span>
              </div>
            </div>

            <!-- Price -->
            <div class="pdp-price-wrap">
              <span class="pdp-price-label">MRP</span>
              <span class="pdp-price">${formattedPrice}</span>
              <span class="pdp-unit">(Incl. of all taxes)</span>
            </div>

            <!-- Size Note Banner -->
            <div class="pdp-size-note-banner">
              <i class="fa-solid fa-circle-info text-accent"></i>
              <span><strong>Note:</strong> Size mentioned is net wood size. Bulb will be as per actual.</span>
            </div>

            <!-- 1. Wood Polish Options -->
            <div class="pdp-option-group">
              <span class="pdp-option-label">Wood Polish Color:</span>
              <div class="pdp-chips-wrap" id="pdp-polish-chips">
                ${polishOptions.map(opt => `
                  <button type="button" class="pdp-chip ${selectedPolish === opt ? 'active' : ''}" data-polish="${opt}">${opt}</button>
                `).join('')}
              </div>
            </div>

            <!-- 2. Wood Coating Options -->
            <div class="pdp-option-group">
              <span class="pdp-option-label">Coating Option:</span>
              <div class="pdp-chips-wrap" id="pdp-coating-chips">
                ${coatingOptions.map(opt => `
                  <button type="button" class="pdp-chip ${selectedCoating === opt ? 'active' : ''}" data-coating="${opt}">${opt}</button>
                `).join('')}
              </div>
            </div>

            <!-- 3. Finish Tone (Matt / Semi / Glossy) -->
            <div class="pdp-option-group">
              <span class="pdp-option-label">Finish Tone:</span>
              <div class="pdp-chips-wrap" id="pdp-tone-chips">
                ${finishOptions.map(opt => `
                  <button type="button" class="pdp-chip ${selectedTone === opt ? 'active' : ''}" data-tone="${opt}">${opt}</button>
                `).join('')}
              </div>
            </div>

            <!-- Quantity & Action Buttons -->
            <div class="pdp-actions-row">
              <div class="pdp-qty-stepper">
                <button type="button" class="pdp-qty-btn" id="pdp-qty-dec"><i class="fa-solid fa-minus"></i></button>
                <span class="pdp-qty-val" id="pdp-qty-val">${quantity}</span>
                <button type="button" class="pdp-qty-btn" id="pdp-qty-inc"><i class="fa-solid fa-plus"></i></button>
              </div>

              <button class="btn btn-primary" id="pdp-add-cart-btn">
                <i class="fa-solid fa-bag-shopping"></i>
                <span>ADD TO CART</span>
              </button>

              <button class="btn btn-outline" id="pdp-buy-now-btn">
                <span>BUY NOW</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Bottom Details: Description, Specifications, Warranty -->
        <div class="pdp-bottom-details">
          
          <div class="pdp-details-block">
            <h4>About Model ${p.model}</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
              Handcrafted designer wooden pendant lighting created from ${p.wood}. Designed to serve as an architectural focal point with warm, balanced illumination. Any finish can be achieved on the selected polish color (Matt, Semi, or Glossy).
            </p>
            
            <h4>Warranty &amp; Craftsmanship</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">
              Includes The Timber Lights 3-Year comprehensive craftsmanship warranty. Designed and manufactured in Ahmedabad, India.
            </p>
          </div>

          <div class="pdp-details-block">
            <h4>Catalog Specifications</h4>
            <table class="pdp-specs-table">
              <tbody>
                <tr><th>Model Number</th><td>${p.model}</td></tr>
                <tr><th>Height</th><td>${p.height}</td></tr>
                <tr><th>Wood Material</th><td>${p.wood}</td></tr>
                <tr><th>MRP</th><td>${formattedPrice}</td></tr>
                <tr><th>Selected Polish</th><td id="pdp-table-polish">${selectedPolish}</td></tr>
                <tr><th>Selected Coating</th><td id="pdp-table-coating">${selectedCoating} (${selectedTone})</td></tr>
                <tr><th>Size Note</th><td>Size mentioned is net wood size. Bulb will be as per actual.</td></tr>
                <tr><th>Catalog Volume</th><td>Collection 2026 • Volume 01</td></tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    `;

    bindPdpEvents();
  }

  function bindPdpEvents() {
    // Polish chips
    document.querySelectorAll("#pdp-polish-chips button").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedPolish = btn.getAttribute("data-polish");
        document.querySelectorAll("#pdp-polish-chips button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tablePolish = document.getElementById("pdp-table-polish");
        if (tablePolish) tablePolish.textContent = selectedPolish;
      });
    });

    // Coating chips
    document.querySelectorAll("#pdp-coating-chips button").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedCoating = btn.getAttribute("data-coating");
        document.querySelectorAll("#pdp-coating-chips button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        updateCoatingTable();
      });
    });

    // Tone chips
    document.querySelectorAll("#pdp-tone-chips button").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedTone = btn.getAttribute("data-tone");
        document.querySelectorAll("#pdp-tone-chips button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        updateCoatingTable();
      });
    });

    function updateCoatingTable() {
      const tableCoating = document.getElementById("pdp-table-coating");
      if (tableCoating) tableCoating.textContent = `${selectedCoating} (${selectedTone})`;
    }

    // Quantity stepper
    const decBtn = document.getElementById("pdp-qty-dec");
    const incBtn = document.getElementById("pdp-qty-inc");
    const qtyVal = document.getElementById("pdp-qty-val");

    if (decBtn) {
      decBtn.addEventListener("click", () => {
        if (quantity > 1) {
          quantity--;
          if (qtyVal) qtyVal.textContent = quantity;
        }
      });
    }

    if (incBtn) {
      incBtn.addEventListener("click", () => {
        quantity++;
        if (qtyVal) qtyVal.textContent = quantity;
      });
    }

    // Add to Cart
    const addBtn = document.getElementById("pdp-add-cart-btn");
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        if (window.CartEngine && currentProduct) {
          CartEngine.addItem(currentProduct.id, quantity, e, {
            polish: selectedPolish,
            coating: selectedCoating,
            tone: selectedTone
          });
          close();
        }
      });
    }

    // Buy Now
    const buyBtn = document.getElementById("pdp-buy-now-btn");
    if (buyBtn) {
      buyBtn.addEventListener("click", (e) => {
        if (window.CartEngine && currentProduct) {
          CartEngine.addItem(currentProduct.id, quantity, e, {
            polish: selectedPolish,
            coating: selectedCoating,
            tone: selectedTone
          });
          close();
          if (window.CheckoutEngine) {
            CheckoutEngine.open();
          }
        }
      });
    }
  }

  return {
    init,
    open,
    close
  };
})();
