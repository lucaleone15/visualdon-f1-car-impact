// ── Main charts module — ES imports from d3 ──────────────────
import * as d3 from 'd3';
import { TEAM_COLORS, teamColor } from './colors.js';
import { svgDims, showTip, hideTip, clamp, countUp } from './utils.js';


// ── Shared state ─────────────────────────────────────────────
let ch1State = -1;
let activeRadialYear = 2000;
let ch4State = -1;
let scatterDataCache = null;
let activeDrivers = ['Lewis Hamilton', 'Fernando Alonso'];

function drawF1CarWithPies(g, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const FF = "'Poppins', system-ui, sans-serif";
  const FM = "'Inter', 'Helvetica Neue', system-ui, sans-serif";

  // ── Sizing: car wide, centered vertically on wheel axles ──
  // SVG viewBox 98.751×98.75 — wheels at x=22.1 / 86.7, y=53.8
  // Reserve top space for title, bottom for stat labels
  const pad = { top: h * 0.18, bot: h * 0.22 };
  const availH = h - pad.top - pad.bot;
  const carW = Math.min(w * 0.82, availH * 1.1);
  const carX = cx - carW / 2;
  // place wheel-center (54.3% down) at vertical midpoint of available area
  const wheelCY = pad.top + availH * 0.5;
  const carY = wheelCY - 0.543 * carW;
  const sx = carW / 98.751;
  const sy = carW / 98.75;

  // ── SVG defs: glow filter ──
  const defs2 = g.append('defs');
  const glowF = defs2.append('filter').attr('id', 'f1-glow').attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%');
  glowF.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '4').attr('result', 'blur');
  const fm = glowF.append('feMerge');
  fm.append('feMergeNode').attr('in', 'blur');
  fm.append('feMergeNode').attr('in', 'SourceGraphic');

  // ── Car body ──
  const carG = g.append('g').attr('transform', `translate(${carX},${carY})`).attr('opacity', 0);
  carG.transition().duration(700).ease(d3.easeCubicOut).attr('opacity', 1);
  const pathG = carG.append('g').attr('transform', `scale(${sx},${sy})`);

  // Wheel hubs (dark)
  const HUB_PATH_L = 'M22.106,46.936c-3.79,0-6.866,3.071-6.866,6.866c0,0.293,0.024,0.58,0.062,0.862c0.426,3.386,3.307,6.003,6.805,6.003c3.598,0,6.54-2.761,6.839-6.279c0.017-0.194,0.03-0.389,0.03-0.586C28.976,50.008,25.9,46.936,22.106,46.936z';
  const HUB_PATH_R = 'M86.74,46.936c-3.79,0-6.866,3.071-6.866,6.866c0,0.293,0.024,0.58,0.062,0.862c0.426,3.386,3.308,6.003,6.806,6.003c3.598,0,6.54-2.761,6.84-6.279c0.017-0.194,0.028-0.389,0.028-0.586C93.609,50.008,90.535,46.936,86.74,46.936z';
  pathG.append('path').attr('d', HUB_PATH_L).attr('fill', '#2a2a3a');
  pathG.append('path').attr('d', HUB_PATH_R).attr('fill', '#2a2a3a');

  // Main body (red) with glow
  pathG.append('path')
    .attr('d', 'M78.029,53.801c0-3.049,1.638-5.717,4.072-7.19l-16.177-7.166H55.775c-0.604,0-1.094,0.49-1.094,1.095v1.438c0,0.604,0.489,1.095,1.094,1.095h0.72v0.997h-1.841c-0.579,0-1.096,0.371-1.277,0.921L53.23,45.43c-3.351-0.271-4.945,2.294-6.62,2.294l-1.131-1.361c-0.674-0.813-1.706-1.241-2.758-1.144c-0.32,0.03-0.661,0.094-1.008,0.211l-0.635,2.294c0,0-5.759-0.335-13.245-0.066c1.648,1.537,2.687,3.72,2.687,6.146c0,0.24,0.039,5.32,0.039,5.32h49.383c-0.976-1.188-1.637-2.648-1.84-4.266C78.055,54.485,78.029,54.135,78.029,53.801z')
    .attr('fill', '#e8001a').attr('filter', 'url(#f1-glow)');

  // Rear/exhaust section
  pathG.append('path')
    .attr('d', 'M13.695,53.801c0-1.928,0.659-3.699,1.753-5.12C9.664,49.487,4.044,50.83,0,53.047c0,1.176,5.168,0.019,5.168,2.448H1.181c-0.402,0-0.728,0.325-0.728,0.728v2.172c0,0.402,0.325,0.729,0.728,0.729h9.969c0.403,0,0.729-0.326,0.729-0.729v-3.354h1.922c-0.009-0.062-0.024-0.121-0.032-0.185C13.72,54.485,13.695,54.135,13.695,53.801z')
    .attr('fill', '#100d0c').attr('stroke', 'rgba(232,0,26,0.5)').attr('stroke-width', '0.5');

  // Front wing
  pathG.append('path')
    .attr('d', 'M96.938,38.084H86.284c-1.003,0-1.815,0.812-1.815,1.814v2.376c0,0.48,0.191,0.942,0.531,1.282l1.855,1.854c4.446,0.218,8,3.893,8,8.391c0,0.111-0.012,0.224-0.017,0.334h3.912V39.899C98.752,38.896,97.939,38.084,96.938,38.084z')
    .attr('fill', '#100d0c').attr('stroke', 'rgba(232,0,26,0.6)').attr('stroke-width', '0.7');

  // ── Wheel positions ──
  const wheelR = Math.min(Math.max(h * 0.055, 18), 36);
  const leftX = carX + 22.1 * sx;
  const leftY = carY + 53.8 * sy;
  const rightX = carX + 86.7 * sx;
  const rightY = carY + 53.8 * sy;

  // ── Pie donut on each wheel ──
  function drawWheel(x, y, r, pct, color, valLine1, valLine2) {
    const tau = 2 * Math.PI;
    const arcFull = d3.arc().innerRadius(r * 0.36).outerRadius(r).startAngle(0).endAngle(tau);
    const arcFill = d3.arc().innerRadius(r * 0.36).outerRadius(r).startAngle(0).endAngle(tau * pct);

    const wg = g.append('g').attr('transform', `translate(${x},${y})`).attr('opacity', 0);
    wg.transition().delay(500).duration(700).attr('opacity', 1);

    // Background track
    wg.append('path').attr('d', arcFull()).attr('fill', 'rgba(255,255,255,0.38)');
    // Filled arc
    wg.append('path').attr('d', arcFill()).attr('fill', color)
      .style('filter', `drop-shadow(0 0 5px ${color}99)`);

    // Inner circle (dark)
    wg.append('circle').attr('r', r * 0.36).attr('fill', '#0d0b0a');

    // Center value: line 1 (big)
    wg.append('text')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('y', valLine2 ? -r * 0.18 : 0)
      .attr('font-family', FF).attr('font-size', `${r * 0.46}px`).attr('font-weight', '700')
      .attr('fill', '#f0ede6').text(valLine1);
    if (valLine2) {
      wg.append('text')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('y', r * 0.3)
        .attr('font-family', FM).attr('font-size', `${Math.max(7, r * 0.22)}px`)
        .attr('fill', 'rgba(240,237,230,0.55)').text(valLine2);
    }
  }

  drawWheel(leftX, leftY, wheelR, 0.67, '#e8001a', '×2', 'VER/PER');
  drawWheel(rightX, rightY, wheelR, 0.83, '#c8860a', '15/18', 'HAM');

  // ── Stat labels: positioned cleanly above/below each wheel ──
  function statLabel(x, anchorY, isAbove, lines, color) {
    const lg = g.append('g').attr('opacity', 0);
    lg.transition().delay(800).duration(500).attr('opacity', 1);
    const step = 16;
    lines.forEach((line, i) => {
      const isBig = i === 0;
      lg.append('text')
        .attr('x', x).attr('y', anchorY + (isAbove ? -(lines.length - i - 1) * step : i * step))
        .attr('text-anchor', 'middle')
        .attr('font-family', isBig ? FF : FM)
        .attr('font-size', isBig ? `${Math.min(16, wheelR * 0.5)}px` : `${Math.min(11, wheelR * 0.35)}px`)
        .attr('font-weight', isBig ? '700' : '400')
        .attr('fill', isBig ? '#f0ede6' : 'rgba(240,237,230,0.5)')
        .text(line);
    });
  }

  const labelGap = wheelR + 14;
  // Left wheel — above: stat name / below: context
  statLabel(leftX, leftY - labelGap, true, ['Verstappen 2023', '×2 plus de points que Pérez'], '#e8001a');
  statLabel(leftX, leftY + labelGap, false, ['24,1 vs 11,8 pts/course', 'même voiture'], 'rgba(240,237,230,0.4)');

  // Right wheel — above / below
  statLabel(rightX, rightY - labelGap, true, ['Hamilton 2007–2024', '15 saisons sur 18 au-dessus'], '#c8860a');
  statLabel(rightX, rightY + labelGap, false, ['McLaren · Mercedes', 'peu importe la voiture'], 'rgba(240,237,230,0.4)');

  // ── Main title ──
  const titleY = Math.max(20, pad.top * 0.45);
  g.append('text').attr('x', cx).attr('y', titleY)
    .attr('text-anchor', 'middle')
    .attr('font-family', FM).attr('font-size', '0.65rem').attr('letter-spacing', '0.3em')
    .attr('fill', 'rgba(212,0,15,0.8)').attr('opacity', 0)
    .text('MÊME VOITURE')
    .transition().delay(150).duration(600).attr('opacity', 1);

  g.append('text').attr('x', cx).attr('y', titleY + 22)
    .attr('text-anchor', 'middle')
    .attr('font-family', FF)
    .attr('font-size', `${Math.max(20, Math.min(36, w * 0.038))}px`)
    .attr('font-weight', '700').attr('font-style', 'italic')
    .attr('fill', '#f0ede6').attr('opacity', 0)
    .text('Résultats différents.')
    .transition().delay(300).duration(700).attr('opacity', 1);
}



