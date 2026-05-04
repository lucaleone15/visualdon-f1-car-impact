// ── Entry point ───────────────────────────────────────────────
import { initCursor, initProgress, initIntroCanvas } from './intro.js';
import { initTooltip } from './utils.js';
import { initCharts } from './charts.js';

// Variable globale pour traquer la largeur et éviter les sauts au scroll mobile
let lastWidth = window.innerWidth;

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

    // On attend que les données soient là ET que les polices soient chargées
    // pour éviter que le texte ne change de taille après le rendu D3
    await Promise.all([
      loadData(),
      document.fonts.ready
    ]);

    initCharts();

  } catch (e) {
    console.error('Erreur initialisation :', e);
  }
});

// Gestion intelligente du redimensionnement
window.addEventListener('resize', () => {
  // On ne relance initCharts que si la largeur a vraiment changé (ignore la barre d'adresse mobile)
  if (window.innerWidth !== lastWidth) {
    lastWidth = window.innerWidth;

    // On utilise un timeout pour ne pas surcharger le processeur
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
      initCharts();
    }, 250);
  }
});

// ── Parallax Intro ──────────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
  const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

  const introContent = document.querySelector('.intro-content');
  if (introContent) {
    introContent.style.transform = `translate(${moveX * -1}px, ${moveY * -1}px)`;
  }

  const pilots = document.querySelectorAll('.pilot');
  pilots.forEach((p, index) => {
    const depth = (index + 1) * 2;
    p.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
  });
});