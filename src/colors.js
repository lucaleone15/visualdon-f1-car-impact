// ── Team colors ──────────────────────────────────────────────
export const TEAM_COLORS = {
  'Mercedes':       '#00d2be',
  'Ferrari':        '#dc0000',
  'Red Bull':       '#3671c6',
  'McLaren':        '#ff8000',
  'Renault':        '#fff500',
  'Alpine':         '#ff87bc',
  'Williams':       '#64c4ff',
  'AlphaTauri':     '#2b4562',
  'Toro Rosso':     '#2b4562',
  'Haas':           '#b6babd',
  'Alfa Romeo':     '#900000',
  'Sauber':         '#52e252',
  'Force India':    '#f596c8',
  'Racing Point':   '#f596c8',
  'Aston Martin':   '#358c75',
  'Lotus':          '#ffd700',
  'Lotus F1':       '#ffd700',
  'Jaguar':         '#006600',
  'Toyota':         '#cc0000',
  'BAR':            '#c0c0c0',
  'Jordan':         '#F0D600',
  'Minardi':        '#666666',
  'BMW Sauber':     '#0067ff',
  'HRT':            '#999999',
  'Caterham':       '#005030',
  'Marussia':       '#6e0000',
  'Manor Marussia': '#6e0000',
  'Virgin':         '#cc0000',
};

export function teamColor(name) {
  if (!name) return '#8a8a7e';
  for (const [k, v] of Object.entries(TEAM_COLORS)) {
    if (name.includes(k)) return v;
  }
  return '#8a8a7e';
}