function initCh1(teammateData) {

  // FIX #4 — forcer re-render en invalidant l'état lors d'un resize
  function invalidate() { ch1State = -1; }
  window.addEventListener('resize', invalidate);

  function render(state) {
    // FIX #4 — toujours re-render (on ne bloque plus sur ch1State)
    ch1State = state;

    const svg = d3.select('#svg-ch1');
    svg.selectAll('*').remove();

    // FIX #1 #5 — utiliser le parent sticky-vis pour les dimensions
    const { W, H } = svgDims('svg-ch1');
    svg.attr('width', W).attr('height', H);

    // Responsive margins: on large screens, push data to the right half
    const m = W < 900
      ? { top: 30, right: 20, bottom: 40, left: 20 }
      : { top: 60, right: 60, bottom: 60, left: W * 0.45 }; // 45% left padding avoids the overlay card
    const cw = W - m.left - m.right;
    const ch = H - m.top - m.bottom;
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const ann = document.getElementById('ann1');

    // Setup global definitions (glow filter)
    const defs = svg.append("defs");
    Object.keys(TEAM_COLORS).forEach(team => {
      const c = teamColor(team);
      const filter = defs.append("filter").attr("id", `glow-${team.replace(/\s+/g, '')}`);
      filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    // Show/hide radial year UI depending on state
    const rUI = document.getElementById('radial-year-ui');

    if (state === 0) {
      if (rUI) rUI.style.display = 'none';
      drawF1CarWithPies(g, cw, ch);
      if (ann) ann.textContent = 'Méthode : deux pilotes, une seule voiture';

    } else if (state === 1) {
      if (rUI) rUI.style.display = 'flex';
      if (ann) ann.textContent = activeRadialYear + ' — duels coéquipiers, même voiture';
      drawRadialSelection(teammateData, g, cw, ch);

    } else if (state === 2) {
      if (rUI) rUI.style.display = 'none';
      const top15 = [...teammateData]
        .map(d => ({ ...d, gap: Math.abs(d.d1_ppr - d.d2_ppr) }))
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 15);
      // extra top margin so the grid header (labels at top) has room
      const g2 = svg.append('g').attr('transform', `translate(${m.left},${m.top + 44})`);
      drawDuelBars(g2, cw, ch - 44, top15, 'highlight');
      if (ann) ann.textContent = 'Top 15 écarts coéquipiers — 2000/2024';
    }
  }

  window._ch1Render = render; // expose for year-sync from radial selector
  return render;
}


/* ─────────────────────────────────────────────────────────────────
   drawDuel2023 — visualisation interactive des duels 2023
   Chaque équipe = une ligne avec deux barres côte à côte
   Hover → tooltip avec pts/course, gap mis en évidence
───────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────
   drawRadialSelection — Radial Layout with Year Selection
   Chaque pilote orbite autour de la voiture (le centre).
───────────────────────────────────────────────────────────────── */

let _radialAutoTimer = null;
let _radialPlaying = true;

function drawRadialSelection(allData, g, w, h) {
  g.selectAll('*').remove();

  // ── Year data ──
  const validYears = [...new Set(allData.map(d => d.year))].sort((a, b) => a - b); // ASC: 2000→2024
  const displayYears = validYears; // all years

  // ── Build UI once ──
  let ui = document.getElementById('radial-year-ui');
  if (!ui) {
    ui = document.createElement('div');
    ui.id = 'radial-year-ui';
    Object.assign(ui.style, {
      position: 'fixed', top: '0.7rem', left: '50%', transform: 'translateX(-50%)',
      display: 'none', flexDirection: 'row', alignItems: 'center',
      gap: '0', zIndex: '500', maxWidth: '96vw', overflowX: 'auto',
      background: 'rgba(14,12,10,0.96)', padding: '0.35rem 0.5rem',
      borderBottom: '1px solid rgba(240,237,230,0.38)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
    });
    document.body.appendChild(ui);

    // Show only when ch1 state=1 (radial)
    const ch1El = document.getElementById('ch1');
    if (ch1El) {
      new IntersectionObserver(entries => {
        ui.style.display = (entries[0].isIntersecting && ch1State === 1) ? 'flex' : 'none';
      }, { threshold: 0.1 }).observe(ch1El);
    }
  }

  // ── Rebuild buttons + controls ──
  ui.innerHTML = '';

  // Play/Pause button
  const playBtn = document.createElement('button');
  playBtn.id = 'radial-play-btn';
  Object.assign(playBtn.style, {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(240,237,230,0.55)', fontSize: '0.9rem',
    padding: '0 0.6rem 0 0.2rem', flexShrink: '0', lineHeight: '1',
  });
  playBtn.title = _radialPlaying ? 'Pause' : 'Lecture auto';
  playBtn.textContent = _radialPlaying ? '⏸' : '▶';
  playBtn.onclick = () => {
    _radialPlaying = !_radialPlaying;
    playBtn.textContent = _radialPlaying ? '⏸' : '▶';
    if (_radialPlaying) startAutoplay();
    else stopAutoplay();
  };
  ui.appendChild(playBtn);

  // Separator
  const sep = document.createElement('div');
  Object.assign(sep.style, { width: '1px', height: '16px', background: 'rgba(240,237,230,0.38)', flexShrink: '0', marginRight: '0.4rem' });
  ui.appendChild(sep);

  // Year buttons — single row, left→right
  displayYears.forEach(y => {
    const btn = document.createElement('button');
    btn.textContent = y;
    btn.dataset.year = y;
    Object.assign(btn.style, {
      background: y === activeRadialYear ? '#d4000f' : 'transparent',
      color: y === activeRadialYear ? '#fff' : 'rgba(240,237,230,0.38)',
      border: 'none', padding: '0.25rem 0.55rem',
      cursor: 'pointer',
      fontFamily: "'Inter', 'Helvetica Neue', system-ui, sans-serif", fontSize: '0.58rem',
      letterSpacing: '0.04em', flexShrink: '0', lineHeight: '1.4',
      transition: 'color 0.15s, background 0.15s',
    });
    btn.onclick = () => {
      stopAutoplay();
      _radialPlaying = false;
      const pb = document.getElementById('radial-play-btn');
      if (pb) pb.textContent = '▶';
      activeRadialYear = y;
      drawRadialSelection(allData, g, w, h);
    };
    ui.appendChild(btn);
  });

  // ── Autoplay ──
  function stopAutoplay() {
    if (_radialAutoTimer) { clearInterval(_radialAutoTimer); _radialAutoTimer = null; }
  }
  function startAutoplay() {
    stopAutoplay();
    _radialAutoTimer = setInterval(() => {
      const idx = displayYears.indexOf(activeRadialYear);
      activeRadialYear = displayYears[(idx + 1) % displayYears.length];
      drawRadialSelection(allData, g, w, h);
    }, 10000);
  }
  if (_radialPlaying) startAutoplay();

  const yearData = allData.filter(d => d.year === activeRadialYear);

  // Format into standard structure
  const data = yearData.map(d => {
    const isD1Winner = d.d1_ppr >= d.d2_ppr;
    return {
      team: d.constructor || 'Équipe',
      w: isD1Winner ? d.d1.split(' ').pop() : d.d2.split(' ').pop(),
      l: isD1Winner ? d.d2.split(' ').pop() : d.d1.split(' ').pop(),
      w_ppr: Math.max(d.d1_ppr, d.d2_ppr),
      l_ppr: Math.min(d.d1_ppr, d.d2_ppr),
      color: teamColor(d.constructor)
    };
  }).slice(0, 10); // Max 10 teams

  const tooltip = d3.select('#ch3-tooltip');
  const cx = w / 2;
  const cy = h / 2 - 20;

  // Headers
  g.append('text').attr('x', cx).attr('y', cy - Math.min(cx, cy) * 0.85)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.70rem')
    .attr('font-weight', '700').attr('letter-spacing', '0.18em').attr('fill', '#8a8a80').attr('opacity', 0)
    .text(`SAISON ${activeRadialYear} · DUELS COÉQUIPIERS`)
    .transition().duration(500).attr('opacity', 1);

  g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 50)
    .attr('fill', 'none').attr('stroke', '#f0ede6').attr('stroke-width', 1).attr('opacity', 0.1)
    .transition().delay(100).duration(1000).attr('opacity', 0.1);

  const radiusLine = Math.min(cx, cy) * 0.70; // Slightly smaller to leave room for text

  data.forEach((d, i) => {
    const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
    const teamColor = d.color;
    // Map ppr to distance from center. Base radius is 50. Max radius is radiusLine
    const maxPpr = 25; // max point is Verstappen ~24

    const rW = 50 + (d.w_ppr / maxPpr) * (radiusLine - 50);
    const rL = 50 + (d.l_ppr / maxPpr) * (radiusLine - 50);

    const xw = cx + Math.cos(angle) * rW;
    const yw = cy + Math.sin(angle) * rW;
    const xl = cx + Math.cos(angle) * rL;
    const yl = cy + Math.sin(angle) * rL;

    // Track connecting the two points
    const trackG = g.append('g').attr('opacity', 0);
    trackG.transition().delay(i * 100 + 400).duration(800).attr('opacity', 1);

    // Inner line to center
    trackG.append('line')
      .attr('x1', cx + Math.cos(angle) * 45).attr('y1', cy + Math.sin(angle) * 45)
      .attr('x2', xl).attr('y2', yl)
      .attr('stroke', teamColor).attr('stroke-width', 1).attr('opacity', 0.2);

    // Track between drivers
    trackG.append('line')
      .attr('x1', xl).attr('y1', yl)
      .attr('x2', xw).attr('y2', yw)
      .attr('stroke', teamColor).attr('stroke-width', 3).attr('stroke-linecap', 'round').attr('opacity', 0.7);

    // Label team
    const txtR = radiusLine + 40;
    const xt = cx + Math.cos(angle) * txtR;
    const yt = cy + Math.sin(angle) * txtR;
    const align = Math.cos(angle) > 0.1 ? 'start' : Math.cos(angle) < -0.1 ? 'end' : 'middle';
    trackG.append('text')
      .attr('x', xt).attr('y', yt)
      .attr('text-anchor', align)
      .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.90rem')
      .attr('font-weight', '700').attr('fill', teamColor)
      .text(d.team);

    // Winner Dot
    trackG.append('circle').attr('cx', xw).attr('cy', yw).attr('r', 5).attr('fill', teamColor)
      .style('filter', `drop-shadow(0 0 6px ${teamColor})`);
    trackG.append('text')
      .attr('x', xw + (Math.cos(angle) > 0 ? 10 : -10)).attr('y', yw + (Math.sin(angle) > 0 ? 10 : -10))
      .attr('text-anchor', Math.cos(angle) > 0 ? 'start' : 'end')
      .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#f0ede6')
      .text(d.w);

    // Loser Dot
    trackG.append('circle').attr('cx', xl).attr('cy', yl).attr('r', 3).attr('fill', '#ff1e38');
    trackG.append('text')
      .attr('x', xl + (Math.cos(angle) > 0 ? -8 : 8)).attr('y', yl + (Math.sin(angle) > 0 ? -4 : 4))
      .attr('text-anchor', Math.cos(angle) > 0 ? 'end' : 'start')
      .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#7a7a90')
      .text(d.l);

    // Invisible Hitbox for tooltip
    trackG.append('path')
      .attr('d', `M ${cx} ${cy} L ${xw + Math.cos(angle) * 40} ${yw + Math.sin(angle) * 40}`)
      .attr('stroke', 'transparent').attr('stroke-width', 30).attr('fill', 'none')
      .style('cursor', 'pointer')
      .on('mouseover', function (event) {
        trackG.select('line:nth-child(2)').attr('stroke-width', 5).attr('opacity', 1);
        const gap = +(d.w_ppr - d.l_ppr).toFixed(1);
        tooltip.html(`
          <div class="tt-name" style="color:${d.color}">${d.team} ${activeRadialYear}</div>
          <div class="tt-row"><span style="color:#f0f0f5;font-weight:700">${d.w}</span><span class="tt-val">${d.w_ppr.toFixed(1)} pts/course</span></div>
          <div class="tt-row"><span style="color:#7a7a90">${d.l}</span><span class="tt-val" style="color:#7a7a90">${d.l_ppr.toFixed(1)} pts/course</span></div>
          <div class="tt-row" style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.38);padding-top:6px">
            <span>Écart</span><span class="tt-val" style="color:${gap >= 5 ? 'var(--gold)' : '#fff'}">${gap > 0.1 ? '+' + gap.toFixed(1) + ' pts/course' : 'Duel serré'}</span>
          </div>
        `).classed('show', true);
      })
      .on('mousemove', function (event) {
        tooltip.style('left', (event.pageX + 14) + 'px').style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function () {
        trackG.select('line:nth-child(2)').attr('stroke-width', 3).attr('opacity', 0.7);
        tooltip.classed('show', false);
      });
  });
}



/* ─────────────────────────────────────────────────────────────────
   drawDuelBars — Dumbbell Plot
   Displays team delta by plotting both drivers on a horizontal line.
───────────────────────────────────────────────────────────────── */
function drawDuelBars(g, w, h, data, mode) {
  if (!data || !data.length) return;

  const getGap = d => Math.abs(d.d1_ppr - d.d2_ppr);
  const getWinner = d => d.d1_ppr >= d.d2_ppr ? d.d1 : d.d2;
  const getLoser = d => d.d1_ppr >= d.d2_ppr ? d.d2 : d.d1;
  const getWPPR = d => Math.max(d.d1_ppr, d.d2_ppr);
  const getLPPR = d => Math.min(d.d1_ppr, d.d2_ppr);

  // Sort: colored/highlight → by gap DESC (biggest domination first)
  //       grey → by winner PPR DESC (best team at top, logical grid order)
  if (mode === 'colored' || mode === 'highlight') {
    data = [...data].sort((a, b) => getGap(b) - getGap(a));
  } else {
    data = [...data].sort((a, b) => getWPPR(b) - getWPPR(a));
  }

  const ROW_H = Math.min(60, Math.floor(h / data.length) - 5);
  const BAND_H = h / data.length;
  const tooltip = d3.select('#ch3-tooltip');

  function getColor(d) {
    if (mode === 'grey') return '#3a3a50';
    const gap = getGap(d);
    if (mode === 'colored') return gap >= 2 ? 'var(--gold)' : '#3a3a50';
    if (mode === 'highlight') return teamColor(d.constructor);
    return '#3a3a50';
  }

  // Max PPR across all data for the X scale
  const maxPPR = d3.max(data, d => getWPPR(d)) || 20;

  // Create a horizontal X scale that maps 0 -> maxPPR over 70% of graph width
  const LABEL_W = 120;
  const px = d3.scaleLinear().domain([0, maxPPR * 1.05]).range([LABEL_W, w - 40]);

  // ── Grid: dashed vertical lines + labeled pts values at top ──
  const ticks = px.ticks(6);
  const gridTop = -28;

  // Grid lines
  g.selectAll('.x-grid').data(ticks).join('line').attr('class', 'x-grid')
    .attr('x1', d => px(d)).attr('x2', d => px(d))
    .attr('y1', gridTop).attr('y2', h)
    .attr('stroke', 'rgba(240,237,230,0.38)').attr('stroke-width', 1)
    .attr('stroke-dasharray', '3 6');

  // Grid tick circles (dot on each line at top)
  g.selectAll('.x-tick-dot').data(ticks).join('circle').attr('class', 'x-tick-dot')
    .attr('cx', d => px(d)).attr('cy', gridTop)
    .attr('r', 2.5)
    .attr('fill', 'rgba(240,237,230,0.38)');

  // Grid tick labels
  g.selectAll('.x-tick').data(ticks).join('text').attr('class', 'x-tick')
    .attr('x', d => px(d)).attr('y', gridTop - 6)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Poppins', system-ui, sans-serif")
    .attr('font-size', '0.65rem').attr('fill', 'rgba(240,237,230,0.3)')
    .text(d => d + ' pts');

  // X axis label
  g.append('text')
    .attr('x', LABEL_W + (w - 40 - LABEL_W) / 2).attr('y', gridTop - 18)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Poppins', system-ui, sans-serif")
    .attr('font-size', '0.65rem').attr('fill', 'rgba(240,237,230,0.38)')
    .text('Points par course ← dominé  |  dominant →');

  data.forEach((d, i) => {
    const oy = i * BAND_H + (BAND_H - ROW_H) / 2;
    const gap = getGap(d);
    const color = getColor(d);
    const winner = getWinner(d);
    const loser = getLoser(d);
    const wPPR = getWPPR(d);
    const lPPR = getLPPR(d);

    const rowG = g.append('g').attr('transform', `translate(0,${oy})`).style('cursor', 'pointer');
    const cy = ROW_H / 2;

    // Team label — left margin
    const teamLabel = (d.year ? d.year + ' ' : '') + (d.constructor || '');
    rowG.append('text').attr('x', 0).attr('y', cy + 4)
      .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.75rem')
      .attr('font-weight', '700')
      .attr('fill', mode === 'highlight' ? color : '#a0a0c0')
      .attr('text-anchor', 'start')
      .text(teamLabel.length > 18 ? teamLabel.slice(0, 17) + '…' : teamLabel);

    // ── DUMBBELL LINE (connecting loser to winner) ──
    const line = rowG.append('line')
      .attr('x1', px(lPPR)).attr('x2', px(lPPR)).attr('y1', cy).attr('y2', cy)
      .attr('stroke', mode === 'grey' ? '#3a3a50' : color)
      .attr('stroke-width', 3)
      .attr('opacity', mode === 'grey' ? 0.35 : 0.6);
    if (mode === 'grey') {
      line.transition().duration(800).ease(d3.easeCubicOut).attr('x2', px(wPPR));
    } else {
      line.attr('x2', px(wPPR));
    }

    // ── LOSER DOT ──
    const loserDot = rowG.append('circle')
      .attr('cx', px(lPPR)).attr('cy', cy)
      .attr('fill', mode === 'grey' ? '#3a3a50' : '#ff1e38');
    if (mode === 'grey') {
      loserDot.attr('r', 0).transition().delay(200).duration(400).attr('r', 5);
    } else {
      loserDot.attr('r', 5);
    }

    // Loser name — same team color as winner (no red) in highlight mode
    const loserText = rowG.append('text').attr('x', px(lPPR) - 10).attr('y', cy + 3)
      .attr('text-anchor', 'end')
      .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.65rem')
      .attr('fill', mode === 'grey' ? '#4a4a60' : 'rgba(240,237,230,0.5)')
      .text(loser.split(' ').pop());
    if (mode === 'grey') {
      loserText.attr('opacity', 0).transition().delay(400).duration(400).attr('opacity', 0.8);
    } else {
      loserText.attr('opacity', 1);
    }

    // ── WINNER DOT ──
    const winDot = rowG.append('circle')
      .attr('cy', cy)
      .attr('fill', mode === 'grey' ? '#5a5a54' : color);
    if (mode !== 'grey') {
      winDot.style('filter', `drop-shadow(0 0 8px ${color})`);
    }
    if (mode === 'grey') {
      winDot.attr('cx', px(lPPR)).attr('r', 0)
        .transition().duration(800).ease(d3.easeCubicOut)
        .attr('cx', px(wPPR)).attr('r', 7);
    } else {
      winDot.attr('cx', px(wPPR)).attr('r', 7);
    }

    const winText = rowG.append('text').attr('y', cy + 4)
      .attr('text-anchor', 'start')
      .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.75rem')
      .attr('font-weight', '700').attr('fill', mode === 'grey' ? '#5a5a54' : '#f0ede6')
      .text(winner.split(' ').pop());
    if (mode === 'grey') {
      winText.attr('x', px(lPPR) + 12).attr('opacity', 0)
        .transition().duration(800).ease(d3.easeCubicOut).attr('x', px(wPPR) + 12).attr('opacity', 1);
    } else {
      winText.attr('x', px(wPPR) + 12).attr('opacity', 1);
    }

    // ── Delta Badge — below the winner name to avoid overlap ──
    if (gap > 0.3) {
      rowG.append('text')
        .attr('x', px(wPPR) + 12)
        .attr('y', cy + 16) // below winner name
        .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '1rem')
        .attr('font-weight', '900')
        .attr('fill', mode === 'grey' ? '#3a3a50' : (gap >= 5 ? 'var(--gold)' : color))
        .attr('opacity', 0)
        .text('+' + gap.toFixed(1))
        .transition().delay(700).duration(500).attr('opacity', 1);
    }

    // Hover
    rowG.append('rect').attr('width', w).attr('height', ROW_H).attr('fill', 'transparent')
      .on('mouseover', function () {
        rowG.select('line').attr('opacity', 1).attr('stroke-width', 5);
        tooltip.html(`
          <div class="tt-name" style="color:${teamColor(d.constructor || '')}">${d.year || ''} ${d.constructor || ''}</div>
          <div class="tt-row"><span style="color:#f0f0f5;font-weight:700">${winner}</span><span class="tt-val">${wPPR.toFixed(1)} pts/course</span></div>
          <div class="tt-row"><span style="color:rgba(240,237,230,0.6)">${loser}</span><span class="tt-val" style="color:rgba(240,237,230,0.6)">${lPPR.toFixed(1)} pts/course</span></div>
          <div class="tt-row" style="border-top:1px solid rgba(255,255,255,0.38);margin-top:5px;padding-top:5px">
            <span>Écart</span><span class="tt-val" style="color:${gap >= 5 ? 'var(--gold)' : '#fff'}">+${gap.toFixed(1)} pts/course</span>
          </div>
        `).classed('show', true);
      })
      .on('mousemove', function (event) {
        tooltip.style('left', (event.pageX + 14) + 'px').style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function () {
        rowG.select('line').attr('opacity', mode === 'grey' ? 0.35 : 0.6).attr('stroke-width', 3);
        tooltip.classed('show', false);
      });
  });

  // ── Reading legend removed — grid labels above explain the chart ──
}

/* ═══════════════════════════════════════════════
   CH2 — DRAMA SECTION
═══════════════════════════════════════════════ */
function initDramaCh2() {
  const canvas = document.getElementById('drama-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // FIX #13 — attendre que le canvas soit visible pour lire ses dimensions
  function resize() {
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  // Utiliser ResizeObserver si disponible
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(canvas.parentElement || canvas);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  const pts = Array.from({ length: 40 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0005,
    vy: (Math.random() - 0.5) * 0.0005,
    r: Math.random() * 2 + 0.5,
    op: Math.random() * 0.15 + 0.05,
  }));

  let rafId2;
  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, Math.max(w, h) * 0.7);
    bg.addColorStop(0, 'rgba(10,0,20,0.98)');
    bg.addColorStop(1, 'rgba(8,8,12,1)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,180,100,${p.op})`;
      ctx.fill();
    });
    rafId2 = requestAnimationFrame(draw);
  }
  draw();

  // Stop animation when not visible
  const section = document.getElementById('ch2');
  if (section) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!rafId2) draw(); }
      else { cancelAnimationFrame(rafId2); rafId2 = null; }
    }).observe(section);
  }

  // Animate bars on first intersection
  let animated = false;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      setTimeout(animateDrama, 400);
    }
  }, { threshold: 0.3 });
  if (section) io.observe(section);
}

