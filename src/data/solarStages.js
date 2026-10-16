// ─── Solar workflow stages ──────────────────────────────────────────────────
export const SOLAR_STAGES = [
  { id: 'Anubhandham 1', label: 'Anubhandham 1', desc: 'Initial agreement / contract signed', emoji: '📄', icon: '📄', progress: 10, color: '#6366f1' },
  { id: 'Panel Fixing',  label: 'Panel Fixing',  desc: 'Solar panels mounted on roof',       emoji: '☀️', icon: '☀️', progress: 35, color: '#f59a10' },
  { id: 'Loan Done',     label: 'Loan Done',     desc: 'Bank loan sanctioned & disbursed',    emoji: '🏦', icon: '🏦', progress: 50, color: '#1a6ff0' },
  { id: 'Anubhandham 2', label: 'Anubhandham 2', desc: 'Second agreement / KSEB application', emoji: '📋', icon: '📋', progress: 65, color: '#8b5cf6' },
  { id: 'Anubhandham 3', label: 'Anubhandham 3', desc: 'Final agreement / net meter applied', emoji: '📑', icon: '📑', progress: 80, color: '#ec4899' },
  { id: 'Work All Done', label: 'Work All Done', desc: 'System commissioned & handed over',   emoji: '🎉', icon: '🎉', progress: 100, color: '#1fae5e' },
];

export const stageTone = (s) => {
  if (!s) return 'pending';
  if (s === 'Work All Done') return 'completed';
  if (s === 'Panel Fixing' || s === 'Loan Done' || s === 'Anubhandham 2' || s === 'Anubhandham 3') return 'inprogress';
  return 'pending';
};

export const stageProgress = (stage) => {
  const found = SOLAR_STAGES.find((s) => s.id === stage);
  return found ? found.progress : 10;
};

export const stageColor = (stage) => {
  const found = SOLAR_STAGES.find((s) => s.id === stage);
  return found ? found.color : '#6b7894';
};
