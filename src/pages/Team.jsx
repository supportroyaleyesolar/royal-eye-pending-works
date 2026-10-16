import { useState } from 'react';
import { Plus, Search, Phone, Mail, X, Briefcase, CheckCircle } from 'lucide-react';
import { INITIAL_TEAM } from '../data/appData';

const ROLE_COLORS = {
  'Marketing Head': '#8b5cf6', 'Project Manager': '#1a6ff0',
  'Site Surveyor': '#f59a10', 'Lead Installer': '#1fae5e',
  'Electrician': '#06b6d4', 'Technician': '#f43f5e', 'Helper': '#6b7894'
};

function MemberModal({ member, onSave, onClose }) {
  const [form, setForm] = useState(member || {
    name: '', role: 'Technician', team: 'Team A', phone: '', email: '',
    status: 'Active', skills: [], avatar: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => {
    if (skillInput.trim()) { set('skills', [...(form.skills || []), skillInput.trim()]); setSkillInput(''); }
  };
  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));

  const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{member ? 'Edit Member' : 'Add Team Member'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="two">
          <label>Full Name<input value={form.name} onChange={e => { set('name', e.target.value); set('avatar', e.target.value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()); }} placeholder="Full name" /></label>
          <label>Role
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              {Object.keys(ROLE_COLORS).map(r => <option key={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <div className="two">
          <label>Team
            <select value={form.team} onChange={e => set('team', e.target.value)}>
              {['Management', 'Team A', 'Team A (Survey)', 'Team B', 'Team B (Install)', 'Team C'].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Status
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Active</option><option>On Leave</option><option>Inactive</option>
            </select>
          </label>
        </div>
        <div className="two">
          <label>Phone<input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Mobile number" /></label>
          <label>Email<input value={form.email} onChange={e => set('email', e.target.value)} placeholder="work@royaleye.in" /></label>
        </div>
        <label>Skills
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add skill & press Enter" style={{ flex: 1, height: 42, border: '1px solid #e3ebf7', borderRadius: 10, padding: '0 12px', background: '#f8fbff', fontSize: 13 }} />
            <button onClick={addSkill} style={{ height: 42, padding: '0 16px', borderRadius: 10, background: '#eef3fb', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {(form.skills || []).map(s => (
              <span key={s} style={{ background: '#e4efff', color: '#1a6ff0', padding: '4px 10px', borderRadius: 999, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                {s}<button onClick={() => removeSkill(s)} style={{ cursor: 'pointer', color: '#1a6ff0', fontWeight: 700, lineHeight: 1, padding: '0 2px' }}>×</button>
              </span>
            ))}
          </div>
        </label>
        <div className="actions">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="add" onClick={() => { if (form.name) { onSave({ ...form, avatar: initials || form.avatar }); onClose(); } }}>Save Member</button>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null);

  const q = query.trim().toLowerCase();
  const groups = ['Management', 'Team A', 'Team A (Survey)', 'Team B', 'Team B (Install)', 'Team C'];

  const shown = team.filter(m =>
    (filter === 'All' || m.team === filter || m.status === filter) &&
    (!q || [m.name, m.role, m.team, m.email].join(' ').toLowerCase().includes(q))
  );

  const save = (data) => {
    if (modal && modal.id) {
      setTeam(prev => prev.map(m => m.id === modal.id ? { ...m, ...data } : m));
    } else {
      const id = `EMP-${String(team.length + 1).padStart(3, '0')}`;
      setTeam(prev => [...prev, { ...data, id, joined: new Date().toISOString().slice(0, 10), completedJobs: 0 }]);
    }
  };

  const TABS = ['All', 'Active', 'On Leave', ...groups];

  return (
    <div className="page">
      <div className="page-head-row">
        <div className="page-head"><h1>Team</h1><p>{team.filter(m => m.status === 'Active').length} active members</p></div>
        <button className="add" onClick={() => setModal('add')}><Plus size={16} />Add Member</button>
      </div>

      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <label className="search" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, role, team..." />
        </label>
        <div className="filter-row" style={{ flexWrap: 'wrap' }}>
          {TABS.map(t => <button key={t} className={`tab ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{t}</button>)}
        </div>
      </div>

      <div className="team-grid">
        {shown.length === 0 && <p className="empty">No members found.</p>}
        {shown.map(m => {
          const roleColor = ROLE_COLORS[m.role] || '#6b7894';
          return (
            <div className="team-card" key={m.id} onClick={() => setModal(m)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div className="team-avatar" style={{ background: `linear-gradient(135deg,${roleColor}cc,${roleColor})` }}>{m.avatar}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</h4>
                  <p style={{ fontSize: 12, color: roleColor, fontWeight: 600, marginTop: 2 }}>{m.role}</p>
                  <p style={{ fontSize: 12, color: '#6b7894' }}>{m.team}</p>
                </div>
                <span style={{
                  background: m.status === 'Active' ? '#d9f6e3' : m.status === 'On Leave' ? '#fff0d2' : '#f0f0f0',
                  color: m.status === 'Active' ? '#1fae5e' : m.status === 'On Leave' ? '#f59a10' : '#6b7894',
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600
                }}>{m.status}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <div className="row" style={{ fontSize: 12, color: '#6b7894', gap: 6 }}><Phone size={12} />{m.phone}</div>
                <div className="row" style={{ fontSize: 12, color: '#6b7894', gap: 6 }}><Mail size={12} />{m.email}</div>
                <div className="row" style={{ fontSize: 12, color: '#6b7894', gap: 6 }}><CheckCircle size={12} color="#1fae5e" />{m.completedJobs} jobs completed</div>
                {m.currentProject && <div className="row" style={{ fontSize: 12, color: '#6b7894', gap: 6 }}><Briefcase size={12} />{m.currentProject}</div>}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(m.skills || []).slice(0, 3).map(s => (
                  <span key={s} style={{ background: '#eef3fb', color: '#33415f', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>{s}</span>
                ))}
                {m.skills?.length > 3 && <span style={{ background: '#eef3fb', color: '#6b7894', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>+{m.skills.length - 3}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {modal && <MemberModal member={modal === 'add' ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
