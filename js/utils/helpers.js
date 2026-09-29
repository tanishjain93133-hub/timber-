/**
 * TIMBER LIGHT — UTILITY HELPERS & AUDIO SYNTHESIZER (js/utils/helpers.js)
 */

window.TimberHelpers = (function() {
  
  // Format price in Indian Rupee format (e.g. ₹ 18,500)
  function formatINR(amount) {
    if (isNaN(amount)) return "₹0";
    return "₹" + Number(amount).toLocaleString('en-IN');
  }

  // Toast Notification
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check text-success";
    if (type === "danger") icon = "fa-triangle-exclamation text-danger";

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <div class="toast-text">${message}</div>
    `;

    container.appendChild(toast);

    // Audio chime on notification
    playTactileSound("toast");

    setTimeout(() => {
      toast.classList.add("toast-hiding");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // Web Audio Tactile Synthesizer (Zero external audio file latency)
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    const badge = document.getElementById("sound-toggle");
    if (badge) {
      badge.classList.toggle("sound-active", isSoundEnabled);
      badge.classList.toggle("sound-muted", !isSoundEnabled);
    }
    showToast(`Haptic Audio Feedback ${isSoundEnabled ? "Enabled" : "Muted"}`, "info");
    return isSoundEnabled;
  }

  function playTactileSound(type = "click") {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      if (type === "light-on") {
        // Warm relay click & ascending harmonic hum
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "light-off") {
        // Soft tactile power release
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === "click") {
        // Crisp luxury microswitch tick
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "toast") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      // Audio not supported or blocked, fail gracefully
    }
  }

  // Local Storage Session State Helpers
  const CART_KEY = "timber_cart_items_v1";
  const WISH_KEY = "timber_wishlist_items_v1";
  const USER_KEY = "timber_auth_user_v1";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISH_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(wishlist) {
    localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function saveUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  // Resource Documents Viewer Modal
  function openResourceModal(docType) {
    const modal = document.getElementById("resource-modal");
    const body = document.getElementById("resource-modal-body");
    if (!modal || !body) return;

    let content = "";
    if (docType === "ies") {
      content = `
        <div class="resource-modal-header mb-4">
          <div class="section-badge">PHOTOMETRIC ARCHIVE</div>
          <h3 class="text-2xl font-bold">Download Timber IES Photometric Data</h3>
          <p class="text-muted text-sm mt-1">Direct IES / LDT files formatted for Dialux, Relux, and Autodesk Revit simulation.</p>
        </div>
        <div class="ies-list-box flex flex-col gap-3">
          <div class="flex-between align-center p-3 bg-white/5 rounded border border-white/10">
            <div>
              <strong class="text-white block">TIMBER_TTL_1035_3000K_95CRI.IES</strong>
              <span class="text-xs text-muted">1,150 lm/ft • 110° Lambertian Distribution • Efficacy 115 lm/W</span>
            </div>
            <button class="btn btn-sm btn-primary download-sim-btn" data-file="TIMBER_TTL_1035.ies"><i class="fa-solid fa-download"></i> Download IES</button>
          </div>
          <div class="flex-between align-center p-3 bg-white/5 rounded border border-white/10">
            <div>
              <strong class="text-white block">TIMBER_TRIMLESS_30_4000K_97CRI.IES</strong>
              <span class="text-xs text-muted">1,150 lm/ft • Plaster-In Gypsum Channel</span>
            </div>
            <button class="btn btn-sm btn-primary download-sim-btn" data-file="TIMBER_TRIMLESS_30.ies"><i class="fa-solid fa-download"></i> Download IES</button>
          </div>
          <div class="flex-between align-center p-3 bg-white/5 rounded border border-white/10">
            <div>
              <strong class="text-white block">TIMBER_ASYMMETRIC_WALLWASH_10W.IES</strong>
              <span class="text-xs text-muted">15° x 60° Asymmetric TIR Wall Distribution</span>
            </div>
            <button class="btn btn-sm btn-primary download-sim-btn" data-file="TIMBER_WALLWASH.ies"><i class="fa-solid fa-download"></i> Download IES</button>
          </div>
        </div>
      `;
    } else if (docType === "warranty") {
      content = `
        <div class="resource-modal-header mb-4">
          <div class="section-badge">PEACE OF MIND</div>
          <h3 class="text-2xl font-bold">3-Year Direct Replacement Warranty</h3>
        </div>
        <div class="prose text-muted text-sm leading-relaxed flex flex-col gap-3">
          <p>All Timber Light profile systems, LED continuous phosphor engines, and Ultra-Slim GaN Drivers carry a comprehensive <strong>3-Year Direct Replacement Warranty</strong> across India.</p>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Zero On-Site Delay:</strong> Immediate courier dispatch of replacement profile / driver within 24 hours of notification.</li>
            <li><strong>No False Ceiling Destruction:</strong> GaN in-profile drivers can be swapped from the face opening in seconds without breaking plaster.</li>
            <li><strong>Lumen Maintenance:</strong> Covers luminous flux maintenance above 80% (L80B10) and chromaticity stability within 3 SDCM.</li>
          </ul>
        </div>
      `;
    } else if (docType === "install") {
      content = `
        <div class="resource-modal-header mb-4">
          <div class="section-badge">INSTALLATION MANUAL</div>
          <h3 class="text-2xl font-bold">Timber Profile Installation Guide</h3>
        </div>
        <div class="install-steps flex flex-col gap-3 text-sm text-muted">
          <div class="p-3 bg-white/5 rounded">
            <strong class="text-white">Step 1: Ceiling Channel Cutout</strong>
            <p class="text-xs mt-1">Route gypsum false ceiling channel to specified cutout width (e.g., 28mm for TTL-1035).</p>
          </div>
          <div class="p-3 bg-white/5 rounded">
            <strong class="text-white">Step 2: Connect GaN Driver & Supply</strong>
            <p class="text-xs mt-1">Connect 220V AC input to Timber GaN driver. Slide driver directly into the profile cavity.</p>
          </div>
          <div class="p-3 bg-white/5 rounded">
            <strong class="text-white">Step 3: Insert Spring Clips & Lock Diffuser</strong>
            <p class="text-xs mt-1">Push extrusion into ceiling channel. Press-fit the continuous satin polycarbonate diffuser until it clicks.</p>
          </div>
        </div>
      `;
    } else {
      content = `
        <div class="resource-modal-header mb-4">
          <div class="section-badge">TIMBER SPECIFICATION</div>
          <h3 class="text-2xl font-bold">2026 Architectural Catalog (PDF)</h3>
        </div>
        <p class="text-sm text-muted mb-4">Complete 148-page technical lighting catalog featuring detailed CAD drawings, cutout cross-sections, and wiring schematics.</p>
        <button class="btn btn-primary w-full download-sim-btn" data-file="Timber_Light_2026_Catalog.pdf">
          <i class="fa-solid fa-file-pdf"></i> Download PDF Catalog (34 MB)
        </button>
      `;
    }

    body.innerHTML = content;
    modal.classList.add("active");

    // Attach mock download handlers
    body.querySelectorAll(".download-sim-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const file = btn.getAttribute("data-file") || "document.pdf";
        showToast(`Downloading ${file}...`, "success");
      });
    });
  }

  return {
    formatINR,
    showToast,
    playTactileSound,
    toggleSound,
    getCart,
    saveCart,
    getWishlist,
    saveWishlist,
    getUser,
    saveUser,
    openResourceModal
  };

})();
