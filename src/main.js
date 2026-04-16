// ── Entry point ───────────────────────────────────────────────
import { initCursor, initProgress, initIntroCanvas } from './intro.js';
import { initTooltip } from './utils.js';
import { initCharts } from './charts.js';

async function loadData() {
  const [career, teammates, sim] = await Promise.all([
    fetch('public/data/career_data.json').then(r => r.json()),
    fetch('public/data/teammate_data.json').then(r => r.json()),
    fetch('public/data/sim_data.json').then(r => r.json()),
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
