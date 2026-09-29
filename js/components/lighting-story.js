/**
 * TIMBER LIGHT — "WHEN LIGHT FADES, PERFORMANCE MATTERS." CINEMATIC ENGINE (js/components/lighting-story.js)
 */

window.LightingStoryEngine = (function() {
  
  let currentPhase = "normal"; // normal, fading, blackout, timber, macro
  let isPlaying = false;
  let timerId = null;

  let screenEl = null;
  let statusTextEl = null;
  let playBtn = null;
  let stepPills = null;

  function init() {
    screenEl = document.getElementById("story-theater-screen");
    statusTextEl = document.getElementById("story-status-text");
    playBtn = document.getElementById("story-play-btn");
    stepPills = document.querySelectorAll(".story-step-pill");

    if (!screenEl) return;

    if (playBtn) {
      playBtn.addEventListener("click", togglePlay);
    }

    stepPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const targetPhase = pill.getAttribute("data-phase");
        if (targetPhase) {
          stopAutoPlay();
          setPhase(targetPhase);
        }
      });
    });

    // Auto-trigger when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isPlaying && currentPhase === "normal") {
          startCinematicSequence();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    const section = document.getElementById("lighting-story");
    if (section) observer.observe(section);
  }

  function setPhase(phase) {
    currentPhase = phase;
    if (!screenEl) return;

    screenEl.className = "story-theater-screen phase-" + phase;

    // Update Pills
    stepPills.forEach(pill => {
      pill.classList.toggle("active", pill.getAttribute("data-phase") === phase);
    });

    // Update Status Badge
    if (statusTextEl) {
      if (phase === "normal") {
        statusTextEl.innerHTML = `STAGE 01 &bull; Normal 3W Profile (Weak Initial Output)`;
      } else if (phase === "fading") {
        statusTextEl.innerHTML = `STAGE 02 &bull; Conventional Light Fading &amp; Flickering...`;
      } else if (phase === "blackout") {
        statusTextEl.innerHTML = `STAGE 03 &bull; Total Driver / Diode Failure (Room Dark)`;
      } else if (phase === "timber") {
        statusTextEl.innerHTML = `STAGE 04 &bull; <span class="text-amber">TIMBER TTL 10W TRANSFORMATION (3X BRIGHTER)</span>`;
      } else if (phase === "macro") {
        statusTextEl.innerHTML = `STAGE 05 &bull; <span class="text-amber">MACRO CLOSE-UP &bull; Precision Recessed Extrusion</span>`;
      }
    }

    if (phase === "timber") {
      TimberHelpers.playTactileSound("light-on");
    } else if (phase === "blackout") {
      TimberHelpers.playTactileSound("light-off");
    } else {
      TimberHelpers.playTactileSound("click");
    }
  }

  function startCinematicSequence() {
    isPlaying = true;
    if (playBtn) {
      playBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Replay Story`;
    }

    // Phase 1: Normal Light
    setPhase("normal");

    // Phase 2: Start Fading after 1.8s
    timerId = setTimeout(() => {
      setPhase("fading");

      // Phase 3: Blackout after 3.8s
      timerId = setTimeout(() => {
        setPhase("blackout");

        // Phase 4: Timber TTL Transformation after 2.0s pause
        timerId = setTimeout(() => {
          setPhase("timber");

          // Phase 5: Macro close up after 4.0s
          timerId = setTimeout(() => {
            setPhase("macro");
            isPlaying = false;
          }, 4000);

        }, 2000);

      }, 3800);

    }, 1800);
  }

  function togglePlay() {
    stopAutoPlay();
    startCinematicSequence();
  }

  function stopAutoPlay() {
    if (timerId) clearTimeout(timerId);
    isPlaying = false;
  }

  return {
    init,
    setPhase,
    startCinematicSequence
  };

})();
