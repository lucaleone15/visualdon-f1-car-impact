// ── Intro canvas (speed lines) + cursor + progress ───────────
export function initCursor() {
  const dot = document.getElementById('cursor-dot');
  if (!dot) return;
  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });
}

export function initProgress() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });
}

export function initIntroCanvas() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.parentElement?.offsetWidth  ?? window.innerWidth;
    canvas.height = canvas.parentElement?.offsetHeight ?? window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random(), y: Math.random(),
    len: Math.random() * 0.14 + 0.03,
    speed: Math.random() * 0.003 + 0.0008,
    opacity: Math.random() * 0.25 + 0.04,
    width: Math.random() * 1.2 + 0.3,
  }));

  let rafId;
  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.85);
    bg.addColorStop(0, 'rgba(24,10,6,0.97)');
    bg.addColorStop(1, 'rgba(20,18,16,1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    particles.forEach(p => {
      p.x -= p.speed;
      if (p.x < -p.len) p.x = 1 + Math.random() * 0.05;
      const x1 = p.x * w, x2 = (p.x + p.len) * w, y = p.y * h;
      const g = ctx.createLinearGradient(x1, y, x2, y);
      g.addColorStop(0, `rgba(212,0,15,0)`);
      g.addColorStop(0.5, `rgba(212,0,15,${p.opacity})`);
      g.addColorStop(1, `rgba(200,134,10,${p.opacity * 0.4})`);
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
      ctx.strokeStyle = g; ctx.lineWidth = p.width; ctx.stroke();
    });
    rafId = requestAnimationFrame(draw);
  }
  draw();

  const sec = document.getElementById('intro');
  if (sec) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!rafId) draw(); }
      else { cancelAnimationFrame(rafId); rafId = null; }
    }).observe(sec);
  }
}
