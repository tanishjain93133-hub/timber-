/**
 * TIMBER LIGHT — MASTER APPLICATION ORCHESTRATOR (js/app.js)
 * Clean, lightweight, professional e-commerce initialization with live Supabase Sync.
 */

document.addEventListener("DOMContentLoaded", () => {

  // 1. Apply Dynamic Site Settings (local cache first for instant paint, then live Supabase sync)
  function applySiteSettings(settings) {
    if (!settings) return;
    const heroTitle = settings.hero_title || settings.heroTitle;
    const heroTagline = settings.hero_tagline || settings.heroTagline;
    if (heroTitle) {
      const heroTitleEl = document.querySelector(".hero-main-title");
      if (heroTitleEl) heroTitleEl.textContent = heroTitle;
    }
    if (heroTagline) {
      const heroTaglineEl = document.querySelector(".hero-tagline");
      if (heroTaglineEl) heroTaglineEl.textContent = heroTagline;
    }
  }

  try {
    const cachedSettings = JSON.parse(localStorage.getItem("timber_site_settings"));
    if (cachedSettings) applySiteSettings(cachedSettings);
  } catch (e) {}

  if (window.SupabaseDB && window.SupabaseDB.fetchSiteSettings) {
    window.SupabaseDB.fetchSiteSettings().then((liveSettings) => {
      if (liveSettings) {
        applySiteSettings(liveSettings);
        try { localStorage.setItem("timber_site_settings", JSON.stringify(liveSettings)); } catch (e) {}
      }
    }).catch(() => {});
  }

  // 2. Initialize Subsystem Modules
  if (window.HeroLightEngine) window.HeroLightEngine.init();
  if (window.CatalogEngine) window.CatalogEngine.init();
  if (window.ProductDetailEngine) window.ProductDetailEngine.init();
  if (window.CartEngine) window.CartEngine.init();
  if (window.WishlistEngine) window.WishlistEngine.init();
  if (window.CheckoutEngine) window.CheckoutEngine.init();
  if (window.SearchEngine) window.SearchEngine.init();
  if (window.AccountEngine) window.AccountEngine.init();

  // 3. Navigation Drawer (Upper Minimal Menu & Mobile)
  const navDrawerBtn = document.getElementById("nav-drawer-toggle");
  const mobileToggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-nav-drawer");
  const mobileCloseBtn = document.getElementById("mobile-drawer-close");
  const mobileOverlay = document.getElementById("mobile-drawer-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  function openMobileNav() {
    if (mobileDrawer) {
      mobileDrawer.classList.add("active");
      mobileDrawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  }

  function closeMobileNav() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove("active");
      mobileDrawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  if (navDrawerBtn) navDrawerBtn.addEventListener("click", openMobileNav);
  if (mobileToggleBtn) mobileToggleBtn.addEventListener("click", openMobileNav);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener("click", closeMobileNav);
  mobileLinks.forEach(link => link.addEventListener("click", closeMobileNav));

  // 4. Contact Form Submission (Saves directly to Supabase Leads + Live Query Log)
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name")?.value.trim();
      const phone = document.getElementById("contact-phone")?.value.trim();
      const email = document.getElementById("contact-email")?.value.trim();
      const message = document.getElementById("contact-message")?.value?.trim() || "Consultation requested from website.";

      if (!name || !phone || !email) {
        if (window.TimberHelpers) TimberHelpers.showToast("Please provide your name, phone, and email.", "danger");
        return;
      }

      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      if (window.SupabaseDB) {
        try {
          await window.SupabaseDB.insert("leads", { name, phone, email, message }, { returning: false });
          window.SupabaseDB.logQuery("contact", message, null, name);
        } catch (err) {
          console.warn("Lead save error:", err);
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }

      if (window.TimberHelpers) {
        TimberHelpers.playTactileSound("light-on");
        TimberHelpers.showToast(`Thank you, ${name}. Your architectural enquiry has been submitted. Our team will contact you shortly.`, "success");
      }
      contactForm.reset();
    });
  }

  // 5. Smooth Anchor Link Navigation Highlight
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

});
