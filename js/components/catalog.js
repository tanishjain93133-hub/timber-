/**
 * THE TIMBER LIGHTS — CATALOG & FILTERING ENGINE (js/components/catalog.js)
 * Clean, lightweight product grid for all 25 PDF models with filters:
 * Height, Wood Finish, Coating, Price Sort, and Model Search.
 */

window.CatalogEngine = (function() {
  
  let currentSearch = "";
  let currentHeight = "all";
  let currentFinish = "all";
  let currentCoating = "all";
  let currentSort = "featured";

  let productsGrid = null;
  let homeFeaturedGrid = null;
  let emptyState = null;
  let countLabel = null;
  let searchInput = null;
  let clearSearchBtn = null;
  let heightSelect = null;
  let finishSelect = null;
  let coatingSelect = null;
  let sortSelect = null;
  let resetBtn = null;

  function init() {
    productsGrid = document.getElementById("products-grid");
    homeFeaturedGrid = document.getElementById("home-featured-grid");
    emptyState = document.getElementById("catalog-empty-state");
    countLabel = document.getElementById("catalog-count-label");
    searchInput = document.getElementById("catalog-search-input");
    clearSearchBtn = document.getElementById("catalog-search-clear");
    heightSelect = document.getElementById("filter-height-select");
    finishSelect = document.getElementById("filter-finish-select");
    coatingSelect = document.getElementById("filter-coating-select");
    sortSelect = document.getElementById("catalog-sort");
    resetBtn = document.getElementById("catalog-reset-btn");

    bindEvents();
    renderHomeShowcase();
    renderCatalog();
  }

  function bindEvents() {
    // Search input
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle("d-none", currentSearch === "");
        }
        renderCatalog();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        currentSearch = "";
        clearSearchBtn.classList.add("d-none");
        renderCatalog();
      });
    }

    // Height Select
    if (heightSelect) {
      heightSelect.addEventListener("change", (e) => {
        currentHeight = e.target.value;
        renderCatalog();
      });
    }

    // Finish Select
    if (finishSelect) {
      finishSelect.addEventListener("change", (e) => {
        currentFinish = e.target.value;
        renderCatalog();
      });
    }

    // Coating Select
    if (coatingSelect) {
      coatingSelect.addEventListener("change", (e) => {
        currentCoating = e.target.value;
        renderCatalog();
      });
    }

    // Sort Select
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderCatalog();
      });
    }

    // Reset Button
    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }
  }

  function resetFilters() {
    currentSearch = "";
    currentHeight = "all";
    currentFinish = "all";
    currentCoating = "all";
    currentSort = "featured";

    if (heightSelect) heightSelect.value = "all";
    if (finishSelect) finishSelect.value = "all";
    if (coatingSelect) coatingSelect.value = "all";
    if (sortSelect) sortSelect.value = "featured";
    if (searchInput) searchInput.value = "";
    if (clearSearchBtn) clearSearchBtn.classList.add("d-none");

    renderCatalog();
  }

  function getFilteredProducts() {
    if (!window.TIMBER_PRODUCTS) return [];

    let list = [...window.TIMBER_PRODUCTS];

    // 1. Height Filter
    if (currentHeight !== "all") {
      list = list.filter(p => {
        const clean = p.height.replace(/"/g, '').trim();
        return clean === currentHeight || p.height.includes(currentHeight + '"') || p.height.startsWith(currentHeight);
      });
    }

    // 2. Search Filter (Model, Name, Category, Wood, Desc)
    if (currentSearch) {
      list = list.filter(p => 
        p.model.toLowerCase().includes(currentSearch) ||
        p.name.toLowerCase().includes(currentSearch) ||
        (p.category && p.category.toLowerCase().includes(currentSearch)) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(currentSearch)) ||
        p.height.toLowerCase().includes(currentSearch) ||
        p.wood.toLowerCase().includes(currentSearch) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(currentSearch))
      );
    }

    // 3. Sort
    if (currentSort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (currentSort === "newest") {
      list.sort((a, b) => b.page - a.page);
    } else {
      // Featured
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }

  function renderCard(product) {
    const isWishlisted = window.WishlistEngine ? WishlistEngine.isInWishlist(product.id) : false;
    const formattedPrice = window.TimberHelpers ? TimberHelpers.formatINR(product.price) : `₹${product.price.toLocaleString('en-IN')}`;

    return `
      <div class="product-card" data-product-id="${product.id}">
        <span class="card-badge">${product.height} HEIGHT</span>
        
        <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                data-action="toggle-wishlist" 
                data-id="${product.id}" 
                aria-label="Save to Wishlist"
                title="Add to Wishlist">
          <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>

        <div class="card-img-wrap" onclick="ProductDetailEngine.open('${product.id}')">
          <img src="${product.image}" alt="${product.model} Wooden Light" class="card-product-img" onerror="this.onerror=null; this.src='images/products/tl_baluster_finial.jpg'">
        </div>

        <div class="card-content">
          <div class="card-model-tag">MODEL: ${product.model}</div>
          <h3 class="card-title" onclick="ProductDetailEngine.open('${product.id}')">${product.model}</h3>
          
          <div class="card-specs-line">
            <span><strong>Height:</strong> ${product.height}</span>
            <span>&bull;</span>
            <span>${product.wood}</span>
          </div>

          <div class="card-bottom-row">
            <div class="card-price-block">
              <span class="card-price-label">MRP</span>
              <span class="card-price">${formattedPrice}</span>
            </div>
            
            <div class="card-btns-group">
              <button class="card-add-btn" onclick="CartEngine.addItem('${product.id}', 1, event)" title="Add to Cart">
                <i class="fa-solid fa-plus"></i> ADD
              </button>
              <button class="card-buy-btn" onclick="ProductDetailEngine.open('${product.id}')" title="Buy Now">
                BUY
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCatalog() {
    if (!productsGrid) return;

    const filtered = getFilteredProducts();

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${window.TIMBER_PRODUCTS.length} models`;
    }

    if (resetBtn) {
      const isFiltered = currentHeight !== "all" || currentFinish !== "all" || currentCoating !== "all" || currentSearch !== "";
      resetBtn.style.display = isFiltered ? "inline-block" : "none";
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("d-none");
    } else {
      if (emptyState) emptyState.classList.add("d-none");
      productsGrid.innerHTML = filtered.map(p => renderCard(p)).join("");
      attachCardEvents(productsGrid);
    }
  }

  function renderHomeShowcase() {
    if (!homeFeaturedGrid || !window.TIMBER_PRODUCTS) return;
    const featured = window.TIMBER_PRODUCTS.slice(0, 8);
    homeFeaturedGrid.innerHTML = featured.map(p => renderCard(p)).join("");
    attachCardEvents(homeFeaturedGrid);
  }

  function attachCardEvents(container) {
    container.querySelectorAll('[data-action="toggle-wishlist"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (window.WishlistEngine) {
          WishlistEngine.toggleItem(id);
          const icon = btn.querySelector("i");
          if (WishlistEngine.isInWishlist(id)) {
            btn.classList.add("active");
            if (icon) { icon.classList.remove("fa-regular"); icon.classList.add("fa-solid"); }
          } else {
            btn.classList.remove("active");
            if (icon) { icon.classList.remove("fa-solid"); icon.classList.add("fa-regular"); }
          }
        }
      });
    });
  }

  return {
    init,
    renderCatalog,
    renderHomeShowcase,
    resetFilters
  };
})();
