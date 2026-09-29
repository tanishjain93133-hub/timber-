/**
 * TIMBER LIGHT — DEDICATED LIGHT LAB ENGINE (js/components/light-lab.js)
 * Standalone dedicated interactive architectural lighting experience.
 * Press & Hold the actual ceiling-mounted Timber profile luminaire to illuminate the room.
 */

const LightLabEngine = {
  isOpen: false,
  isHolding: false,
  powerLevel: 0, // 0.0 to 1.0
  targetPower: 0,
  animFrameId: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Navigation trigger
    document.querySelectorAll('[data-action="open-light-lab"], a[href="#light-lab"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close / Back to Shop triggers
    const closeBtn = document.getElementById('light-lab-close');
    const backBtn = document.getElementById('light-lab-back-shop');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (backBtn) backBtn.addEventListener('click', () => this.close());

    // ESC key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Press & Hold Light Target
    const lightTarget = document.getElementById('lab-profile-light');
    if (lightTarget) {
      // Mouse Events
      lightTarget.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.startHold();
      });

      window.addEventListener('mouseup', () => {
        if (this.isHolding) this.stopHold();
      });

      // Touch Events (Mobile)
      lightTarget.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startHold();
      }, { passive: false });

      window.addEventListener('touchend', () => {
        if (this.isHolding) this.stopHold();
      });

      window.addEventListener('touchcancel', () => {
        if (this.isHolding) this.stopHold();
      });
    }

    // Mini PDP Light Lab Preview instances
    const pdpPreviewLight = document.getElementById('pdp-preview-light');
    if (pdpPreviewLight) {
      pdpPreviewLight.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.startPdpPreviewHold(true);
      });
      window.addEventListener('mouseup', () => {
        this.startPdpPreviewHold(false);
      });
      pdpPreviewLight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startPdpPreviewHold(true);
      }, { passive: false });
      window.addEventListener('touchend', () => {
        this.startPdpPreviewHold(false);
      });
    }
  },

  open() {
    const modal = document.getElementById('light-lab-modal');
    if (!modal) return;
    this.isOpen = true;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.startLoop();
  },

  close() {
    const modal = document.getElementById('light-lab-modal');
    if (!modal) return;
    this.isOpen = false;
    this.stopHold();
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  },

  startHold() {
    this.isHolding = true;
    this.targetPower = 1.0;
    const hint = document.getElementById('lab-hint-pulse');
    if (hint) hint.classList.add('holding');
  },

  stopHold() {
    this.isHolding = false;
    this.targetPower = 0.0;
    const hint = document.getElementById('lab-hint-pulse');
    if (hint) hint.classList.remove('holding');
  },

  startLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    
    const tick = () => {
      // Smooth interpolation for warm gradual ramp-up & fade-out
      const speed = this.isHolding ? 0.06 : 0.04;
      this.powerLevel += (this.targetPower - this.powerLevel) * speed;
      
      if (Math.abs(this.powerLevel - this.targetPower) < 0.001) {
        this.powerLevel = this.targetPower;
      }

      this.render();

      if (this.isOpen) {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    this.animFrameId = requestAnimationFrame(tick);
  },

  render() {
    const p = this.powerLevel;
    const room = document.getElementById('lab-room-stage');
    const sideSpecs = document.getElementById('lab-side-specs');
    const luxVal = document.getElementById('lab-lux-val');
    const diffuser = document.getElementById('lab-light-diffuser');
    const floorGlow = document.getElementById('lab-floor-glow');
    const wallWash = document.getElementById('lab-wall-wash');

    if (diffuser) {
      diffuser.style.boxShadow = `0 0 ${10 + p * 50}px ${p * 20}px rgba(251, 191, 36, ${0.1 + p * 0.9}), 0 0 ${p * 100}px rgba(245, 158, 11, ${p * 0.6})`;
      diffuser.style.background = `rgba(255, ${240 + p * 15}, ${220 + p * 35}, ${0.4 + p * 0.6})`;
    }

    if (room) {
      // Realistic ambient illumination spread across walls, ceiling, furniture
      room.style.setProperty('--illumination-level', p);
    }

    if (wallWash) {
      wallWash.style.opacity = (p * 0.95).toFixed(3);
    }

    if (floorGlow) {
      floorGlow.style.opacity = (p * 0.85).toFixed(3);
    }

    if (luxVal) {
      const lumens = Math.round(p * 1150);
      luxVal.textContent = `${lumens} lm/ft`;
    }

    if (sideSpecs) {
      if (p > 0.15) {
        sideSpecs.classList.add('visible');
        sideSpecs.style.opacity = Math.min(1, (p - 0.15) / 0.5);
        sideSpecs.style.transform = `translateY(${(1 - p) * 15}px)`;
      } else {
        sideSpecs.classList.remove('visible');
        sideSpecs.style.opacity = '0';
        sideSpecs.style.transform = 'translateY(15px)';
      }
    }
  },

  startPdpPreviewHold(isPress) {
    const previewContainer = document.getElementById('pdp-lighting-preview-box');
    if (!previewContainer) return;
    if (isPress) {
      previewContainer.classList.add('illuminated');
    } else {
      previewContainer.classList.remove('illuminated');
    }
  }
};

window.LightLabEngine = LightLabEngine;
