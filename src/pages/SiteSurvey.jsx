import { useState } from 'react';
import { Plus, Search, MapPin, Sun, CheckCircle, Clock, X } from 'lucide-react';
import { INITIAL_SURVEYS } from '../data/appData';

const STATUS_PILL = { Completed: 'completed', Scheduled: 'inprogress', Cancelled: 'pending' };
const STATUS_COLOR = { Completed: '#1fae5e', Scheduled: '#1a6ff0', Cancelled: '#f59a10' };

function SurveyModal({ survey, onSave, onClose }) {
  const [form, setForm] = useState(survey || {
    customer: '', cusId: '', location: '', roofType: 'Flat RCC', roofArea: '',
    shading: 'None', phase: '1-Phase', sanctionedLoad: '', recommendedSystem: '',
    surveyDate: '', surveyor: 'Krishnanunni K', status: 'Scheduled', notes: ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{survey ? 'Edit Survey' : 'Schedule Survey'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="two">
          <label>Customer Name<input value={form.customer} onChange={e => set('customer', e.target.value)} placeholder="Customer name" /></label>
          <label>Customer ID<input value={form.cusId} onChange={e => set('cusId', e.target.value)} placeholder="CUS-001" /></label>
        </div>
        <div className="two">
          <label>Location<input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City / Area" /></label>
          <label>Survey Date<input type="date" value={form.surveyDate} onChange={e => set('surveyDate', e.target.value)} /></label>
        </div>
        <div className="two">
          <label>Roof Type
            <select value={form.roofType} onChange={e => set('roofType', e.target.value)}>
              <option>Flat RCC</option><option>Sloped Tile</option><option>Mangalore Tile</option><option>Sloped Metal</option><option>Shed</option>
            </select>
          </label>
          <label>Roof Area (sq.ft)<input type="number" value={form.roofArea} onChange={e => set('roofArea', e.target.value)} placeholder="200" /></label>
        </div>
        <div className="two">
          <label>Shading
            <select value={form.shading} onChange={e => set('shading', e.target.value)}>
              <option>None</option><option>Minimal</option><option>Moderate</option><option>Heavy</option>
            </select>
          </label>
          <label>Phase
            <select value={form.phase} onChange={e => set('phase', e.target.value)}>
              <option>1-Phase</option><option>3-Phase</option>
            </select>
          </label>
        </div>
        <div className="two">
          <label>Sanctioned Load<input value={form.sanctionedLoad} onChange={e => set('sanctionedLoad', e.target.value)} placeholder="10 kW" /></label>
          <label>Recommended System<input value={form.recommendedSystem} onChange={e => set('recommendedSystem', e.target.value)} placeholder="5 kW" /></label>
        </div>
        <div className="two">
          <label>Surveyor
            <select value={form.surveyor} onChange={e => set('surveyor', e.target.value)}>
              <option>Krishnanunni K</option><option>Sajin P</option><option>Rajan V</option>
            </select>
          </label>
          <label>Status
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
            </select>
          </label>
        </div>
        <label>Notes<textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observations, comments..." style={{ height: 80, border: '1px solid #e3ebf7', borderRadius: 10, padding: '10px 12px', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', background: '#f8fbff' }} /></label>
        <div className="actions">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="add" onClick={() => { if (form.customer) { onSave(form); onClose(); } }}>Save Survey</button>
        </div>
      </div>
    </div>
  );
}

export default function SiteSurvey() {
  const [surveys, setSurveys] = useState(INITIAL_SURVEYS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const q = query.trim().toLowerCase();
  const shown = surveys.filter(s =>
    (filter === 'All' || s.status === filter) &&
    (!q || [s.customer, s.location, s.id, s.surveyor].join(' ').toLowerCase().includes(q))
  );

  const save = (data) => {
    if (modal && modal.id) {
      setSurveys(prev => prev.map(s => s.id === modal.id ? { ...s, ...data } : s));
    } else {
      const id = `SRV-${String(surveys.length + 1).padStart(3, '0')}`;
      setSurveys(prev => [...prev, { ...data, id }]);
    }
  };

  return (
    <div className="page">
      <div className="page-head-row">
        <div className="page-head"><h1>Site Surveys</h1><p>{surveys.length} total surveys</p></div>
        <button className="add" onClick={() => setModal('add')}><Plus size={16} />Schedule Survey</button>
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        {[['Completed', '#1fae5e', CheckCircle], ['Scheduled', '#1a6ff0', Clock], ['Total', '#8b5cf6', Sun]].map(([label, color, Icon]) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-icon" style={{ background: color + '1a', color }}><Icon size={20} /></div>
            <div className="kpi-body">
              <div className="kpi-value">{label === 'Total' ? surveys.length : surveys.filter(s => s.status === label).length}</div>
              <div className="kpi-label">{label} Surveys</div>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <label className="search" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search customer, location, surveyor..." />
        </label>
        <div className="filter-row">
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map(t => (
            <button key={t} className={`tab ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className={`cus-layout ${selected ? 'with-detail' : ''}`}>
        <div className="cus-list">
          {shown.length === 0 && <p className="empty">No surveys found.</p>}
          {shown.map(s => (
            <div key={s.id} className={`cus-card ${selected?.id === s.id ? 'cus-selected' : ''}`} onClick={() => setSelected(s)}>
              <div className="cus-avatar" style={{ background: STATUS_COLOR[s.status] + '22', color: STATUS_COLOR[s.status] }}>
                <Sun size={20} />
              </div>
              <div className="cus-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{s.customer}</h4>
                  <span className={`pill ${STATUS_PILL[s.status]}`}>{s.status}</span>
                </div>
                <p style={{ color: '#6b7894', fontSize: 12, marginTop: 2 }}>{s.id} · {s.roofType} · {s.recommendedSystem}</p>
                <div className="cus-meta">
                  <span><MapPin size={12} />{s.location}</span>
                  <span><Clock size={12} />{s.surveyDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="detail-panel">
            <div className="detail-header">
              <div><h2>{selected.customer}</h2><p style={{ color: '#6b7894', fontSize: 13 }}>{selected.id} · {selected.surveyor}</p></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="ghost" style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600 }} onClick={() => setModal(selected)}>Edit</button>
                <button onClick={() => setSelected(null)}><X size={20} /></button>
              </div>
            </div>
            <span className={`pill ${STATUS_PILL[selected.status]}`}>{selected.status}</span>
            <div className="detail-grid">
              <div className="detail-item"><span>Location</span><b>{selected.location}</b></div>
              <div className="detail-item"><span>Survey Date</span><b>{selected.surveyDate}</b></div>
              <div className="detail-item"><span>Roof Type</span><b>{selected.roofType}</b></div>
              <div className="detail-item"><span>Roof Area</span><b>{selected.roofArea} sq.ft</b></div>
              <div className="detail-item"><span>Shading</span><b>{selected.shading}</b></div>
              <div className="detail-item"><span>Phase</span><b>{selected.phase}</b></div>
              <div className="detail-item"><span>Sanctioned Load</span><b>{selected.sanctionedLoad}</b></div>
              <div className="detail-item"><span>Recommended</span><b>{selected.recommendedSystem}</b></div>
            </div>
            {selected.notes && (
              <div style={{ background: '#f8fbff', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#33415f', border: '1px solid #e3ebf7' }}>
                <b style={{ display: 'block', marginBottom: 4, color: '#6b7894' }}>Notes</b>
                {selected.notes}
              </div>
            )}
            <button className="del-btn" onClick={() => { setSurveys(prev => prev.filter(s => s.id !== selected.id)); setSelected(null); }}>Remove Survey</button>
          </div>
        )}
      </div>
      {modal && <SurveyModal survey={modal === 'add' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
