/**
 * TIMBER LIGHT — ACCOUNT ENGINE (js/components/account.js)
 * Clean, lightweight account and orders modal.
 */

window.AccountEngine = (function() {
  
  let modal = null;
  let modalBody = null;
  let closeBtn = null;

  function init() {
    modal = document.getElementById("account-modal");
    modalBody = document.getElementById("account-modal-body");
    closeBtn = document.getElementById("account-modal-close");

    const trigger = document.getElementById("account-trigger");

    if (trigger) trigger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }
  }

  function open() {
    if (!modal) return;
    render();
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function render() {
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        
        <div style="display:flex; align-items:center; gap:1rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--amber-soft); border:1px solid var(--amber-border); color:var(--amber-dark); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
            <i class="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <h4 style="font-size:1.05rem; margin-bottom:0.15rem;">Studio Ar. Rajesh Sharma</h4>
            <span style="font-size:0.8rem; color:var(--text-muted);">Trade Account &bull; Verified Architect</span>
          </div>
        </div>

        <h4 style="font-size:0.95rem; font-weight:700;">Recent Architectural Orders</h4>

        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          
          <div style="background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.85rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; font-size:0.85rem;">
              <strong>Order #TL-849201</strong>
              <span class="text-success" style="font-weight:700;">Dispatched</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.5rem;">
              Timber TTL-1035 &times; 12m &bull; Total: ₹22,200
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.72rem; color:var(--text-muted);">Tracking: DTDC-92817492</span>
              <button class="btn btn-outline btn-xs" onclick="TimberHelpers.showToast('Tax invoice PDF downloaded.', 'success')">Download Invoice</button>
            </div>
          </div>

          <div style="background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.85rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem; font-size:0.85rem;">
              <strong>Order #TL-710293</strong>
              <span class="text-success" style="font-weight:700;">Delivered</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.5rem;">
              Timber TTL-1050 Deep &times; 8m &bull; Total: ₹19,600
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.72rem; color:var(--text-muted);">Delivered to: New Delhi Site</span>
              <button class="btn btn-outline btn-xs" onclick="TimberHelpers.showToast('Tax invoice PDF downloaded.', 'success')">Download Invoice</button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  return {
    init,
    open,
    close
  };
})();
