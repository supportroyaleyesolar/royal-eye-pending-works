import { useState } from 'react';
import { Plus, Search, Wrench, X, MapPin, Users, CheckCircle } from 'lucide-react';
import { INITIAL_INSTALLATIONS } from '../data/appData';

const STATUS_PILL = { 'In Progress': 'inprogress', Pending: 'pending', Completed: 'completed' };
const STATUS_COLOR = { 'In Progress': '#1a6ff0', Pending: '#f59a10', Completed: '#1fae5e' };
const STAGES = ['Awaiting Survey', 'Panel Mounting', 'Electrical Work', 'Inverter Setup', 'System Testing', 'Meter Installation', 'KSEB Inspection', 'Handed Over'];

function InstallModal({ install, onSave, onClose }) {
  const [form, setForm] = useState(install || {
    project: '', customer: '', location: '', capacity: '', panels: '',
    inverter: '', team: 'Team B (Install)', startDate: '', endDate: '',
    status: 'Pending', stage: 'Awaiting Survey', progress: 0
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{install ? 'Edit Installation' : 'Add Installation'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="two">
          <label>Project ID<input value={form.project} onChange={e => set('project', e.target.value)} placeholder="PRJ-001" /></label>
          <label>Customer<input value={form.customer} onChange={e => set('customer', e.target.value)} placeholder="Customer name" /></label>
        </div>
        <div className="two">
          <label>Location<input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City / Area" /></label>
          <label>Capacity<input value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="5 kW" /></label>
        </div>
        <div className="two">
          <label>No. of Panels<input type="number" value={form.panels} onChange={e => set('panels', e.target.value)} placeholder="12" /></label>
          <label>Inverter Model<input value={form.inverter} onChange={e => set('inverter', e.target.value)} placeholder="Fronius Primo 3.0" /></label>
        </div>
        <div className="two">
          <label>Start Date<input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></label>
          <label>End Date<input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></label>
        </div>
        <div className="two">
          <label>Team
            <select value={form.team} onChange={e => set('team', e.target.value)}>
              {['Team A', 'Team A (Survey)', 'Team B', 'Team B (Install)', 'Team C'].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Stage
            <select value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="two">
          <label>Status
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Pending</option><option>In Progress</option><option>Completed</option>
            </select>
          </label>
          <label>Progress (%)
            <input type="number" min="0" max="100" value={form.progress} onChange={e => set('progress', Number(e.target.value))} />
          </label>
        </div>
        <div className="actions">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="add" onClick={() => { if (form.customer) { onSave(form); onClose(); } }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Installations() {
  const [installs, setInstalls] = useState(INITIAL_INSTALLATIONS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null);

  const q = query.trim().toLowerCase();
  const shown = installs.filter(i =>
    (filter === 'All' || i.status === filter) &&
    (!q || [i.customer, i.location, i.id, i.project, i.team].join(' ').toLowerCase().includes(q))
  );

  const save = (data) => {
    if (modal && modal.id) {
      setInstalls(prev => prev.map(i => i.id === modal.id ? { ...i, ...data } : i));
    } else {
      const id = `INS-${String(installs.length + 1).padStart(3, '0')}`;
      setInstalls(prev => [...prev, { ...data, id }]);
    }
  };

  const stageIdx = (stage) => STAGES.indexOf(stage);

  return (
    <div className="page">
      <div className="page-head-row">
        <div className="page-head"><h1>Installations</h1><p>{installs.length} installation records</p></div>
        <button className="add" onClick={() => setModal('add')}><Plus size={16} />Add Installation</button>
      </div>

      <div className="toolbar">
        <label className="search" style={{ flex: 1, maxWidth: 380 }}>
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search customer, project, team..." />
        </label>
        <div className="filter-row">
          {['All', 'In Progress', 'Pending', 'Completed'].map(t => (
            <button key={t} className={`tab ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="install-grid">
        {shown.length === 0 && <p className="empty">No installations found.</p>}
        {shown.map(inst => (
          <div className="install-card" key={inst.id} onClick={() => setModal(inst)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: 15 }}>{inst.customer}</h4>
                <p style={{ color: '#6b7894', fontSize: 12, marginTop: 2 }}>{inst.id} · {inst.project}</p>
              </div>
              <span className={`pill ${STATUS_PILL[inst.status]}`}>{inst.status}</span>
            </div>

            <div className="row" style={{ fontSize: 13, color: '#33415f', gap: 6, marginBottom: 4 }}><MapPin size={13} color="#6b7894" />{inst.location} · {inst.capacity}</div>
            <div className="row" style={{ fontSize: 13, color: '#33415f', gap: 6, marginBottom: 4 }}><Users size={13} color="#6b7894" />{inst.team}</div>
            <div className="row" style={{ fontSize: 13, color: '#33415f', gap: 6, marginBottom: 12 }}><Wrench size={13} color="#6b7894" />{inst.inverter}</div>

            {/* Stage Pipeline */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#6b7894' }}>Stage</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[inst.status] }}>{inst.stage}</span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {STAGES.map((s, i) => (
                  <div key={s} title={s} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= stageIdx(inst.stage) ? STATUS_COLOR[inst.status] : '#e3ebf7', transition: 'background .3s' }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 6, background: '#e3ebf7', borderRadius: 6 }}>
                <div style={{ width: `${inst.progress}%`, height: '100%', background: STATUS_COLOR[inst.status], borderRadius: 6, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[inst.status] }}>{inst.progress}%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: '#6b7894' }}>
              <span>📅 {inst.startDate}</span>
              <span>→ {inst.endDate}</span>
              <span>{inst.panels} panels</span>
            </div>
          </div>
        ))}
      </div>
      {modal && <InstallModal install={modal === 'add' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