function animateDrama() {
  const verPts = 24.09;
  const perPts = 11.83;
  const maxH = 200;

  const barVer = document.getElementById('bar-ver');
  const barPer = document.getElementById('bar-per');
  const ptsVer = document.getElementById('pts-ver');
  const ptsPer = document.getElementById('pts-per');
  const cap = document.getElementById('drama-caption');

  if (!barVer) return;

  barVer.style.height = maxH + 'px';
  barPer.style.height = Math.round((perPts / verPts) * maxH) + 'px';

  countUp(ptsVer, 0, verPts, 1200, 1);
  countUp(ptsPer, 0, perPts, 1200, 1);

  setTimeout(() => {
    if (cap) cap.textContent = `Écart : +${(verPts - perPts).toFixed(1)} pts/course — la même voiture.`;
  }, 1400);
}

// countUp imported from utils.js

/* ═══════════════════════════════════════════════
   CH3 — CAREER TRAJECTORIES (interactive)
═══════════════════════════════════════════════ */
const FEATURED_DRIVERS = [
  { name: 'Lewis Hamilton', color: '#00d2be', story: '<strong>Hamilton</strong> : positif dans <em>15 saisons sur 18</em>. Chez McLaren comme chez Mercedes, il domine systématiquement. Le talent traverse les équipes.' },
  { name: 'Fernando Alonso', color: '#ff8000', story: '<strong>Alonso</strong> : <em>18 saisons positives sur 20</em>. Peu importe la voiture — Ferrari, McLaren-Honda, Renault, Alpine — il est presque toujours au-dessus de son équipe. Le cas le plus pur de talent brut.' },
  { name: 'Sebastian Vettel', color: '#dc0000', story: '<strong>Vettel</strong> : dominant avec Red Bull (2010-2013), puis plus fragile. Sa trajectoire interroge : était-ce lui ou la RB de Newey ?' },
  { name: 'Max Verstappen', color: '#3671c6', story: '<strong>Verstappen</strong> : depuis 2019, il domine <em>massivement</em> ses coéquipiers. Son écart à Pérez (+12 pts/course en 2023) reste sans équivalent.' },
  { name: 'Nico Rosberg', color: '#c0c0c0', story: '<strong>Rosberg</strong> : champion 2016, puis retraite immédiate. Sa performance peak était liée à la W07. Après la domination Mercedes, l\'histoire s\'arrête.' },
  { name: 'Daniel Ricciardo', color: '#ff5c00', story: '<strong>Ricciardo</strong> : a battu Vettel chez Red Bull. Mais après son départ, une longue descente. McLaren 2022 : -1,86 pts/course sous son coéquipier Norris.' },
  { name: 'Valtteri Bottas', color: '#969696', story: '<strong>Bottas</strong> : solide chez Williams, dominé par Hamilton chez Mercedes, puis décline chez Alfa. La voiture amplifie, mais aussi révèle les plafonds.' },
  { name: 'Charles Leclerc', color: '#e8001a', story: '<strong>Leclerc</strong> : presque toujours au-dessus chez Ferrari. Sa constance face à Vettel (2019-20) puis Sainz montre un talent stable.' },
];


