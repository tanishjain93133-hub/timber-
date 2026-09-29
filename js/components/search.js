/**
 * TIMBER LIGHT — SEARCH ENGINE (js/components/search.js)
 * Clean, lightweight search overlay modal (Ctrl+K or Header Click).
 */

window.SearchEngine = (function() {
  
  let modal = null;
  let input = null;
  let resultsList = null;
  let closeBtn = null;

  function init() {
    modal = document.getElementById("search-modal");
    input = document.getElementById("global-search-input");
    resultsList = document.getElementById("search-results-list");
    closeBtn = document.getElementById("search-modal-close");

    const trigger = document.getElementById("search-trigger");

    if (trigger) trigger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }

    if (input) {
      input.addEventListener("input", (e) => {
        renderResults(e.target.value.trim().toLowerCase());
      });
    }

    // Ctrl+K or / shortcut
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && modal && modal.classList.contains("active")) {
        close();
      }
    });
  }

  function open() {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (input) {
      input.value = "";
      setTimeout(() => input.focus(), 100);
      renderResults("");
    }
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderResults(query) {
    if (!resultsList || !window.TIMBER_PRODUCTS) return;

    let items = window.TIMBER_PRODUCTS;
    if (query) {
      items = items.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.model && p.model.toLowerCase().includes(query)) ||
        (p.wood && p.wood.toLowerCase().includes(query)) ||
        (p.height && p.height.toLowerCase().includes(query)) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(query))
      );
    }

    if (items.length === 0) {
      resultsList.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No products found for "${query}"</div>`;
      return;
    }

    const fmt = window.TimberHelpers ? TimberHelpers.formatINR : (n) => `₹${n}`;

    resultsList.innerHTML = items.slice(0, 10).map(p => `
      <div class="search-item-result" onclick="SearchEngine.close(); ProductDetailEngine.open('${p.id}');">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img src="${p.image}" alt="${p.model}" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
          <div>
            <div class="search-item-title">${p.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${p.categoryLabel || 'Wooden Hanging Light'} &bull; Height: ${p.height} &bull; ${p.wood}</div>
          </div>
        </div>
        <span class="search-item-price">${fmt(p.price)}</span>
      </div>
    `).join("");
  }

  return {
    init,
    open,
    close
  };
})();
