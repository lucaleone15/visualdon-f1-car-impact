// ── Entry point ───────────────────────────────────────────────
import { initCursor, initProgress, initIntroCanvas } from './intro.js';
import { initTooltip } from './utils.js';
import { initCharts } from './charts.js';

async function loadData() {
  const [career, teammates, sim] = await Promise.all([
    fetch('data/career_data.json').then(r => r.json()),
    fetch('data/teammate_data.json').then(r => r.json()),
    fetch('data/sim_data.json').then(r => r.json()),
  ]);
  window.CAREER_DATA = career;
  window.TEAMMATE_DATA = teammates;
  window.SIM_DATA = sim;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    initCursor();
    initProgress();
    initTooltip();
    initIntroCanvas();
    await loadData();
    initCharts();
  } catch (e) {
    console.error('Erreur initialisation :', e);
  }
});

document.addEventListener('mousemove', (e) => {
  const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
  const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

  // Le titre bouge légèrement à l'opposé des images
  document.querySelector('.intro-content').style.transform =
    `translate(${moveX * -1}px, ${moveY * -1}px)`;

  // Les pilotes bougent avec plus d'amplitude
  const pilots = document.querySelectorAll('.pilot');
  pilots.forEach((p, index) => {
    const depth = (index + 1) * 2;
    p.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
  });
});