/**
 * TIMBER LIGHT — EXPLODED 3D TECHNOLOGY & STUDIO ROTATION ENGINE (js/components/exploded-view.js)
 */

window.ExplodedViewEngine = (function() {
  
  function init() {
    initExplodedSection();
    initStudioSection();
  }

  function initExplodedSection() {
    const explodeBtn = document.getElementById("btn-explode-all");
    const assembleBtn = document.getElementById("btn-assemble-all");
    const explodedContainer = document.getElementById("exploded-view");
    const layers = document.querySelectorAll(".exploded-layer");

    if (!explodedContainer) return;

    if (explodeBtn) {
      explodeBtn.addEventListener("click", () => {
        explodeBtn.classList.add("active");
        if (assembleBtn) assembleBtn.classList.remove("active");
        explodedContainer.classList.remove("assembled");
        TimberHelpers.playTactileSound("click");
        TimberHelpers.showToast("Exploded layers expanded for detailed inspection.", "info");
      });
    }

    if (assembleBtn) {
      assembleBtn.addEventListener("click", () => {
        assembleBtn.classList.add("active");
        if (explodeBtn) explodeBtn.classList.remove("active");
        explodedContainer.classList.add("assembled");
        TimberHelpers.playTactileSound("click");
        TimberHelpers.showToast("System assembled into monolithic profile.", "info");
      });
    }

    // Layer click inspection
    layers.forEach(layer => {
      layer.addEventListener("click", () => {
        const layerNum = layer.getAttribute("data-layer");
        TimberHelpers.playTactileSound("click");
      });
    });
  }

  function initStudioSection() {
    const studioObject = document.getElementById("studio-object");
    const lightToggleBtn = document.getElementById("btn-studio-light-toggle");
    const lightStateText = document.getElementById("studio-light-state");
    const angleToggleBtn = document.getElementById("btn-studio-angle-toggle");
    const cctToggleBtn = document.getElementById("btn-studio-cct-toggle");
    const ledGlow = document.getElementById("studio-led-glow");
    const studioGlow = document.getElementById("studio-glow");
    const hotspots = document.querySelectorAll(".studio-hotspot");

    let isStudioLightOn = true;
    let currentAngle = 0; // 0, 1, 2
    let cctIndex = 0;
    const cctModes = ["4000K Neutral", "2700K Warm", "6000K Cool"];

    if (!studioObject) return;

    // Toggle Light in Studio View
    if (lightToggleBtn) {
      lightToggleBtn.addEventListener("click", () => {
        isStudioLightOn = !isStudioLightOn;
        lightToggleBtn.classList.toggle("active", isStudioLightOn);
        if (lightStateText) {
          lightStateText.textContent = isStudioLightOn ? "Light: ON" : "Light: OFF";
        }
        if (ledGlow) ledGlow.style.opacity = isStudioLightOn ? "1" : "0";
        if (studioGlow) studioGlow.style.opacity = isStudioLightOn ? "1" : "0";
        TimberHelpers.playTactileSound(isStudioLightOn ? "light-on" : "light-off");
      });
    }

    // Rotate 3D Angle
    if (angleToggleBtn) {
      angleToggleBtn.addEventListener("click", () => {
        currentAngle = (currentAngle + 1) % 3;
        TimberHelpers.playTactileSound("click");
        if (currentAngle === 0) {
          studioObject.style.transform = "rotateX(15deg) rotateY(-20deg)";
        } else if (currentAngle === 1) {
          studioObject.style.transform = "rotateX(0deg) rotateY(0deg) scale(1.1)";
        } else {
          studioObject.style.transform = "rotateX(30deg) rotateY(35deg) scale(0.95)";
        }
      });
    }

    // Switch CCT in Studio
    if (cctToggleBtn) {
      cctToggleBtn.addEventListener("click", () => {
        cctIndex = (cctIndex + 1) % cctModes.length;
        TimberHelpers.playTactileSound("click");
        TimberHelpers.showToast(`Studio CCT switched to ${cctModes[cctIndex]}`, "info");
      });
    }

    // Hotspot clicks
    hotspots.forEach(spot => {
      spot.addEventListener("click", () => {
        const title = spot.getAttribute("title");
        TimberHelpers.playTactileSound("click");
        TimberHelpers.showToast(`Inspecting: ${title}`, "info");
      });
    });
  }

  return { init };

})();