function initCh3(careerData) {
  const sel = document.getElementById('ch3-selector');
  if (!sel) return;

  sel.innerHTML = '<span class="ds-label">Choisir un pilote :</span>';
  FEATURED_DRIVERS.forEach(({ name, color }) => {
    const chip = document.createElement('div');
    chip.className = 'driver-chip' + (activeDrivers.includes(name) ? ' active' : '');
    chip.textContent = name.split(' ').pop();
    chip.title = name;
    if (activeDrivers.includes(name)) {
      chip.style.background = color;
      chip.style.color = '#0a0a08';
      chip.style.borderColor = color;
    }
    chip.addEventListener('click', () => {
      if (activeDrivers.includes(name)) {
        if (activeDrivers.length <= 1) return;
        activeDrivers = activeDrivers.filter(n => n !== name);
        chip.classList.remove('active');
        chip.style.background = '';
        chip.style.color = '';
        chip.style.borderColor = '';
      } else {
        activeDrivers.push(name);
        chip.classList.add('active');
        chip.style.background = color;
        chip.style.color = '#0a0a08';
        chip.style.borderColor = color;
      }
      renderCh3(careerData);
    });
    sel.appendChild(chip);
  });

  renderCh3(careerData);
}

function renderCh3(careerData) {
  const container = document.getElementById('ch3-vis');
  const svgEl = document.getElementById('svg-ch3');
  const callout = document.getElementById('ch3-callout');
  if (!svgEl || !container) return;

  const W = container.offsetWidth || 900;
  const H = container.offsetHeight || 600; // Increased height for trajectories
  const m = W < 600
    ? { top: 30, right: 20, bottom: 50, left: 45 }
    : { top: 40, right: 120, bottom: 60, left: 80 };
  const cw = W - m.left - m.right;
  const ch = H - m.top - m.bottom;

  const svg = d3.select(svgEl).attr('width', W).attr('height', H);
  svg.selectAll('*').remove();
  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

  const allDriverData = activeDrivers.map(name => {
    const entry = Object.values(careerData).find(d => d.name === name);
    const meta = FEATURED_DRIVERS.find(d => d.name === name);
    return entry ? { name, career: entry.career, color: meta?.color || '#fff', story: meta?.story || '' } : null;
  }).filter(Boolean);

  if (!allDriverData.length) return;

  const allYears = allDriverData.flatMap(d => d.career.map(s => s.year));
  const allRel = allDriverData.flatMap(d => d.career.map(s => s.relative_ppr));
  const xDom = [d3.min(allYears), d3.max(allYears)];
  const yPad = 1.5;
  const yDom = [Math.min(-6, d3.min(allRel) - yPad), Math.max(6, d3.max(allRel) + yPad)];

  const x = d3.scaleLinear().domain(xDom).range([0, cw]);
  const y = d3.scaleLinear().domain(yDom).range([ch, 0]);

  // Grid
  g.append('g').attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(6).tickSize(-cw).tickFormat(''))
    .select('.domain').remove();

  // Zero line
  g.append('line').attr('class', 'zero-line')
    .attr('x1', 0).attr('x2', cw).attr('y1', y(0)).attr('y2', y(0));

  // Zero line label
  g.append('text').attr('x', 4).attr('y', y(0) - 6)
    .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
    .attr('fill', '#7a7a90').text('0 = même niveau que son coéquipier');

  // Zone labels
  g.append('text').attr('x', 4).attr('y', y(yDom[1]) + 14)
    .attr('text-anchor', 'start')
    .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
    .attr('fill', '#00c87a').attr('opacity', 0.6).text('▲ Pilote au-dessus de son coéquipier');

  g.append('text').attr('x', 4).attr('y', ch - 6)
    .attr('text-anchor', 'start')
    .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
    .attr('fill', '#e8001a').attr('opacity', 0.6).text('▼ Pilote en-dessous de son coéquipier');

  // Dot legend for red dots
  // Dot legend — top-right of chart, inside box
  const legG = g.append('g').attr('transform', `translate(${cw - 265}, -28)`);
  legG.append('rect').attr('x', -6).attr('y', -4).attr('width', 260).attr('height', 44).attr('fill', 'rgba(8,8,12,0.82)').attr('rx', 3).attr('stroke', 'rgba(255,255,255,0.38)').attr('stroke-width', 1);
  legG.append('circle').attr('cx', 8).attr('cy', 8).attr('r', 5).attr('fill', '#00c87a').attr('stroke', '#0a0a08').attr('stroke-width', 1.5);
  legG.append('text').attr('x', 18).attr('y', 12).attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#00c87a').text('= au-dessus de son coequipier');
  legG.append('circle').attr('cx', 8).attr('cy', 28).attr('r', 5).attr('fill', '#e8001a').attr('stroke', '#ff4444').attr('stroke-width', 2);
  legG.append('text').attr('x', 18).attr('y', 32).attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#e8001a').text('= battu par son coequipier cette saison');

  // Y axis label
  g.append('text').attr('transform', 'rotate(-90)')
    .attr('x', -ch / 2).attr('y', -52)
    .attr('text-anchor', 'middle')
    .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
    .attr('fill', '#7a7a90').text('Écart pts/course vs coéquipier (même voiture)');

  const lineGen = d3.line()
    .x(d => x(d.year)).y(d => y(d.relative_ppr))
    .curve(d3.curveMonotoneX);

  allDriverData.forEach(({ name, career, color }) => {
    const fc = career.filter(s => s.year >= xDom[0] && s.year <= xDom[1]);

    // Team change: dashed vertical + pill label at axis bottom
    for (let i = 1; i < fc.length; i++) {
      if (fc[i].constructor !== fc[i - 1].constructor) {
        const mx = x(fc[i].year);
        const newTeam = fc[i].constructor
          .replace(' F1 Team', '').replace(' Racing Point', '').replace(' Racing', '')
          .replace(' Grand Prix', '').split(' ').slice(0, 2).join(' ');
        // Dashed vertical line — visible but not dominating
        g.append('line')
          .attr('x1', mx).attr('x2', mx).attr('y1', 0).attr('y2', ch)
          .attr('stroke', color).attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3 4').attr('opacity', 0.3);
        // Arrow marker at top
        g.append('text').attr('x', mx).attr('y', -4)
          .attr('text-anchor', 'middle')
          .attr('font-family', "'Poppins', system-ui, sans-serif").attr('font-size', '0.70rem')
          .attr('fill', color).attr('opacity', 0.65).text('↓');
        // Pill label at bottom axis — rounded, team-colored
        const tw = newTeam.length * 5.4 + 12;
        const tagG = g.append('g').attr('transform', `translate(${mx},${ch + 20})`);
        tagG.append('rect').attr('x', -tw / 2).attr('y', -7).attr('width', tw).attr('height', 13)
          .attr('rx', 6)
          .attr('fill', color).attr('opacity', 0.25)
          .attr('stroke', color).attr('stroke-width', 0.8).attr('stroke-opacity', 0.55);
        tagG.append('text').attr('x', 0).attr('y', 2.5)
          .attr('text-anchor', 'middle')
          .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
          .attr('fill', color).attr('font-weight', '700').text(newTeam);
      }
    }

    // Area fill
    const areaGen = d3.area()
      .x(d => x(d.year)).y0(y(0)).y1(d => y(d.relative_ppr))
      .curve(d3.curveMonotoneX);
    g.append('path').datum(fc).attr('fill', color).attr('opacity', 0.07).attr('d', areaGen);

    // Line with draw animation
    const path = g.append('path').datum(fc)
      .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2.5).attr('d', lineGen);
    const len = path.node().getTotalLength();
    path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
      .transition().duration(900).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

    // Dots — red if dominated by teammate (relative_ppr < -0.5), driver color if winning
    const safeName = name.replace(/\W/g, '_');
    g.selectAll(`.dot-${safeName}`).data(fc).join('circle')
      .attr('class', `dot-${safeName}`)
      .attr('cx', d => x(d.year)).attr('cy', d => y(d.relative_ppr))
      .attr('r', 4.5)
      .attr('fill', d => d.relative_ppr < 0 ? '#e8001a' : color)
      .attr('stroke', d => d.relative_ppr < 0 ? '#ff4444' : '#0a0a08')
      .attr('stroke-width', d => d.relative_ppr < 0 ? 2 : 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('r', 8)
          .style('filter', `drop-shadow(0 0 8px ${d.relative_ppr < 0 ? '#ff4444' : color})`);
        const sign = d.relative_ppr >= 0 ? '+' : '';
        const beatLabel = d.relative_ppr < 0 ? ' — battu par son coéquipier' : '';
        showTip(`
          <div class="tt-name">${name} — ${d.year}${beatLabel}</div>
          <div class="tt-row"><span>Équipe</span><span class="tt-val">${d.constructor}</span></div>
          <div class="tt-row"><span>Pts/course</span><span class="tt-val">${d.ppr}</span></div>
          <div class="tt-row"><span>Écart vs coéquipier</span><span class="tt-val" style="color:${d.relative_ppr >= 0 ? 'var(--green)' : 'var(--red)'}">${sign}${d.relative_ppr} pts/course</span></div>
          <div class="tt-row"><span>Victoires cette saison</span><span class="tt-val">${d.wins}</span></div>
        `);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .attr('r', 4.5)
          .style('filter', 'none');
        hideTip();
      });

    // Collect end labels — will render after all lines drawn
    const last = fc[fc.length - 1];
    if (last) {
      if (!g._endLabels) g._endLabels = [];
      g._endLabels.push({ name: name.split(' ').pop(), lx: x(last.year), rawY: y(last.relative_ppr), color });
    }
  });

  // Force-layout: spread end labels to prevent overlap (30 iterations)
  if (g._endLabels && g._endLabels.length) {
    const lbls = g._endLabels.sort((a, b) => a.rawY - b.rawY);
    lbls.forEach(l => { l.ly = l.rawY; });
    const MIN_GAP = 18;
    for (let iter = 0; iter < 60; iter++) {
      for (let i = 1; i < lbls.length; i++) {
        const gap = lbls[i].ly - lbls[i - 1].ly;
        if (gap < MIN_GAP) {
          const push = (MIN_GAP - gap) * 0.5;
          lbls[i].ly += push;
          lbls[i - 1].ly -= push;
        }
      }
    }
    lbls.forEach(lbl => {
      const moved = Math.abs(lbl.ly - lbl.rawY) > 3;
      if (moved) {
        g.append('line')
          .attr('x1', lbl.lx + 4).attr('y1', lbl.rawY)
          .attr('x2', lbl.lx + 8).attr('y2', lbl.ly - 2)
          .attr('stroke', lbl.color).attr('stroke-width', 0.7).attr('opacity', 0.35);
      }
      g.append('text').attr('x', lbl.lx + 10).attr('y', lbl.ly + 4)
        .attr('font-family', "'Poppins', system-ui, sans-serif")
        .attr('font-size', '0.82rem').attr('font-weight', '700').attr('fill', lbl.color)
        .attr('paint-order', 'stroke').attr('stroke', '#0a0a08').attr('stroke-width', '2.5px')
        .text(lbl.name);
    });
  }
  g._endLabels = null; // reset for next render

  // Axes
  g.append('g').attr('class', 'axis').attr('transform', `translate(0,${ch})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(8));
  g.append('g').attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(8).tickFormat(d => (d > 0 ? '+' : '') + d));

  // Callout
  if (callout) {
    const first = FEATURED_DRIVERS.find(d => activeDrivers.includes(d.name));
    callout.innerHTML = first ? first.story : '';
  }
}

/* ═══════════════════════════════════════════════
   CH4 — GRAND SCATTER (scrollytelling)
   FIX #12 — on garde toutes les saisons mais on rend
   l'expérience lisible avec taille variable + labels
═══════════════════════════════════════════════ */

function buildScatterData(careerData) {
  if (scatterDataCache) return scatterDataCache;

  const teamYearData = {};
  Object.values(careerData).forEach(driver => {
    driver.career.forEach(s => {
      const key = `${s.year}_${s.constructorId}`;
      if (!teamYearData[key]) teamYearData[key] = [];
      teamYearData[key].push(s.ppr);
    });
  });
  const teamAvg = {};
  Object.entries(teamYearData).forEach(([k, pprs]) => {
    teamAvg[k] = pprs.reduce((a, b) => a + b, 0) / pprs.length;
  });

  const points = [];
  Object.values(careerData).forEach(driver => {
    driver.career.forEach(s => {
      const key = `${s.year}_${s.constructorId}`;
      const tAvg = teamAvg[key] || s.ppr;
      // FIX [object Object] — driver.name garantit une string
      const driverName = driver && typeof driver === 'object' ? (driver.name || '') : String(driver || '');
      points.push({
        driver: driverName,
        year: s.year,
        constructor: s.constructor,
        constructorId: s.constructorId,
        ppr: s.ppr,
        teamAvg: tAvg,
        relative: s.relative_ppr,
        wins: s.wins,
      });
    });
  });

  scatterDataCache = points;
  return points;
}

function initCh4(careerData) {
  const scatterData = buildScatterData(careerData);
  let activeFilter = 'all';

  const ALONSO_SEASONS = scatterData.filter(d => String(d.driver) === 'Fernando Alonso');
  const HIGHLIGHT_SEASONS = [
    { driver: 'Lewis Hamilton', year: 2020 },
    { driver: 'Max Verstappen', year: 2023 },
    { driver: 'Fernando Alonso', year: 2012 },
    { driver: 'Sebastian Vettel', year: 2013 },
    { driver: 'Michael Schumacher', year: 2002 },
  ];

  const CHAMPIONS = ['Michael Schumacher', 'Fernando Alonso', 'Kimi Räikkönen', 'Lewis Hamilton', 'Sebastian Vettel', 'Jenson Button', 'Nico Rosberg', 'Max Verstappen'];
  const TOP_TEAMS = ['Red Bull', 'Mercedes', 'Ferrari', 'McLaren'];

  // First-year map for rookies filter
  const firstYearMap = {};
  scatterData.forEach(s => {
    if (!firstYearMap[s.driver] || s.year < firstYearMap[s.driver]) firstYearMap[s.driver] = s.year;
  });

  function getFilteredData() {
    return scatterData.filter(d => {
      if (activeFilter === 'modern') return d.year >= 2010;
      if (activeFilter === 'champions') return CHAMPIONS.includes(d.driver);
      if (activeFilter === 'midfield') return d.teamAvg < 4;
      if (activeFilter === 'topteam') return TOP_TEAMS.some(t => (d.constructor || '').includes(t));
      if (activeFilter === 'rookies') {
        // Hard-coded real F1 debut years (dataset starts 2000, so veterans who debuted
        // before 2000 must be excluded — their "first year in data" ≠ their real debut)
        const REAL_DEBUTS = {
          'Jenson Button': 2000, 'Nick Heidfeld': 2000,
          'Fernando Alonso': 2001, 'Kimi Räikkönen': 2001, 'Juan Pablo Montoya': 2001,
          'Enrique Bernoldi': 2001,
          'Felipe Massa': 2002, 'Mark Webber': 2002, 'Takuma Sato': 2002,
          'Anthony Davidson': 2002, 'Marc Hynes': 2002,
          'Justin Wilson': 2003, 'Ralph Firman': 2003, 'Zsolt Baumgartner': 2003,
          'Giorgio Pantano': 2003, 'Cristiano da Matta': 2003, 'Nicolas Kiesa': 2003,
          'Tiago Monteiro': 2005, 'Narain Karthikeyan': 2005, 'Christijan Albers': 2005,
          'Patrick Friesacher': 2005, 'Robert Doornbos': 2005,
          'Nico Rosberg': 2006, 'Robert Kubica': 2006, 'Scott Speed': 2006,
          'Vitantonio Liuzzi': 2006, 'Michael Ammermuller': 2006,
          'Sebastian Vettel': 2007, 'Adrian Sutil': 2007, 'Kazuki Nakajima': 2007,
          'Heikki Kovalainen': 2007, 'Lewis Hamilton': 2007,
          'Sebastien Bourdais': 2008, 'Nelson Piquet Jr.': 2008, 'Giancarlo Fisichella': 2008,
          'Luca Badoer': 2009,
          'Nico Hülkenberg': 2010, 'Paul di Resta': 2010, 'Vitaly Petrov': 2010,
          'Bruno Senna': 2010, 'Kamui Kobayashi': 2010,
          'Sergio Pérez': 2011, 'Pastor Maldonado': 2011, 'Charles Pic': 2011,
          'Daniel Ricciardo': 2011, 'Jean-Eric Vergne': 2011,
          'Romain Grosjean': 2012, 'Valtteri Bottas': 2013, 'Esteban Gutiierrez': 2013,
          'Max Chilton': 2013, 'Giedo van der Garde': 2013,
          'Daniil Kvyat': 2014, 'Kevin Magnussen': 2014, 'Jules Bianchi': 2014,
          'Will Stevens': 2014, 'Marcus Ericsson': 2014,
          'Max Verstappen': 2015, 'Carlos Sainz': 2015, 'Felipe Nasr': 2015,
          'Roberto Merhi': 2015, 'Alexander Rossi': 2015,
          'Esteban Ocon': 2016, 'Antonio Giovinazzi': 2016, 'Rio Haryanto': 2016,
          'Pascal Wehrlein': 2016, 'Jolyon Palmer': 2016,
          'Lance Stroll': 2017, 'Pierre Gasly': 2017, 'Brendon Hartley': 2017,
          'Charles Leclerc': 2018, 'Lando Norris': 2019, 'Alexander Albon': 2019,
          'Nicholas Latifi': 2020, 'Jack Aitken': 2020, 'Pietro Fittipaldi': 2020,
          'Nikita Mazepin': 2021, 'Yuki Tsunoda': 2021,
          'Guanyu Zhou': 2022, 'Nyck de Vries': 2022,
          'Oscar Piastri': 2023, 'Logan Sargeant': 2023,
          'Oliver Bearman': 2024, 'Kimi Antonelli': 2024, 'Franco Colapinto': 2024,
          'Liam Lawson': 2024,
        };
        const realDebut = REAL_DEBUTS[d.driver];
        if (!realDebut) return false; // Driver not in list = veteran, exclude
        return d.year === realDebut;
      }
      return true;
    });
  }

  // Inject filter panel BETWEEN sticky chart and text steps (not inside the chart)
  const ch4El = document.getElementById('ch4');
  if (ch4El && !ch4El.querySelector('.scatter-filters')) {
    const fw = document.createElement('div');
    fw.className = 'scatter-filters';
    fw.innerHTML = `
      <span class="sf-label">Filtrer :</span>
      <button class="sf-btn active" data-f="all">Tous les pilotes</button>
      <button class="sf-btn" data-f="modern">Ère moderne (2010+)</button>
      <button class="sf-btn" data-f="champions">Champions du monde</button>
      <button class="sf-btn" data-f="midfield">Milieu de grille</button>
      <button class="sf-btn" data-f="topteam">Top écuries</button>
      <button class="sf-btn" data-f="rookies">Saison de débuts</button>
      <button class="sf-reset" data-f="all" title="Tout réafficher">↺ Reset</button>
    `;
    // Insert as FIRST CHILD of sticky-wrap so it stacks above the SVG
    // sticky-wrap uses flex-column: filter bar on top, SVG fills rest
    const stickyW2 = ch4El.querySelector('.sticky-wrap');
    if (stickyW2) {
      stickyW2.prepend(fw);
    } else {
      ch4El.prepend(fw);
    }
    fw.querySelectorAll('.sf-btn,.sf-reset').forEach(btn => {
      btn.addEventListener('click', () => {
        fw.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('active'));
        if (btn.classList.contains('sf-btn')) btn.classList.add('active');
        activeFilter = btn.dataset.f;
        // Re-render at current visual state (not state=0 which shows empty chart)
        const currentState = ch4State >= 0 ? ch4State : 4;
        ch4State = -1; // force full redraw
        render(currentState);
      });
    });
  }

  // FIX #4 — forcer re-render au resize
  function invalidate() { ch4State = -1; }
  window.addEventListener('resize', invalidate);

  function render(state) {
    ch4State = state;

    // FIX #3 #5 — utiliser svgDims au lieu de 'vis-ch4'
    // SVG dimensions
    const { W, H } = svgDims('svg-ch4');
    const svg = d3.select('#svg-ch4').attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    // Maximize width usage. 
    // Left padding accommodates the Y-axis. 
    // Right padding ensures dots don't clip off the screen edge.
    const m = W < 900
      ? { top: 25, right: 30, bottom: 50, left: 45 }
      : { top: 60, right: 80, bottom: 60, left: 80 }; // 40% leaves room for float cards, remaining 60% fills width completely
    const cw = W - m.left - m.right;
    const ch = H - m.top - m.bottom;
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const xExt = d3.extent(scatterData, d => d.teamAvg);
    const yExt = d3.extent(scatterData, d => d.relative);
    const x = d3.scaleLinear().domain([0, xExt[1] * 1.08]).range([0, cw]);
    const y = d3.scaleLinear().domain([Math.min(-9, yExt[0] - 1), Math.max(9, yExt[1] + 1)]).range([ch, 0]);

    // Grid
    g.append('g').attr('class', 'grid')
      .call(d3.axisBottom(x).ticks(6).tickSize(ch).tickFormat(''))
      .select('.domain').remove();
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(8).tickSize(-cw).tickFormat(''))
      .select('.domain').remove();

    // Zero line
    g.append('line').attr('class', 'zero-line')
      .attr('x1', 0).attr('x2', cw).attr('y1', y(0)).attr('y2', y(0));

    // Quadrant shading
    if (state >= 1) {
      g.append('rect').attr('x', cw / 2).attr('width', cw / 2).attr('y', 0).attr('height', y(0))
        .attr('fill', '#00c87a').attr('opacity', 0.03);
      g.append('text').attr('x', cw * 0.75).attr('y', 20).attr('text-anchor', 'middle')
        .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
        .attr('fill', '#00c87a').attr('opacity', 0.5).text('BONNE VOITURE + PILOTE FORT');
    }
    if (state >= 2) {
      g.append('rect').attr('x', 0).attr('width', cw / 2).attr('y', 0).attr('height', y(0))
        .attr('fill', '#f0c040').attr('opacity', 0.03);
      g.append('text').attr('x', cw * 0.25).attr('y', 20).attr('text-anchor', 'middle')
        .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
        .attr('fill', '#f0c040').attr('opacity', 0.5).text('PETITE ÉQUIPE + GRAND PILOTE');
    }

    // All dots — click to highlight teammate + zoom
    const BASE_OPACITY = 0.55;
    const shouldDim = false; // all dots always visible
    let selectedDot = null;

    // Clean circles used for scatter

    // D3 zoom — only active in free-explore mode (state >= 4)
    const zoom = d3.zoom()
      .scaleExtent([1, 12])
      .on('zoom', (event) => { if (state >= 4) zoomG.attr('transform', event.transform); });
    if (state >= 4) {
      svg.call(zoom);
    } else {
      svg.on('.zoom', null);
    }

    const zoomG = g.append('g').attr('class', 'zoom-layer');

    const dotR = d => 4.5 + d.wins * 0.75;
    // Circles: team color, white stroke = above avg, red stroke = below avg
    const displayData = typeof getFilteredData === 'function' ? getFilteredData() : scatterData;
    zoomG.selectAll('.dot').data(displayData).join('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.teamAvg))
      .attr('cy', d => y(d.relative))
      .attr('r', d => dotR(d))
      .attr('fill', d => teamColor(d.constructor))
      .attr('stroke', d => d.relative >= 0 ? 'rgba(255,255,255,0.5)' : '#e8001a')
      .attr('stroke-width', d => d.relative >= 0 ? 0.8 : 1.8)
      .attr('opacity', d => {
        if (state === 3) return d.driver === 'Fernando Alonso' ? 0.95 : 0.15;
        return BASE_OPACITY;
      })
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        if (state < 4) return; // no interaction during scrollytelling
        if (selectedDot !== d) d3.select(this).attr('r', dotR(d) + 4).attr('opacity', 1).style('filter', `drop-shadow(0 0 10px ${teamColor(d.constructor)})`);
        const sign = d.relative >= 0 ? '+' : '';
        showTip(`
          <div class="tt-name">${d.driver} ${d.year}</div>
          <div class="tt-row"><span>Équipe</span><span class="tt-val">${d.constructor}</span></div>
          <div class="tt-row"><span>Pts/course</span><span class="tt-val">${d.ppr.toFixed(1)}</span></div>
          <div class="tt-row"><span>Écart vs coéquipier</span><span class="tt-val" style="color:${d.relative >= 0 ? 'var(--green)' : 'var(--red)'}">${sign}${d.relative} pts/course</span></div>
          <div class="tt-row"><span>Victoires</span><span class="tt-val">${d.wins}</span></div>
          <div class="tt-row" style="opacity:0.5"><span style="font-size:0.55rem">Cliquer pour voir le coéquipier</span></div>
        `);
      })
      .on('mouseout', function (event, d) {
        if (selectedDot !== d) {
          d3.select(this)
            .attr('r', dotR(d))
            .attr('opacity', state === 3 ? (d.driver === 'Fernando Alonso' ? 0.95 : 0.15) : BASE_OPACITY)
            .style('filter', 'none');
        }
        hideTip();
      })
      .on('click', function (event, d) {
        event.stopPropagation();
        zoomG.selectAll('.dot-ring, .teammate-label, .teammate-line').remove();
        if (selectedDot === d) { selectedDot = null; svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity); return; }
        selectedDot = d;

        // Find teammate
        const teammate = scatterData.find(t =>
          t.year === d.year && t.constructorId === d.constructorId && t.driver !== d.driver
        );
        if (!teammate) return;

        const tx = x(teammate.teamAvg), ty = y(teammate.relative);
        const dx = x(d.teamAvg), dy = y(d.relative);
        const rD = dotR(d), rT = dotR(teammate);

        // Connector line
        zoomG.append('line').attr('class', 'teammate-line')
          .attr('x1', dx).attr('y1', dy).attr('x2', tx).attr('y2', ty)
          .attr('stroke', '#fff').attr('stroke-width', 1.2).attr('opacity', 0.35);

        // Teammate ring (white)
        zoomG.append('circle').attr('class', 'dot-ring')
          .attr('cx', tx).attr('cy', ty)
          .attr('r', Math.max(14, rT + 6))
          .attr('fill', 'none').attr('stroke', '#ffffff').attr('stroke-width', 2.5).attr('opacity', 0.85);

        // Teammate label — outside ring, always legible
        zoomG.append('text').attr('class', 'teammate-label')
          .attr('x', tx + Math.max(14, rT + 6) + 6).attr('y', ty + 4)
          .attr('font-family', "'Poppins', system-ui, sans-serif")
          .attr('font-size', '0.82rem').attr('font-weight', '700').attr('fill', '#ffffff')
          .attr('paint-order', 'stroke').attr('stroke', '#0a0a08').attr('stroke-width', '3px')
          .text(teammate.driver.split(' ').pop() + ' ' + teammate.year);

        // Selected ring (gold)
        zoomG.append('circle').attr('class', 'dot-ring')
          .attr('cx', dx).attr('cy', dy)
          .attr('r', Math.max(14, rD + 6))
          .attr('fill', 'none').attr('stroke', '#f0c040').attr('stroke-width', 2.5).attr('opacity', 0.9);

        // Selected label
        zoomG.append('text').attr('class', 'teammate-label')
          .attr('x', dx + Math.max(14, rD + 6) + 6).attr('y', dy + 4)
          .attr('font-family', "'Poppins', system-ui, sans-serif")
          .attr('font-size', '0.82rem').attr('font-weight', '700').attr('fill', '#f0c040')
          .attr('paint-order', 'stroke').attr('stroke', '#0a0a08').attr('stroke-width', '3px')
          .text(d.driver.split(' ').pop() + ' ' + d.year);

        // Zoom: always fit BOTH dots with padding — even if far apart
        const midX = (dx + tx) / 2, midY = (dy + ty) / 2;
        const span = Math.max(80, Math.sqrt((tx - dx) ** 2 + (ty - dy) ** 2));
        // Scale so both points + labels fit in 60% of the viewport
        const scale = Math.min(7, (Math.min(cw, ch) * 0.6) / (span + 100));
        svg.transition().duration(600).ease(d3.easeCubicOut).call(
          zoom.transform,
          d3.zoomIdentity.translate(cw / 2 - midX * scale, ch / 2 - midY * scale).scale(scale)
        );
      });

    // Click SVG background → reset
    svg.on('click.bg', () => {
      if (selectedDot) {
        selectedDot = null;
        zoomG.selectAll('.dot-ring, .teammate-label, .teammate-line').remove();
        svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
      }
    });

    // ── Highlight labels: only states 1-3, NOT state=4 (free explore = clean) ──
    if (state >= 1 && state < 4) {
      const highlightList = state >= 3 ? ALONSO_SEASONS : HIGHLIGHT_SEASONS.filter((_, i) => i < (state === 1 ? 5 : HIGHLIGHT_SEASONS.length));

      const lbls = [];
      highlightList.forEach(hl => {
        const pt = scatterData.find(d => d.driver === hl.driver && d.year === hl.year);
        if (pt) {
          lbls.push({
            pt,
            x: x(pt.teamAvg),
            y: y(pt.relative),
            fx: x(pt.teamAvg), // anchor x
            rawY: y(pt.relative) // original y anchor
          });
        }
      });

      // Simple 1D force separation for Y-axis explicitly tailored to these highlight lines
      const MIN_Y_GAP = 22;
      for (let iter = 0; iter < 80; iter++) {
        lbls.sort((a, b) => a.y - b.y);
        for (let i = 1; i < lbls.length; i++) {
          const gap = lbls[i].y - lbls[i - 1].y;
          if (gap < MIN_Y_GAP) {
            const push = (MIN_Y_GAP - gap) * 0.5;
            lbls[i].y += push;
            lbls[i - 1].y -= push;
          }
        }
      }

      // Clamp label Y to chart bounds with margin
      lbls.forEach(hl => {
        hl.y = Math.max(14, Math.min(ch - 8, hl.y));
      });

      lbls.forEach(hl => {
        const cx = hl.x;
        const cy = hl.y;
        const oY = hl.rawY;
        const color = teamColor(hl.pt.constructor);

        // Draw connecting line from actual dot to pushed label
        zoomG.append('line')
          .attr('x1', cx + 10).attr('x2', cx + 30)
          .attr('y1', oY).attr('y2', cy - 4)
          .attr('stroke', color).attr('opacity', 0.6).attr('stroke-width', 1.5)
          .style('filter', `drop-shadow(0 0 5px ${color}80)`);

        zoomG.append('text').attr('x', cx + 34).attr('y', cy)
          .attr('font-family', "'Poppins', system-ui, sans-serif")
          .attr('font-size', '0.72rem').attr('font-weight', '700').attr('fill', color)
          .attr('paint-order', 'stroke').attr('stroke', 'rgba(10,10,16,0.97)').attr('stroke-width', '5px')
          .text(hl.pt.driver.split(' ').pop() + ' ' + hl.pt.year);
      });
    }

    // Alonso connecting line removed — the dots tell the story alone

    // Axes
    g.append('g').attr('class', 'axis').attr('transform', `translate(0,${ch})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => d + ' pts'));
    g.append('g').attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(8).tickFormat(d => (d > 0 ? '+' : '') + d));

    // Axis labels
    g.append('text').attr('x', cw / 2).attr('y', ch + 50)
      .attr('text-anchor', 'middle')
      .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
      .attr('fill', '#8a8a80')
      .text("← Voiture faible   Force de l'ecurie (pts/course moyen)   Voiture forte →");
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -ch / 2).attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem')
      .attr('fill', '#8a8a80')
      .text('Part du pilote : ecart pts/course vs son coequipier (meme voiture)');

    // Zone banners
    const bH2 = 22;
    g.append('rect').attr('x', 0).attr('width', cw).attr('y', 0).attr('height', bH2).attr('fill', '#00c87a').attr('opacity', 0.05);
    g.append('text').attr('x', 8).attr('y', 15).attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#00c87a').attr('opacity', 0.8).text('PILOTE AU-DESSUS DE SON COEQUIPIER');
    g.append('rect').attr('x', 0).attr('width', cw).attr('y', ch - bH2).attr('height', bH2).attr('fill', '#e8001a').attr('opacity', 0.04);
    g.append('text').attr('x', 8).attr('y', ch - 7).attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#e8001a').attr('opacity', 0.8).text('PILOTE BATTU PAR SON COEQUIPIER');

    // Legend — inside chart, bottom-right corner, semi-transparent box
    const legBoxW = 170, legBoxH = 100;
    const legX = cw - legBoxW - 8, legY = ch - legBoxH - 8;
    const legG2 = g.append('g').attr('transform', `translate(${legX},${legY})`);
    legG2.append('rect').attr('width', legBoxW).attr('height', legBoxH).attr('rx', 4)
      .attr('fill', 'rgba(8,8,12,0.78)').attr('stroke', 'rgba(255,255,255,0.38)').attr('stroke-width', 1);
    // Wins size legend
    legG2.append('text').attr('x', 8).attr('y', 14)
      .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#7a7a9a')
      .text('TAILLE = victoires en saison');
    [[0, '0 vic.'], [5, '5 vic.'], [15, '15 vic.']].forEach(([w, lbl], i) => {
      const r = 4 + w * 0.6;
      legG2.append('circle').attr('cx', 12).attr('cy', 28 + i * 18).attr('r', r)
        .attr('fill', 'none').attr('stroke', '#4a4a70').attr('stroke-width', 1).attr('opacity', 0.5);
      legG2.append('text').attr('x', 12 + r + 5).attr('y', 32 + i * 18)
        .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#7a7a9a').text(lbl);
    });
    // Stroke color legend
    const lsep = legBoxW / 2 + 4;
    legG2.append('text').attr('x', lsep).attr('y', 14)
      .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#7a7a9a')
      .text('CONTOUR = duel');
    legG2.append('circle').attr('cx', lsep + 8).attr('cy', 30).attr('r', 7)
      .attr('fill', '#5a5a7a').attr('stroke', 'rgba(255,255,255,0.5)').attr('stroke-width', 1.8);
    legG2.append('text').attr('x', lsep + 20).attr('y', 34)
      .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#aaaacc').text('blanc = domine');
    legG2.append('circle').attr('cx', lsep + 8).attr('cy', 52).attr('r', 7)
      .attr('fill', '#5a5a7a').attr('stroke', '#e8001a').attr('stroke-width', 2);
    legG2.append('text').attr('x', lsep + 20).attr('y', 56)
      .attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#e8001a').text('rouge = battu');
    // team color legend handled by dropdown

    // UX hint
    g.append('text').attr('x', cw / 2).attr('y', -8).attr('text-anchor', 'middle').attr('font-family', "'Inter', 'Helvetica Neue', system-ui, sans-serif").attr('font-size', '0.65rem').attr('fill', '#6a6a8a').text('Cliquer sur un point pour voir le coéquipier · Molette = zoom · Clic fond = reset');

    // ── Team color legend — collapsible DOM panel ──
    (function buildTeamLegend() {
      const displayData2 = typeof getFilteredData === 'function' ? getFilteredData() : scatterData;
      const teamsInView = [...new Set(displayData2.map(d => d.constructor).filter(Boolean))].sort();

      // Remove existing panel so it rebuilds on filter change
      const existingPanel = document.getElementById('ch4-team-legend');
      if (existingPanel) existingPanel.remove();

      const ch4El = document.getElementById('ch4');
      if (!ch4El) return;

      // Create panel
      const panel = document.createElement('div');
      panel.id = 'ch4-team-legend';
      panel.className = 'ch4-legend-panel';

      let open = false;
      panel.innerHTML = `
        <button class="ch4-legend-toggle" aria-expanded="false">
          <span class="ch4-legend-toggle-dot" style="background:linear-gradient(135deg,#dc0000,#3671c6,#00d2be)"></span>
          Écuries <span class="ch4-legend-arrow">▾</span>
        </button>
        <div class="ch4-legend-body" style="display:none"></div>
      `;

      const body = panel.querySelector('.ch4-legend-body');
      const btn = panel.querySelector('.ch4-legend-toggle');
      const arrow = panel.querySelector('.ch4-legend-arrow');

      teamsInView.forEach(team => {
        const c = teamColor(team);
        const item = document.createElement('div');
        item.className = 'ch4-legend-item';
        item.innerHTML = `<span class="ch4-leg-swatch" style="background:${c}"></span><span>${team}</span>`;
        body.appendChild(item);
      });

      btn.addEventListener('click', () => {
        open = !open;
        body.style.display = open ? 'flex' : 'none';
        arrow.textContent = open ? '▴' : '▾';
        btn.setAttribute('aria-expanded', open);
      });

      // Position in top-right of the sticky-vis
      const stickyVis = ch4El.querySelector('.sticky-vis');
      if (stickyVis) stickyVis.appendChild(panel);
    })();
  }

  return render;
}

