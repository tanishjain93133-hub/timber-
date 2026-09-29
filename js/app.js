/**
 * TIMBER LIGHT — MASTER APPLICATION ORCHESTRATOR (js/app.js)
 * Clean, lightweight, professional e-commerce initialization.
 */

document.addEventListener("DOMContentLoaded", () => {

  // 1. Initialize Subsystem Modules
  if (window.HeroLightEngine) window.HeroLightEngine.init();
  if (window.CatalogEngine) window.CatalogEngine.init();
  if (window.ProductDetailEngine) window.ProductDetailEngine.init();
  if (window.CartEngine) window.CartEngine.init();
  if (window.WishlistEngine) window.WishlistEngine.init();
  if (window.CheckoutEngine) window.CheckoutEngine.init();
  if (window.SearchEngine) window.SearchEngine.init();
  if (window.AccountEngine) window.AccountEngine.init();

  // 2. Navigation Drawer (Upper 3-Line Menu & Mobile)
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

  // 3. Contact Form Submission
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name")?.value.trim();
      const phone = document.getElementById("contact-phone")?.value.trim();
      const email = document.getElementById("contact-email")?.value.trim();

      if (!name || !phone || !email) {
        if (window.TimberHelpers) TimberHelpers.showToast("Please provide your name, phone, and email.", "danger");
        return;
      }

      if (window.TimberHelpers) {
        TimberHelpers.playTactileSound("light-on");
        TimberHelpers.showToast(`Thank you, ${name}. Your architectural enquiry has been submitted. Our team will contact you shortly.`, "success");
      }
      contactForm.reset();
    });
  }

  // 4. Smooth Anchor Link Navigation Highlight
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

});
