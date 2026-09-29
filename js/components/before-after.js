/**
 * TIMBER LIGHT — BEFORE / AFTER INTERACTIVE COMPARISON SLIDER (js/components/before-after.js)
 */

window.BeforeAfterSlider = (function() {
  
  let container = null;
  let beforeLayer = null;
  let handle = null;
  let isDragging = false;

  function init() {
    container = document.getElementById("before-after-slider-container");
    beforeLayer = document.getElementById("ba-before-layer");
    handle = document.getElementById("ba-handle");

    if (!container || !beforeLayer || !handle) return;

    // Mouse Events
    handle.addEventListener("mousedown", startDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("mousemove", onDrag);

    // Touch Events
    handle.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("touchend", stopDrag);
    window.addEventListener("touchmove", onDrag, { passive: false });

    // Click on container to jump slider
    container.addEventListener("click", (e) => {
      setPosition(e.clientX);
    });

    // Set initial 50% split
    updateSlider(50);
  }

  function startDrag(e) {
    isDragging = true;
    TimberHelpers.playTactileSound("click");
  }

  function stopDrag() {
    isDragging = false;
  }

  function onDrag(e) {
    if (!isDragging) return;
    if (e.type === "touchmove") {
      e.preventDefault();
      setPosition(e.touches[0].clientX);
    } else {
      setPosition(e.clientX);
    }
  }

  function setPosition(clientX) {
    const rect = container.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    updateSlider(percentage);
  }

  function updateSlider(percentage) {
    if (beforeLayer) beforeLayer.style.width = `${percentage}%`;
    if (handle) handle.style.left = `${percentage}%`;
  }

  return { init, updateSlider };

})();
