import { useState } from 'react';
import { Search, Plus, Phone, Mail, MapPin, X, User, Building2, ShieldCheck } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';

const STATUS_COLORS = { Active: 'inprogress', 'In Progress': 'inprogress', Pending: 'pending', Completed: 'completed' };

function CustomerModal({ cus, onSave, onClose }) {
  const [form, setForm] = useState(cus || {
    name: '', phone: '', email: '', district: 'Thrissur', location: 'Thrissur', type: 'Residential',
    systemCapacity: '3 kW', status: 'Pending'
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{cus ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="two">
          <label>Full Name<input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Customer name" required /></label>
          <label>Phone<input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile" required /></label>
        </div>
        <label>Email<input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></label>
        <div className="two">
          <label>Location / District<input value={form.district || form.location || ''} onChange={e => { set('district', e.target.value); set('location', e.target.value); }} placeholder="e.g. Thrissur" /></label>
          <label>Type
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              <option>Residential</option><option>Commercial</option><option>Industrial</option>
            </select>
          </label>
        </div>
        <div className="two">
          <label>System Capacity<input value={form.systemCapacity || form.capacity || ''} onChange={e => { set('systemCapacity', e.target.value); set('capacity', e.target.value); }} placeholder="e.g. 5 kW" /></label>
          <label>Status
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Pending</option><option>Active</option><option>In Progress</option><option>Completed</option>
            </select>
          </label>
        </div>
        <div className="actions">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button className="add" onClick={() => { if (form.name) { onSave(form); onClose(); } }}>Save Customer</button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { masters, addMaster, updateMaster, deleteMaster } = useCustomers();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | customer object
  const [selected, setSelected] = useState(null);

  // Normalize customers from masters
  const customers = masters.map((m) => ({
    ...m,
    location: m.district || m.address || 'Kerala',
    capacity: m.systemCapacity || '3 kW',
  }));

  const q = query.trim().toLowerCase();
  const shown = customers.filter(c =>
    (filter === 'All' || c.status === filter || c.type === filter) &&
    (!q || [c.name, c.location, c.district, c.email, c.phone, c.id].join(' ').toLowerCase().includes(q))
  );

  const save = (data) => {
    if (modal && modal.id) {
      updateMaster(modal.id, data);
      if (selected?.id === modal.id) {
        setSelected({ ...selected, ...data });
      }
    } else {
      const id = addMaster(data);
      setSelected({ ...data, id });
    }
  };

  const remove = (id) => {
    deleteMaster(id);
    if (selected?.id === id) setSelected(null);
  };

  const TABS = ['All', 'Residential', 'Commercial', 'Active', 'In Progress', 'Pending', 'Completed'];

  return (
    <div className="page">
      <div className="page-head-row">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <h1>👥 Customers</h1>
          <p>{customers.length} registered customers · Synced with Master database</p>
        </div>
        <button className="add" onClick={() => setModal('add')}>
          <Plus size={16} />Add Customer
        </button>
      </div>

      <div className="toolbar">
        <label className="search" style={{ flex: 1, maxWidth: 380 }}>
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, location, phone..." />
        </label>
        <div className="filter-row">
          {TABS.map(t => <button key={t} className={`tab ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{t}</button>)}
        </div>
      </div>

      <div className={`cus-layout ${selected ? 'with-detail' : ''}`}>
        <div className="cus-list">
          {shown.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', background: '#fff', borderRadius: 16, border: '1px solid #e3ebf7', color: 'var(--mute)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>👥</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>No Customers in Directory</h3>
              <p style={{ fontSize: 13, marginBottom: 16 }}>All customer records are clear. Click below to add a new customer.</p>
              <button className="add" style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setModal('add')}>
                <Plus size={15} /> Add Customer
              </button>
            </div>
          )}
          {shown.map(c => (
            <div key={c.id} className={`cus-card ${selected?.id === c.id ? 'cus-selected' : ''}`} onClick={() => setSelected(c)}>
              <div className="cus-avatar" style={{ background: c.type === 'Commercial' ? 'linear-gradient(135deg,#f59a10,#d97706)' : 'linear-gradient(135deg,#3b95ff,#1a6ff0)' }}>
                {c.type === 'Commercial' ? <Building2 size={20} color="#fff" /> : <User size={20} color="#fff" />}
              </div>
              <div className="cus-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{c.name}</h4>
                  <span className={`pill ${STATUS_COLORS[c.status] || 'pending'}`}>{c.status}</span>
                </div>
                <p style={{ color: '#6b7894', fontSize: 12, marginTop: 2 }}>{c.id} · {c.type} · {c.capacity}</p>
                <div className="cus-meta">
                  <span><MapPin size={12} />{c.location}</span>
                  <span><Phone size={12} />{c.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="detail-panel">
            <div className="detail-header">
              <div>
                <h2>{selected.name}</h2>
                <p style={{ color: '#6b7894', fontSize: 13 }}>{selected.id} · Joined {selected.joined || '2026'}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="ghost" style={{ padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600 }} onClick={() => setModal(selected)}>Edit</button>
                <button onClick={() => setSelected(null)}><X size={20} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, margin: '8px 0 14px', flexWrap: 'wrap' }}>
              <span className={`pill ${STATUS_COLORS[selected.status] || 'pending'}`} style={{ fontSize: 13 }}>{selected.status}</span>
              {selected.workflowStage && (
                <span className="pill" style={{ background: '#f0edff', color: '#6366f1', fontSize: 13 }}>
                  {selected.workflowStage}
                </span>
              )}
            </div>

            <div className="detail-grid">
              <div className="detail-item"><span>Type</span><b>{selected.type}</b></div>
              <div className="detail-item"><span>Capacity</span><b>{selected.capacity}</b></div>
              <div className="detail-item"><span>Location</span><b>{selected.location}</b></div>
              <div className="detail-item"><span>District</span><b>{selected.district || selected.location}</b></div>
              {selected.aadharNumber && <div className="detail-item"><span>Aadhaar</span><b>{selected.aadharNumber}</b></div>}
              {selected.panNumber && <div className="detail-item"><span>PAN</span><b>{selected.panNumber}</b></div>}
              {selected.subsidyAmount > 0 && <div className="detail-item"><span>Surya Ghar Subsidy</span><b style={{ color: '#d97706' }}>₹{selected.subsidyAmount.toLocaleString()}</b></div>}
            </div>

            <div className="detail-contacts">
              <a href={`tel:${selected.phone}`} className="contact-btn"><Phone size={16} />{selected.phone}</a>
              <a href={`mailto:${selected.email}`} className="contact-btn"><Mail size={16} />{selected.email}</a>
            </div>

            <button className="del-btn" onClick={() => remove(selected.id)}>Remove Customer</button>
          </div>
        )}
      </div>

      {modal && (
        <CustomerModal cus={modal === 'add' ? null : modal} onSave={save} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