/* ═══════════════════════════════════════════════
   SCROLLYTELLING ENGINE
═══════════════════════════════════════════════ */
function initScrollytelling(ch1Render, ch4Render) {
  const steps = document.querySelectorAll('.step');
  if (!steps.length) return;

  // ── Ch4 scroll-lock: guided during scrollytelling, free after last step ──
  const ch4Steps = [...document.querySelectorAll('.step[data-chapter="4"]')];
  const ch4LastIdx = ch4Steps.length - 1;
  let ch4Unlocked = false;

  function showHint(text, color) {
    let hint = document.getElementById('scroll-hint-bar');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'scroll-hint-bar';
      Object.assign(hint.style, {
        position: 'fixed', bottom: '1.5rem', left: '50%',
        transform: 'translateX(-50%) translateY(0)',
        fontFamily: "'Inter', 'Helvetica Neue', system-ui, sans-serif", fontSize: '0.55rem',
        letterSpacing: '0.22em', padding: '0.35rem 1rem',
        background: 'rgba(14,12,10,0.92)',
        borderTop: '1px solid rgba(240,237,230,0.38)',
        color: 'rgba(240,237,230,0.3)',
        pointerEvents: 'none', zIndex: '300',
        transition: 'opacity 0.4s',
        whiteSpace: 'nowrap',
      });
      document.body.appendChild(hint);
    }
    hint.textContent = text;
    hint.style.color = color || 'rgba(240,237,230,0.3)';
    hint.style.opacity = '1';
  }
  function hideHint() {
    const h = document.getElementById('scroll-hint-bar');
    if (h) h.style.opacity = '0';
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const inner = entry.target.querySelector('.step-inner');
      if (inner) inner.classList.toggle('active', entry.isIntersecting);

      if (entry.isIntersecting) {
        const chapter = parseInt(entry.target.dataset.chapter);
        const idx = parseInt(entry.target.dataset.idx);

        if (chapter === 1 && ch1Render) ch1Render(idx);

        if (chapter === 4 && ch4Render) {
          ch4Render(idx);
          if (idx >= ch4LastIdx) {
            ch4Unlocked = true;
            ch4Render(4); // re-render in full free mode
            showHint('✦ Exploration libre — zoom · filtres · cliquer sur un point', 'rgba(240,237,230,0.42)');
            setTimeout(hideHint, 4000);
            // Fade out "À vous de jouer" step card
            const freeStep = document.querySelector('.step[data-chapter="4"][data-idx="4"] .step-inner');
            if (freeStep) setTimeout(() => { freeStep.style.opacity = '0'; freeStep.style.transition = 'opacity 0.8s'; }, 600);
          }
        }
      }
    });
  }, { threshold: 0.5, rootMargin: '0px 0px -20% 0px' });

  steps.forEach(step => io.observe(step));
}


