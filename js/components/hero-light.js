/**
 * THE TIMBER LIGHTS — FULL CINEMATIC HERO & LIGHT SHOWCASE (js/components/hero-light.js)
 * Interactive full-bleed timber light showcase with dynamic illumination,
 * live model switching across all user uploaded timber lights, and instant PDP access.
 */

window.HeroLightEngine = (function() {
  
  let isPressed = false;
  let isToggledOn = false;
  let heroScene = null;
  let glowBtn = null;
  let glowBtnText = null;
  let fullImg = null;
  let liveBadge = null;
  let currentPdpId = "tl_linear_beam";

  const SIGNATURE_HERO_MODELS = {
    "tl_linear_dining": {
      img: "images/hero_timber_dining.png",
      badge: "TL-LIN48 • 48\" Linear Dining Chandelier",
      pdpId: "tl_linear_beam"
    },
    "tl_pagoda_finial": {
      img: "images/products/tl_pagoda_finial.jpg",
      badge: "TL-PAG18 • 18\" Hand-Lathed Pagoda Finial",
      pdpId: "tl_pagoda_finial"
    },
    "tl_spalted_cluster": {
      img: "images/products/tl_spalted_cluster.jpg",
      badge: "TL-CLUST5 • 32\" Spalted Teak 5-Pendant Cluster",
      pdpId: "tl_spalted_cluster"
    },
    "tl_sphere_orb": {
      img: "images/products/tl_sphere_orb.jpg",
      badge: "TL-ORB18 • 18\" Nordic Sphere & Opal Globe",
      pdpId: "tl_sphere_orb"
    },
    "tl_vessel_quad": {
      img: "images/products/tl_vessel_quad.jpg",
      badge: "TL-VES4 • 28\" Sculptural Turned Vessel Collection",
      pdpId: "tl_vessel_quad"
    },
    "tl_bead_totem": {
      img: "images/products/tl_bead_totem.jpg",
      badge: "TL-BEAD30 • 30\" Geometric Stacked Bead & Disc Totem",
      pdpId: "tl_bead_totem"
    },
    "tl_flare_pendant": {
      img: "images/products/tl_flare_pendant.jpg",
      badge: "TL-FLR15 • 15\" Sculpted Flared Pendant",
      pdpId: "tl_flare_pendant"
    },
    "tl_oak_bell": {
      img: "images/products/tl_oak_bell.png",
      badge: "TL-BELL12 • 12\" Nordic Oak Bell Pendant",
      pdpId: "tl_oak_bell"
    },
    "tl_spindle_totem": {
      img: "images/products/tl_spindle_totem.jpg",
      badge: "TL-TOTM24 • 24\" Geometric Spindle Totem",
      pdpId: "tl_spindle_totem"
    },
    "tl_linear_beam": {
      img: "images/products/tl_linear_beam.jpg",
      badge: "TL-BEAM48 • Curved Linear Architectural Light",
      pdpId: "tl_linear_beam"
    }
  };

  function init() {
    heroScene = document.getElementById("hero-scene");
    glowBtn = document.getElementById("hero-profile-light");
    glowBtnText = document.getElementById("hero-glow-btn-text");
    fullImg = document.getElementById("hero-full-img");
    liveBadge = document.getElementById("hero-live-badge");

    if (!heroScene) return;

    // 1. Interactive Illumination Handlers (Click toggle + Press and Hold)
    if (glowBtn) {
      // Desktop Mouse Handlers
      glowBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        turnOn();
      });

      window.addEventListener("mouseup", () => {
        if (isPressed && !isToggledOn) turnOff();
      });

      // Mobile Touch Handlers
      glowBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        turnOn();
      }, { passive: false });

      window.addEventListener("touchend", () => {
        if (isPressed && !isToggledOn) turnOff();
      });

      window.addEventListener("touchcancel", () => {
        if (isPressed && !isToggledOn) turnOff();
      });

      // Click to toggle
      glowBtn.addEventListener("click", () => {
        isToggledOn = !isToggledOn;
        if (isToggledOn) {
          turnOn();
          if (glowBtnText) glowBtnText.textContent = "ILLUMINATED (CLICK TO DIM)";
        } else {
          turnOff();
          if (glowBtnText) glowBtnText.textContent = "PRESS & HOLD TO ILLUMINATE";
        }
      });
    }

    // 2. Gallery Tabs / Model Switcher
    const tabs = document.querySelectorAll(".hero-gallery-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const modelKey = tab.getAttribute("data-model-id");
        switchHeroModel(modelKey);
      });
    });

    // 3. Open Product Modal Button
    const openPdpBtn = document.getElementById("hero-open-pdp-btn");
    if (openPdpBtn) {
      openPdpBtn.addEventListener("click", () => {
        if (window.ProductDetailEngine) {
          window.ProductDetailEngine.open(currentPdpId);
        }
      });
    }
  }

  function switchHeroModel(modelKey) {
    if (!SIGNATURE_HERO_MODELS[modelKey]) return;
    const model = SIGNATURE_HERO_MODELS[modelKey];
    currentPdpId = model.pdpId;

    // Update active tab UI
    document.querySelectorAll(".hero-gallery-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-model-id") === modelKey);
    });

    // Cross-fade background image
    if (fullImg) {
      fullImg.style.opacity = "0.2";
      fullImg.style.transform = "scale(0.98)";
      setTimeout(() => {
        fullImg.src = model.img;
        fullImg.style.opacity = "1";
        fullImg.style.transform = "scale(1)";
      }, 180);
    }

    // Update badge text
    if (liveBadge) {
      liveBadge.textContent = model.badge;
    }

    // Audio / illumination feedback pulse
    turnOn();
    setTimeout(() => {
      if (!isPressed && !isToggledOn) turnOff();
    }, 500);
  }

  function turnOn() {
    isPressed = true;
    if (heroScene) heroScene.classList.add("is-illuminated");
    if (window.TimberHelpers && TimberHelpers.playTactileSound) {
      TimberHelpers.playTactileSound("light-on");
    }
  }

  function turnOff() {
    isPressed = false;
    if (heroScene) heroScene.classList.remove("is-illuminated");
    if (window.TimberHelpers && TimberHelpers.playTactileSound) {
      TimberHelpers.playTactileSound("light-off");
    }
  }

  return {
    init,
    turnOn,
    turnOff,
    switchHeroModel
  };
})();
