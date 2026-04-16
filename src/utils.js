// ── Shared utilities ─────────────────────────────────────────
let _tooltip = null;

export function initTooltip() {
  _tooltip = document.getElementById('ch3-tooltip');
  document.addEventListener('mousemove', e => {
    if (!_tooltip) return;
    const x = Math.min(e.clientX + 16, window.innerWidth - 260);
    const y = Math.min(e.clientY + 16, window.innerHeight - 180);
    _tooltip.style.left = x + 'px';
    _tooltip.style.top  = y + 'px';
  });
}

export function showTip(html) {
  if (_tooltip) { _tooltip.innerHTML = html; _tooltip.classList.add('show'); }
}
export function hideTip() {
  if (_tooltip) _tooltip.classList.remove('show');
}

export function svgDims(svgId) {
  const el = document.getElementById(svgId);
  if (!el) return { W: 800, H: window.innerHeight };
  const parent = el.closest('.sticky-vis') || el.parentElement;
  const W = parent ? parent.offsetWidth  : el.offsetWidth  || 800;
  const H = parent ? parent.offsetHeight : el.offsetHeight || window.innerHeight;
  return { W: W || 800, H: H || window.innerHeight };
}

export function clamp(val, min, max) {
  const size = Math.round(val * 0.055);
  return Math.min(Math.max(size, min), max);
}

export function countUp(el, from, to, duration, decimals, suffix = '') {
  if (!el) return;
  const start = performance.now();
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (from + (to - from) * ease).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
