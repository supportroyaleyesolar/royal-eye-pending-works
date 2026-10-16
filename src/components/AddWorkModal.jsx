import { useState } from 'react';
import { TEAMS } from '../data/works';
import { SOLAR_STAGES, stageProgress } from '../data/solarStages';

export default function AddWorkModal({ onSave, onClose }) {
  const [f, setF] = useState({
    title: 'Site Survey & Agreement',
    cus: '',
    loc: 'Thrissur',
    team: TEAMS[0],
    date: new Date().toISOString().slice(0, 10),
    stage: 'Anubhandham 1',
    sub: 'Initial Agreement Ready',
  });

  const handleStageSelect = (stage) => {
    setF((prev) => ({ ...prev, stage }));
  };

  const submit = (e) => {
    e.preventDefault();
    const progress = stageProgress(f.stage);
    const status = f.stage === 'Work All Done' ? 'Completed' : f.stage === 'Anubhandham 1' ? 'Pending' : 'In Progress';
    onSave({
      ...f,
      progress,
      status,
      icon: f.stage === 'Work All Done' ? 'CheckCircle2' : f.stage === 'Panel Fixing' ? 'LayoutGrid' : f.stage === 'Loan Done' ? 'Zap' : 'FileText',
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ maxWidth: 520 }}>
        <h2>➕ Add Work Progress</h2>

        <div className="two">
          <label>
            Customer Name
            <input
              required
              autoFocus
              value={f.cus}
              onChange={(e) => setF({ ...f, cus: e.target.value })}
              placeholder="e.g. Anil Kumar"
            />
          </label>
          <label>
            Location
            <input
              required
              value={f.loc}
              onChange={(e) => setF({ ...f, loc: e.target.value })}
              placeholder="e.g. Thrissur"
            />
          </label>
        </div>

        <div className="two">
          <label>
            Work Title
            <input
              required
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="e.g. Panel Mounting"
            />
          </label>
          <label>
            Status / Solar Stage
            <select
              value={f.stage}
              onChange={(e) => handleStageSelect(e.target.value)}
            >
              {SOLAR_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.label} ({s.progress}%)
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Work Details / Note
          <input
            value={f.sub}
            onChange={(e) => setF({ ...f, sub: e.target.value })}
            placeholder="e.g. 8x 400W Mono Perc on RCC roof"
          />
        </label>

        <div className="two">
          <label>
            Team
            <select value={f.team} onChange={(e) => setF({ ...f, team: e.target.value })}>
              {TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Date
            <input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </label>
        </div>

        <div className="actions">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="add">Save Work Card</button>
        </div>
      </form>
    </div>
  );
}