/* ═══════════════════════════════════════════════
   FINALE — animate verdict bars + counters
═══════════════════════════════════════════════ */
function initFinale() {
  const section = document.getElementById('ch5');
  if (!section) return;

  let done = false;
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;

      // Animate split bar widths
      setTimeout(() => {
        const carBar = document.getElementById('fs-car');
        const pilotBar = document.getElementById('fs-pilot');
        if (carBar) carBar.style.width = '75%';
        if (pilotBar) pilotBar.style.width = '25%';
      }, 300);

      // Count up the percentages
      setTimeout(() => countUp(document.getElementById('fs-pct-car'), 0, 75, 1200, 0, '%'), 500);
      setTimeout(() => countUp(document.getElementById('fs-pct-pilot'), 0, 25, 1200, 0, '%'), 700);

      // Animate stats in with stagger
      [1, 2, 3].forEach((n, i) => {
        const el = document.getElementById(`fst-${n}`);
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ${0.8 + i * 0.15}s, transform 0.5s ${0.8 + i * 0.15}s`;
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 50);
      });
    }
  }, { threshold: 0.2 }).observe(section);
}

/* ═══════════════════════════════════════════════
   MAIN INIT
═══════════════════════════════════════════════ */
function initCharts() {
  // initCursor() — called from main.js
  // initProgress() — called from main.js
  // initTooltip() — called from main.js
  // initIntroCanvas() — called from main.js
  initDramaCh2();

  const ch1Render = initCh1(window.TEAMMATE_DATA);
  // FIX #10 — on stocke careerData dans window pour le resize handler
  window._careerData = window.CAREER_DATA;
  initCh3(window.CAREER_DATA);
  const ch4Render = initCh4(window.CAREER_DATA);

  initScrollytelling(ch1Render, ch4Render);

  // Initial renders
  ch1Render(0);
  initTOC();
  ch4Render(0);

  // FIX #10 — resize handler utilise window._careerData
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ch1Render(ch1State);
      ch4Render(ch4State);
      if (window._careerData) renderCh3(window._careerData);
    }, 150);
  });

  // Finale — animate verdict bars
  initFinale();

  // Simulator
  initSimulator();
}

/* ═══════════════════════════════════════════════════════════════════
   SIMULATEUR — "Construis ton Champion"
   Données réelles 2010–2024
═══════════════════════════════════════════════════════════════════ */
function initSimulator() {
  const SIM_DATA = window.SIM_DATA || {};
  if (!Object.keys(SIM_DATA).length) return;

  const YEARS = Object.keys(SIM_DATA).sort((a, b) => b - a); // recent first

  // State
  let selYear = '2023';
  let selCar = null;
  let selDriver = null;

  // DOM
  const elYear = document.getElementById('sel-year');
  const elCar = document.getElementById('sel-car');
  const elDriver = document.getElementById('sel-driver');
  const elResult = document.getElementById('sim-result');

  if (!elYear || !elCar || !elDriver) return;

  /* ── Build year chips ── */
  YEARS.forEach(y => {
    const chip = document.createElement('button');
    chip.className = 'sim-chip year-chip' + (y === selYear ? ' active' : '');
    chip.dataset.year = String(y);
    chip.innerHTML = '<span style="font-family:Arial,Helvetica,sans-serif;font-style:normal;font-weight:700;font-size:1rem;direction:ltr;display:inline-block">' + String(y) + '</span>';
    chip.onclick = () => { selYear = y; selCar = null; selDriver = null; renderAll(); };
    elYear.appendChild(chip);
  });

  /* ── Render all selectors ── */
  function renderAll() {
    // Year — match via data-year (textContent would include span content)
    elYear.querySelectorAll('.year-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.year === selYear);
    });

    const data = SIM_DATA[selYear];

    // Cars
    elCar.innerHTML = '';
    const teams = Object.entries(data.teams).sort((a, b) => b[1].avg_ppr - a[1].avg_ppr);
    teams.forEach(([name, info]) => {
      const chip = document.createElement('button');
      chip.className = 'sim-chip car-chip' + (selCar === name ? ' active' : '');
      chip.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${info.color};margin-right:6px;flex-shrink:0;vertical-align:middle"></span>${name} <span style="color:var(--grey);margin-left:4px">${info.avg_ppr.toFixed(1)} pts</span>`;
      chip.onclick = () => { selCar = name; renderAll(); };
      elCar.appendChild(chip);
    });

    // Drivers — sorted by composite score (field + teammate + consistency)
    elDriver.innerHTML = '';
    const drivers = [...data.drivers].sort((a, b) => b.composite - a.composite);
    drivers.forEach(d => {
      const chip = document.createElement('button');
      chip.className = 'sim-chip driver-chip' + (selDriver === d.name ? ' active' : '');
      const comp = d.composite || 0;
      // Color ramp based on composite
      const cColor = comp >= 80 ? 'var(--gold)' : comp >= 60 ? 'var(--green)' : comp >= 45 ? 'var(--grey-lt)' : 'var(--red)';
      // Mini score bar (composite / 100 * 40px wide)
      const barW = Math.round(comp / 100 * 36);
      chip.innerHTML = `
        <span class="dchip-name">${d.short}</span>
        <span class="dchip-bar"><span class="dchip-fill" style="width:${barW}px;background:${cColor}"></span></span>
        <span class="dchip-score" style="color:${cColor}">${comp.toFixed(0)}</span>`;
      chip.title = `${d.name} (${d.team}) — ${d.ppr.toFixed(1)} pts/race · Top peloton: ${d.field_pct.toFixed(0)}% · vs coéquipier: ${d.rel > 0 ? '+' : ''}${d.rel.toFixed(1)} · Composite: ${comp.toFixed(0)}/100 · ${d.wins} victoire${d.wins !== 1 ? 's' : ''}`;
      chip.onclick = () => { selDriver = d.name; renderAll(); };
      elDriver.appendChild(chip);
    });

    updateResult();
  }

  /* ── Animate a number counter ── */
  function animNum(el, target, suffix = '', decimals = 1) {
    const start = performance.now();
    const duration = 600;
    const from = parseFloat(el.dataset.val || '0');
    el.dataset.val = target;
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = from + (target - from) * ease;
      el.textContent = (decimals === 0 ? Math.round(val) : val.toFixed(decimals)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Compute & display result ── */
  function updateResult() {
    if (!selCar || !selDriver) {
      elResult.classList.remove('visible');
      return;
    }

    const data = SIM_DATA[selYear];
    const carData = data.teams[selCar];
    const drvData = data.drivers.find(d => d.name === selDriver);
    if (!carData || !drvData) return;

    const carPPR = carData.avg_ppr;
    const driverRel = drvData.rel;
    // totalPPR computed below using talent_delta formula

    // Find champion of that year (highest ppr driver)
    const champDriver = [...data.drivers].sort((a, b) => b.ppr - a.ppr)[0];
    const champPPR = champDriver.ppr;

    // driver_boost: tanh-compressed relative ppr, capped at ±6 pts
    // This keeps simulated totals physically realistic (never exceeds real max ~24 pts)
    const driverBoost = drvData.driver_boost || 0;
    const displayTotal = +(carPPR + driverBoost).toFixed(2);

    // Update calc display
    animNum(document.getElementById('calc-car'), carPPR, '', 1);
    animNum(document.getElementById('calc-driver'), driverBoost, '', 1);
    animNum(document.getElementById('calc-total'), displayTotal, '', 1);

    // Color by composite score + sign of boost
    const dEl = document.getElementById('calc-driver');
    const compScore = drvData.composite || 0;
    dEl.style.color = compScore >= 80 ? 'var(--gold)' : compScore >= 60 ? 'var(--green)' : driverBoost > 0 ? 'var(--grey-lt)' : 'var(--red)';

    // VS track — use talent_delta-based total
    const totalPPR = displayTotal;
    const maxVal = Math.max(totalPPR, champPPR, 1);
    const userPct = Math.round(Math.min(100, Math.max(4, (totalPPR / maxVal) * 100)));
    const champPct = Math.round(Math.min(100, Math.max(4, (champPPR / maxVal) * 100)));

    document.getElementById('svb-user').style.width = userPct + '%';
    document.getElementById('svb-champ').style.width = champPct + '%';
    document.getElementById('svb-user').style.opacity = totalPPR < champPPR ? '0.7' : '1';
    document.getElementById('svb-champ').style.opacity = totalPPR >= champPPR ? '0.25' : '0.5';
    document.getElementById('svl-left').textContent = drvData.short + ' / ' + selCar.split(' ')[0];
    document.getElementById('svl-right').textContent = champDriver.short + ' (réel)';

    // Verdict
    const diff = totalPPR - champPPR;
    const verdEl = document.getElementById('sim-verdict');
    if (diff > 2) {
      verdEl.textContent = '🏆 Ton duo aurait dominé le championnat !';
      verdEl.className = 'sim-verdict win';
    } else if (diff >= -1) {
      verdEl.textContent = '⚔️ Duel serré — tout se jouerait aux détails.';
      verdEl.className = 'sim-verdict close';
    } else if (diff >= -4) {
      verdEl.textContent = '📉 Ton duo aurait lutté — mais pas pour le titre.';
      verdEl.className = 'sim-verdict lose';
    } else {
      verdEl.textContent = '💀 Saison difficile… la machine ou le pilote pèche.';
      verdEl.className = 'sim-verdict lose';
    }

    // Podium — build ranking of all possible user duos vs real competitors
    // Real top 3 by ppr in that year
    const top3real = [...data.drivers].sort((a, b) => b.ppr - a.ppr).slice(0, 3);

    // Insert user duo into ranking
    const userEntry = { name: drvData.short + ' / ' + selCar.split(' ')[0], ppr: totalPPR, isUser: true };
    const ranking = [
      userEntry,
      ...top3real.map(d => ({ name: d.short, ppr: d.ppr, isUser: false, team: d.team }))
    ].sort((a, b) => b.ppr - a.ppr).slice(0, 3);

    const maxPod = ranking[0].ppr;
    // Container = 200px total. Bottom area per rank:
    // P1 center col can have up to 110px bar, P2/P3 scale relative to P1
    const MAX_BAR = 110;
    const podOrder = [ranking[1], ranking[0], ranking[2]]; // visual: 2,1,3
    const podIds = ['pod-2', 'pod-1', 'pod-3'];

    podIds.forEach((id, i) => {
      const entry = podOrder[i];
      const isFirst = id === 'pod-1';
      if (!entry) return;
      const nameEl = document.getElementById(id + '-name');
      const barEl = document.getElementById(id + '-bar');
      const ptsEl = document.getElementById(id + '-pts');

      nameEl.textContent = entry.name || '—';
      ptsEl.textContent = entry.ppr ? entry.ppr.toFixed(1) + ' pts' : '—';

      // Scale bar height: p1 gets MAX_BAR, others scale proportionally
      const scale = isFirst ? 1 : (entry.ppr / maxPod);
      const h = Math.max(10, Math.round(scale * MAX_BAR));
      barEl.style.height = h + 'px';

      if (entry.isUser) {
        barEl.classList.add('user-duo');
        nameEl.classList.add('user-duo');
      } else {
        barEl.classList.remove('user-duo');
        nameEl.classList.remove('user-duo');
      }
    });

    // Insight
    const insight = generateInsight(carPPR, driverBoost, totalPPR, champPPR, drvData, selCar, selYear);
    document.getElementById('sim-insight').textContent = insight;

    elResult.classList.add('visible');
  }

  function generateInsight(carPPR, driverBoost, total, champPPR, drv, car, year) {
    const lines = [];
    const data = SIM_DATA[year];
    const medianPPR = data.median_ppr || 2;

    // Car vs driver contribution
    const carShare = Math.round(Math.max(0, carPPR) / (Math.abs(total) || 1) * 100);
    const driverShare = 100 - carShare;

    const comp = drv.composite || 0;
    if (comp >= 85) {
      lines.push(`${drv.short} : score composite ${comp.toFixed(0)}/100 — pilote dominant cette saison (peloton + coéquipier + régularité).`);
    } else if (comp >= 65) {
      lines.push(`${drv.short} : score composite ${comp.toFixed(0)}/100 — solide, au-dessus de la moyenne du peloton.`);
    } else if (comp >= 45) {
      lines.push(`${drv.short} : score composite ${comp.toFixed(0)}/100 — niveau médian, résultats mitigés cette saison.`);
    } else {
      lines.push(`${drv.short} : score composite ${comp.toFixed(0)}/100 — saison difficile ou coéquipier trop fort.`);
    }
    lines.push(`Voiture : ${carShare}% du score simulé · Pilote : ${driverShare}% — vs pilote médian de cette saison.`);

    if (drv.wins > 10) lines.push(`${drv.wins} victoires cette saison — dominance totale.`);
    else if (drv.wins === 0) lines.push(`Aucune victoire cette saison malgré ${drv.ppr.toFixed(1)} pts/course en moyenne.`);

    return lines.join(' · ');
  }

  /* ── Initial render ── */
  renderAll();

  // Auto-select defaults to show the UI immediately
  setTimeout(() => {
    selCar = Object.keys(SIM_DATA[selYear].teams)[1]; // 2nd best car (more interesting)
    selDriver = SIM_DATA[selYear].drivers.find(d => d.rel > 2)?.name || SIM_DATA[selYear].drivers[0].name;
    renderAll();
  }, 400);
}


/* ═══════════════════════════════════════════════
   FLOATING TABLE OF CONTENTS — toggle + active section
═══════════════════════════════════════════════ */
function initTOC() {
  const btn = document.getElementById('toc-toggle');
  const list = document.getElementById('toc-list');
  if (!btn || !list) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = list.hasAttribute('hidden');
    if (isHidden) list.removeAttribute('hidden');
    else list.setAttribute('hidden', '');
  });

  document.addEventListener('click', () => list.setAttribute('hidden', ''));

  // Smooth scroll on link click
  list.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      list.setAttribute('hidden', '');
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Highlight active section via IntersectionObserver
  const sections = ['intro', 'ch1', 'ch2', 'ch3', 'ch4', 'ch-sim', 'ch5']
    .map(id => document.getElementById(id)).filter(Boolean);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        list.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        const active = list.querySelector(`a[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => obs.observe(s));
}


export { initCharts };
