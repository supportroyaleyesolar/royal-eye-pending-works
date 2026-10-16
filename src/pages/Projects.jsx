import { useState } from 'react';
import { Plus, Search, MapPin, Users, Calendar, X, FolderKanban } from 'lucide-react';
import { INITIAL_PROJECTS } from '../data/appData';

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const STATUS_PILL = { 'In Progress': 'inprogress', Pending: 'pending', Completed: 'completed' };
const STATUS_COLOR = { 'In Progress': '#1a6ff0', Pending: '#f59a10', Completed: '#1fae5e' };

function ProjectModal({ proj, onSave, onClose }) {
  const [form, setForm] = useState(proj || {
    name: '', customer: '', location: '', type: 'Residential', capacity: '',
    startDate: '', endDate: '', status: 'Pending', team: 'Team A', progress: 0
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{proj ? 'Edit Project' : 'Add Project'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <label>Project Name<input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Anil Kumar - 3kW Residential" /></label>
        <div className="two">
          <label>Customer ID<input value={form.customer} onChange={e => set('customer', e.target.value)} placeholder="CUS-001" /></label>
          <label>Location<input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City / Area" /></label>
        </div>
        <div className="two">
          <label>Type<select value={form.type} onChange={e => set('type', e.target.value)}><option>Residential</option><option>Commercial</option><option>Industrial</option></select></label>
          <label>Capacity<input value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="5 kW" /></label>
        </div>
        <div className="two">
          <label>Start Date<input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></label>
          <label>End Date<input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></label>
        </div>
        <label>Status
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            <option>Pending</option><option>In Progress</option><option>Completed</option>
          </select>
        </label>
        <label>Assigned Team
          <select value={form.team} onChange={e => set('team', e.target.value)}>
            {['Team A', 'Team A (Survey)', 'Team B', 'Team B (Install)', 'Team C'].map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <div className="actions">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="add" onClick={() => { if (form.name) { onSave(form); onClose(); } }}>Save Project</button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'

  const q = query.trim().toLowerCase();
  const shown = projects.filter(p =>
    !q || [p.name, p.customer, p.location, p.id].join(' ').toLowerCase().includes(q)
  );

  const save = (data) => {
    if (modal && modal.id) {
      setProjects(prev => prev.map(p => p.id === modal.id ? { ...p, ...data } : p));
    } else {
      const id = `PRJ-${String(projects.length + 1).padStart(3, '0')}`;
      setProjects(prev => [...prev, { ...data, id, spent: 0 }]);
    }
  };

  return (
    <div className="page">
      <div className="page-head-row">
        <div className="page-head"><h1>Projects</h1><p>{projects.length} total projects</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="view-toggle">
            <button className={view === 'kanban' ? 'on' : ''} onClick={() => setView('kanban')}>Kanban</button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List</button>
          </div>
          <button className="add" onClick={() => setModal('add')}><Plus size={16} />Add Project</button>
        </div>
      </div>

      <label className="search" style={{ width: 360, display: 'flex', gap: 10, padding: '0 16px', height: 44, background: '#fff', border: '1px solid #e3ebf7', borderRadius: 12, color: '#6b7894', marginBottom: 20 }}>
        <Search size={16} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects..." style={{ border: 0, outline: 0, flex: 1, background: 'none', fontSize: 14 }} />
      </label>

      {view === 'kanban' ? (
        <div className="kanban">
          {STATUSES.map(status => {
            const cols = shown.filter(p => p.status === status);
            return (
              <div className="kanban-col" key={status}>
                <div className="kanban-head" style={{ borderTop: `3px solid ${STATUS_COLOR[status]}` }}>
                  <span style={{ color: STATUS_COLOR[status], fontWeight: 700 }}>{status}</span>
                  <span className="count">{cols.length}</span>
                </div>
                {cols.map(p => (
                  <div className="proj-card" key={p.id} onClick={() => setModal(p)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <code style={{ fontSize: 11, color: '#6b7894' }}>{p.id}</code>
                      <span className={`pill ${STATUS_PILL[p.status]}`}>{p.status}</span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{p.name}</h4>
                    <div className="row" style={{ fontSize: 12, color: '#6b7894', gap: 6, marginBottom: 4 }}><MapPin size={12} />{p.location}</div>
                    <div className="row" style={{ fontSize: 12, color: '#6b7894', gap: 6, marginBottom: 4 }}><Users size={12} />{p.team}</div>
                    <div className="row" style={{ fontSize: 12, color: '#6b7894', gap: 6, marginBottom: 8 }}><FolderKanban size={12} />{p.capacity} · {p.type}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#e3ebf7', borderRadius: 6 }}>
                        <div style={{ width: `${p.progress}%`, height: '100%', background: STATUS_COLOR[p.status], borderRadius: 6 }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#6b7894' }}>{p.progress}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#6b7894' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> Target</span>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{p.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dash-card">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Project Name</th><th>Location</th><th>Capacity</th><th>Team</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              {shown.map(p => (
                <tr key={p.id} onClick={() => setModal(p)} style={{ cursor: 'pointer' }}>
                  <td><code>{p.id}</code></td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.location}</td>
                  <td>{p.capacity}</td>
                  <td>{p.team}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: '#e3ebf7', borderRadius: 6 }}>
                        <div style={{ width: `${p.progress}%`, height: '100%', background: STATUS_COLOR[p.status], borderRadius: 6 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#6b7894' }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td><span className={`pill ${STATUS_PILL[p.status]}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <ProjectModal proj={modal === 'add' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
