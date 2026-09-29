/**
 * TIMBER LIGHT — ANIMATIONS, CURSOR TRACKER & SCROLL REVEALS (js/components/animations.js)
 */

window.AnimationsEngine = (function() {
  
  function init() {
    initCustomCursor();
    initMagneticButtons();
    initScrollObserver();
    initNumberCounters();
    renderApplicationsGrid();
    renderProjectsGrid();
  }

  // 1. Custom Glowing Cursor
  function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    if (!cursor) return;

    window.addEventListener("mousemove", (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      document.body.classList.add("cursor-active");
    });

    // Hover state on interactive elements
    const interactiveSelectors = "a, button, input, select, textarea, .product-card, .interactive-ceiling-luminaire, .app-card, .project-card, .exploded-layer";
    
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactiveSelectors)) {
        document.body.classList.add("cursor-hovering");
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactiveSelectors)) {
        document.body.classList.remove("cursor-hovering");
      }
    });
  }

  // 2. Magnetic Buttons
  function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll(".magnetic-btn");
    
    magneticBtns.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
      });
    });
  }

  // 3. Scroll Intersection Observer for Header & Section Links
  function initScrollObserver() {
    const header = document.getElementById("main-header");
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        if (header) header.classList.add("scrolled");
      } else {
        if (header) header.classList.remove("scrolled");
      }

      // Active Section Highlighting
      let currentSection = "";
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSection = sec.getAttribute("id");
        }
      });

      navLinks.forEach(link => {
        const navTarget = link.getAttribute("data-nav");
        if (navTarget === currentSection || (currentSection === "products-section" && navTarget === "products")) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    });
  }

  // 4. Number Counter Animation on Viewport Entry
  function initNumberCounters() {
    const counters = document.querySelectorAll(".counter-target");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-target"), 10);
          if (!isNaN(target)) {
            animateCount(el, target);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  function animateCount(el, target) {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const current = Math.floor(progress * (2 - progress) * target);
      
      if (target >= 1000) {
        el.textContent = Math.floor(current / 1000) + "K";
      } else {
        el.textContent = current;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target >= 1000 ? (target / 1000) + "K" : target;
      }
    }

    requestAnimationFrame(update);
  }

  // 5. Render Applications Section Grid
  function renderApplicationsGrid() {
    const container = document.getElementById("applications-grid");
    if (!container) return;

    const apps = window.TIMBER_APPLICATIONS || [];

    container.innerHTML = apps.map(app => {
      return `
        <div class="app-card" onclick="window.CatalogEngine.setCategoryFilter('all'); location.hash='#products-section';">
          <div class="app-bg-scene" style="background: radial-gradient(circle at center, #242938 0%, #0E1015 100%);"></div>
          <div class="app-overlay-gradient"></div>
          
          <div class="app-content">
            <div class="app-tag" style="color: ${app.color};">${app.tag}</div>
            <h3 class="app-title">${app.title}</h3>
            <p class="app-desc">${app.desc}</p>
            <div class="text-xs text-muted mt-3 pt-2 border-t border-white/10">
              <strong class="text-white">Recommended Systems:</strong> ${app.idealSystems}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // 6. Render Projects Portfolio Grid
  function renderProjectsGrid() {
    const container = document.getElementById("projects-grid");
    if (!container) return;

    const projects = window.TIMBER_PROJECTS || [];

    container.innerHTML = projects.map(proj => {
      return `
        <div class="project-card" onclick="window.AnimationsEngine.openProjectModal('${proj.id}')">
          <div class="project-thumb-stage" style="background: radial-gradient(circle at 50% 30%, #2A303F 0%, #12141A 100%);">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
              <div style="width: 70%; height: 16px; background: #FFF; box-shadow: 0 0 25px #FFF, 0 0 50px var(--amber-glow); border-radius: 2px;"></div>
            </div>
            <span class="badge-tag-amber" style="position: absolute; top: 1rem; left: 1rem;">${proj.typology}</span>
          </div>

          <div class="project-body">
            <div class="project-location"><i class="fa-solid fa-location-dot"></i> ${proj.location}</div>
            <h3 class="project-title">${proj.title}</h3>
            <p class="text-xs text-muted mb-3">${proj.shortDesc}</p>
            
            <div class="flex justify-between items-center text-xs text-muted pt-3 border-t border-white/10">
              <span><strong>Architect:</strong> ${proj.architect}</span>
              <span class="text-amber font-bold">View Case Study <i class="fa-solid fa-arrow-right"></i></span>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Project Detail Modal
  function openProjectModal(projectId) {
    const proj = (window.TIMBER_PROJECTS || []).find(p => p.id === projectId);
    if (!proj) return;

    const modal = document.getElementById("project-modal");
    const body = document.getElementById("project-modal-body");
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="p-8">
        <div class="section-badge">${proj.typology}</div>
        <h2 class="text-3xl font-extrabold mb-1">${proj.title}</h2>
        <p class="text-amber text-sm font-semibold mb-4">${proj.location} • Specified by ${proj.architect}</p>
        
        <div class="p-4 bg-white/5 rounded border border-white/10 mb-6 italic text-muted text-sm border-l-4 border-l-amber-500">
          "${proj.quote}"
        </div>

        <h4 class="text-sm font-bold uppercase tracking-wider text-white mb-2">Architectural Engineering Metrics</h4>
        <div class="grid grid-cols-2 gap-3 mb-6">
          ${Object.entries(proj.metrics || {}).map(([k, v]) => `
            <div class="p-3 bg-white/5 rounded border border-white/5">
              <span class="text-xs text-muted block">${k}</span>
              <strong class="text-white text-sm">${v}</strong>
            </div>
          `).join("")}
        </div>

        <h4 class="text-sm font-bold uppercase tracking-wider text-white mb-2">Configured Systems Used</h4>
        <div class="flex gap-2 flex-wrap mb-6">
          ${proj.featuredSystems.map(s => `
            <span class="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber text-xs rounded">${s}</span>
          `).join("")}
        </div>

        <button class="btn btn-primary w-full" onclick="document.getElementById('project-modal').classList.remove('active'); location.hash='#contact';">
          Request Specification for Similar Project
        </button>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    TimberHelpers.playTactileSound("click");

    const closeBtn = document.getElementById("project-modal-close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      };
    }
  }

  return {
    init,
    openProjectModal
  };

})();
