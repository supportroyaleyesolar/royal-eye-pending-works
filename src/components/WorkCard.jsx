import { useState } from 'react';
import {
  MapPin, Users, Wrench, Calendar, MoreHorizontal, Edit3, Save, X,
  ChevronDown, Check, Sun, Layers, Zap
} from 'lucide-react';
import { TEAMS } from '../data/works';
import { useCustomers } from '../context/CustomerContext';
import { SOLAR_STAGES, stageTone, stageProgress, stageColor } from '../data/solarStages';

const fmtDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_PILL_CLASS = {
  'In Progress': 'inprogress',
  Pending: 'pending',
  Completed: 'completed',
};

export default function WorkCard({ work: w, onUpdate, onRemove, customerName }) {
  const { masters, updateMaster } = useCustomers();
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showStages, setShowStages] = useState(false);

  // Match customer from master database
  const matchedCustomer = masters.find((m) => m.id === w.cus || m.name === w.cus);
  const displayName = customerName || matchedCustomer?.name || w.cus;
  const currentStage = (w.stage && w.stage !== 'Anubhandham 1') ? w.stage : (matchedCustomer?.workflowStage || w.stage || 'Anubhandham 1');
  const progress = stageProgress(currentStage);
  const color = stageColor(currentStage);
  const currentStageIdx = SOLAR_STAGES.findIndex((s) => s.id === currentStage);
  const capacity = matchedCustomer?.systemCapacity || '3 kW';
  const panelsCount = Math.round((parseFloat(capacity) || 3) * 2.5);

  const [form, setForm] = useState({ ...w, stage: currentStage });

  // Advance to next stage
  const advanceStage = () => {
    if (currentStageIdx < SOLAR_STAGES.length - 1) {
      const next = SOLAR_STAGES[currentStageIdx + 1];
      onUpdate(w.id, {
        stage: next.id,
        progress: next.progress,
        status: next.id === 'Work All Done' ? 'Completed' : 'In Progress',
      });
      if (matchedCustomer) {
        updateMaster(matchedCustomer.id, { workflowStage: next.id });
      }
    }
    setMenu(false);
  };

  const setStage = (stg) => {
    const found = SOLAR_STAGES.find((s) => s.id === stg);
    if (found) {
      onUpdate(w.id, {
        stage: stg,
        progress: found.progress,
        status: stg === 'Work All Done' ? 'Completed' : stg === 'Anubhandham 1' ? 'Pending' : 'In Progress',
      });
      if (matchedCustomer) {
        updateMaster(matchedCustomer.id, { workflowStage: stg });
      }
    }
    setShowStages(false);
    setMenu(false);
  };

  // Save inline edit
  const saveEdit = () => {
    const stageInfo = SOLAR_STAGES.find((s) => s.id === form.stage);
    onUpdate(w.id, {
      title: form.title,
      cus: form.cus,
      loc: form.loc,
      team: form.team,
      date: form.date,
      sub: form.sub,
      stage: form.stage,
      progress: stageInfo ? stageInfo.progress : form.progress,
      status: form.stage === 'Work All Done' ? 'Completed' : form.stage === 'Anubhandham 1' ? 'Pending' : 'In Progress',
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <article className="install-card card-edit">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>✏️ Edit Work Progress</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="wf-edit-btn save" onClick={saveEdit} title="Save changes"><Save size={14} /></button>
            <button className="wf-edit-btn cancel" onClick={() => setEditing(false)} title="Cancel"><X size={14} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <label style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 700, textTransform: 'uppercase' }}>
            Customer Name (Title)
            <input
              className="wf-edit-input"
              value={form.cus}
              onChange={(e) => setForm({ ...form, cus: e.target.value })}
              placeholder="e.g. Anil Kumar"
            />
          </label>
          <label style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 700, textTransform: 'uppercase' }}>
            Solar Workflow Stage
            <select
              className="wf-edit-input"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
            >
              {SOLAR_STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.emoji} {s.label} ({s.progress}%)</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 700, textTransform: 'uppercase' }}>
            Work Title
            <input
              className="wf-edit-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Panel Mounting"
            />
          </label>
          <label style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 700, textTransform: 'uppercase' }}>
            Work Details / Notes
            <input
              className="wf-edit-input"
              value={form.sub || ''}
              onChange={(e) => setForm({ ...form, sub: e.target.value })}
              placeholder="e.g. 8x 400W Mono Perc on RCC"
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 700, textTransform: 'uppercase' }}>
              Location
              <input className="wf-edit-input" value={form.loc} onChange={(e) => setForm({ ...form, loc: e.target.value })} />
            </label>
            <label style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 700, textTransform: 'uppercase' }}>
              Date
              <input className="wf-edit-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
          </div>
          <label style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 700, textTransform: 'uppercase' }}>
            Team
            <select className="wf-edit-input" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>
              {TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
      </article>
    );
  }

  // Generate customer initials for avatar badge
  const initials = displayName
    ? displayName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SO';

  return (
    <article className="install-card work-card-classified">
      {/* ── 1. Classified Header: Avatar, Customer Name, IDs & Solar Stage Pill ── */}
      <div className="c-card-header">
        <div className="c-customer-avatar" title={displayName}>
          {initials}
        </div>

        <div className="c-customer-info">
          <h4 className="c-customer-name" title={displayName}>
            {displayName}
          </h4>
          <div className="c-customer-id">
            <span className="badge-id">WRK-{String(w.id).padStart(3, '0')}</span>
            <span>·</span>
            <span className="badge-id">{w.cus}</span>
          </div>
        </div>

        {/* Stage / Status Badge Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="stage-badge"
            style={{
              background: color + '15',
              color: color,
              borderColor: color + '45',
            }}
            onClick={() => setShowStages(!showStages)}
            title="Click to change solar stage"
          >
            <span>{SOLAR_STAGES[currentStageIdx]?.emoji || '📄'}</span>
            <span>{currentStage}</span>
            <ChevronDown size={13} />
          </button>

          {showStages && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                onClick={() => setShowStages(false)}
              />
              <div className="stage-drop">
                <div style={{ padding: '6px 10px 4px', fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Solar Stage
                </div>
                {SOLAR_STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStage(s.id)}
                    className={currentStage === s.id ? 'active' : ''}
                  >
                    <span style={{ fontSize: 14 }}>{s.emoji}</span>
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: currentStage === s.id ? 700 : 500 }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.progress}%</span>
                    {currentStage === s.id && <Check size={13} color={s.color} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 2. Classified Metadata Chips (Location, Capacity, Team) ── */}
      <div className="c-tags-row">
        <span className="c-tag loc" title="Site Location">
          <MapPin size={12} color="#64748b" /> {w.loc}
        </span>
        <span className="c-tag cap" title="Solar System Capacity">
          <Zap size={12} color="#1d4ed8" /> {capacity}
        </span>
        <span className="c-tag team" title="Assigned Installation Team">
          <Users size={12} color="#86198f" /> {w.team}
        </span>
      </div>

      {/* ── 3. Work Scope Description Box ── */}
      <div className="c-scope-box">
        <Wrench size={13} color="#1a6ff0" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span className="c-scope-title">{w.title}</span>
          {w.sub && <span className="c-scope-sub"> · {w.sub}</span>}
        </div>
      </div>

      {/* ── 4. Classified Solar Stage Pipeline (Segmented Stepper) ── */}
      <div className="c-stage-box">
        <div className="c-stage-head">
          <span className="c-stage-label">
            <Layers size={12} /> Solar Stage
          </span>
          <span
            className="c-stage-status-badge"
            style={{
              color: color,
              background: color + '15',
              borderColor: color + '35',
            }}
          >
            {SOLAR_STAGES[currentStageIdx]?.emoji} {currentStage}
          </span>
        </div>

        {/* 6 Stepped Segment Bars */}
        <div className="c-stepper-steps">
          {SOLAR_STAGES.map((s, i) => (
            <div
              key={s.id}
              title={`${s.label} (${s.progress}%)`}
              className="c-stepper-bar"
              style={{
                background: i <= currentStageIdx ? color : '#e2e8f0',
                boxShadow: i === currentStageIdx ? `0 0 8px ${color}55` : 'none',
              }}
            />
          ))}
        </div>

        {/* Continuous Progress Bar & Percentage */}
        <div className="c-progress-row">
          <div className="c-progress-track">
            <div
              className="c-progress-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${color}cc, ${color})`,
              }}
            />
          </div>
          <span className="c-progress-pct" style={{ color }}>{progress}%</span>
        </div>
      </div>

      {/* ── 5. Card Footer with Date, Panels Count & Actions Menu ── */}
      <div className="c-card-footer">
        <span className="c-card-footer-item">
          <Calendar size={13} color="#64748b" /> {w.date}
        </span>
        <span className="c-card-footer-item">
          <Sun size={13} color="#f59a10" /> {panelsCount} panels
        </span>

        {/* Quick Options Menu */}
        <div className="menu" style={{ position: 'relative' }}>
          <button
            aria-label="Options"
            onClick={() => setMenu(!menu)}
            style={{ padding: '4px 7px', borderRadius: 8, color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
          >
            <MoreHorizontal size={15} />
          </button>
          {menu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                onClick={() => setMenu(false)}
              />
              <div className="drop" style={{ zIndex: 999, right: 0, minWidth: 195 }}>
                <button onClick={() => { setEditing(true); setMenu(false); }}>
                  <Edit3 size={13} /> Edit Work Details
                </button>
                <button onClick={advanceStage} disabled={currentStage === 'Work All Done'}>
                  ⏩ Next Stage
                </button>
                <button onClick={() => setStage('Work All Done')}>
                  ✅ Mark Work All Done
                </button>
                <button onClick={() => { onRemove(w.id); setMenu(false); }} style={{ color: '#d9342b' }}>
                  🗑 Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
