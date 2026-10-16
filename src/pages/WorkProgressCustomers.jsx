import { useState, useMemo } from 'react';
import useWorks from '../hooks/useWorks';
import { useCustomers } from '../context/CustomerContext';
import { SOLAR_STAGES, stageProgress, stageColor } from '../data/solarStages';
import {
  Users, Search, Plus, Phone, Mail, MapPin, X, User,
  Building2, ArrowRight, Layers, Edit3, Trash2,
  Calendar as CalendarIcon, CheckCircle2, Clock,
  Columns3, Rows3, Check, Filter, RotateCcw
} from 'lucide-react';

const STATUS_COLORS = {
  Active: 'inprogress',
  'In Progress': 'inprogress',
  Pending: 'pending',
  Completed: 'completed',
};

const formatDateHeader = (dStr) => {
  if (!dStr) return 'Unscheduled';
  try {
    const d = new Date(`${dStr}T00:00:00`);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dStr;
  }
};

const formatDayOfWeek = (dStr) => {
  if (!dStr) return '';
  try {
    const d = new Date(`${dStr}T00:00:00`);
    if (isNaN(d.getTime())) return '';
    const today = new Date().toISOString().slice(0, 10);
    const isToday = dStr === today;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    return isToday ? `Today · ${weekday}` : weekday;
  } catch {
    return '';
  }
};

const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getRelativeDateStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getStartOfWeekStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  const y = mon.getFullYear();
  const m = String(mon.getMonth() + 1).padStart(2, '0');
  const dayStr = String(mon.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
};

const getEndOfWeekStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  const sun = new Date(d.setDate(diff));
  const y = sun.getFullYear();
  const m = String(sun.getMonth() + 1).padStart(2, '0');
  const dayStr = String(sun.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
};

const getStartOfMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const getEndOfMonthStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
};

const DATE_PRESETS = [
  { id: 'all', label: 'All Dates' },
  { id: 'today', label: 'Today', getRange: () => ({ start: getTodayStr(), end: getTodayStr() }) },
  { id: 'yesterday', label: 'Yesterday', getRange: () => ({ start: getRelativeDateStr(-1), end: getRelativeDateStr(-1) }) },
  { id: 'week', label: 'This Week', getRange: () => ({ start: getStartOfWeekStr(), end: getEndOfWeekStr() }) },
  { id: 'month', label: 'This Month', getRange: () => ({ start: getStartOfMonthStr(), end: getEndOfMonthStr() }) },
  { id: 'custom', label: 'Custom Range' },
];

// ── Customer Modal (Add / Edit) ──────────────────────────────
function CustomerModal({ cus, onSave, onClose }) {
  const [form, setForm] = useState(
    cus
      ? {
          ...cus,
          workflowStage: cus.stage || cus.workflowStage || 'Anubhandham 1',
        }
      : {
          name: '',
          phone: '',
          email: '',
          district: 'Thrissur',
          location: 'Thrissur',
          type: 'Residential',
          systemCapacity: '3 kW',
          status: 'In Progress',
          workflowStage: 'Anubhandham 1',
          date: new Date().toISOString().slice(0, 10),
          joined: new Date().toISOString().slice(0, 10),
        }
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{cus ? '✏️ Edit Customer' : '👤 Add New Customer'}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="two">
          <label>
            Full Name
            <input
              required
              autoFocus
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Anil Kumar"
            />
          </label>
          <label>
            Phone Number
            <input
              required
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="10-digit mobile"
            />
          </label>
        </div>

        <div className="two">
          <label>
            Email Address
            <input
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="customer@example.com"
            />
          </label>
          <label>
            Location / District
            <input
              required
              value={form.district || form.location || ''}
              onChange={(e) => {
                set('district', e.target.value);
                set('location', e.target.value);
              }}
              placeholder="e.g. Thrissur"
            />
          </label>
        </div>

        <div className="two">
          <label>
            Customer Type
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Industrial</option>
            </select>
          </label>
          <label>
            System Capacity
            <input
              value={form.systemCapacity || form.capacity || ''}
              onChange={(e) => {
                set('systemCapacity', e.target.value);
                set('capacity', e.target.value);
              }}
              placeholder="e.g. 3 kW, 5 kW"
            />
          </label>
        </div>

        <div className="two">
          <label>
            Registration / Schedule Date
            <input
              type="date"
              required
              value={form.date || form.joined || new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                set('date', e.target.value);
                set('joined', e.target.value);
              }}
            />
          </label>
          <label>
            ⚡ Solar Workflow Stage (Editable)
            <select
              value={form.workflowStage || 'Anubhandham 1'}
              onChange={(e) => set('workflowStage', e.target.value)}
              style={{ fontWeight: 700 }}
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
          Status
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option>In Progress</option>
            <option>Pending</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </label>

        <div className="actions">
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="add"
            onClick={() => {
              if (form.name.trim()) {
                const stage = form.workflowStage || 'Anubhandham 1';
                onSave({
                  ...form,
                  workflowStage: stage,
                  stage: stage,
                  date: form.date || form.joined || new Date().toISOString().slice(0, 10),
                  joined: form.date || form.joined || new Date().toISOString().slice(0, 10),
                });
                onClose();
              }
            }}
          >
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Date-Classified Customer Page ───────────────────────
export default function WorkProgressCustomers() {
  const { works, add: addWork, update: updateWork } = useWorks();
  const { masters, addMaster, updateMaster, deleteMaster } = useCustomers();

  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [customerType, setCustomerType] = useState('All');
  const [dateViewMode, setDateViewMode] = useState('sections'); // 'sections' | 'columns'

  // Date filtration state
  const [datePreset, setDatePreset] = useState('all');
  const [customStart, setCustomStart] = useState(() => getTodayStr());
  const [customEnd, setCustomEnd] = useState(() => getTodayStr());

  // Modals state
  const [customerModal, setCustomerModal] = useState(null); // null | 'add' | customer
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const q = query.trim().toLowerCase();

  // Determine current active start and end dates
  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    if (datePreset === 'all') {
      return { startDate: null, endDate: null, dateRangeLabel: 'All Dates' };
    }
    if (datePreset === 'custom') {
      const startFmt = customStart ? formatDateHeader(customStart) : 'Any';
      const endFmt = customEnd ? formatDateHeader(customEnd) : 'Any';
      let label = 'Custom Range';
      if (customStart && customEnd) {
        label = customStart === customEnd ? startFmt : `${startFmt} – ${endFmt}`;
      } else if (customStart) {
        label = `From ${startFmt}`;
      } else if (customEnd) {
        label = `Until ${endFmt}`;
      }
      return {
        startDate: customStart || null,
        endDate: customEnd || null,
        dateRangeLabel: label,
      };
    }
    const found = DATE_PRESETS.find((p) => p.id === datePreset);
    if (found && found.getRange) {
      const range = found.getRange();
      return {
        startDate: range.start,
        endDate: range.end,
        dateRangeLabel: found.label,
      };
    }
    return { startDate: null, endDate: null, dateRangeLabel: 'All Dates' };
  }, [datePreset, customStart, customEnd]);

  const handleResetDateFilter = () => {
    setDatePreset('all');
    setCustomStart(getTodayStr());
    setCustomEnd(getTodayStr());
  };

  // ── Unified customers list mapped with live date & solar workflow ──
  const customers = useMemo(() => {
    return masters.map((m) => {
      const linkedWork = works.find((w) => w.cus === m.id || w.cus === m.name);
      // Give priority to master's workflowStage, fallback to linkedWork
      const stage = m.workflowStage || linkedWork?.stage || 'Anubhandham 1';
      const date =
        m.date ||
        linkedWork?.date ||
        m.joined ||
        new Date().toISOString().slice(0, 10);

      return {
        ...m,
        date,
        location: m.district || m.address || 'Kerala',
        capacity: m.systemCapacity || '3 kW',
        stage,
        workflowStage: stage,
        progress: stageProgress(stage),
        color: stageColor(stage),
        linkedWork,
      };
    });
  }, [masters, works]);

  // ── 1. Filter customers by date range first ──
  const dateFilteredCustomers = useMemo(() => {
    if (!startDate && !endDate) return customers;
    return customers.filter((c) => {
      const d = (c.date || '').slice(0, 10);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [customers, startDate, endDate]);

  // ── 2. Filter customers by query, status, stage, and type ──
  const shownCustomers = useMemo(() => {
    return dateFilteredCustomers.filter((c) => {
      const matchFilter =
        filter === 'All' ||
        c.status === filter ||
        c.stage === filter;
      const matchType = customerType === 'All' || c.type === customerType;
      const matchQuery =
        !q ||
        [c.name, c.location, c.district, c.email, c.phone, c.id, c.stage, c.capacity, c.date]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchFilter && matchType && matchQuery;
    });
  }, [dateFilteredCustomers, filter, customerType, q]);

  // Group customers strictly classified by date
  const dateGroups = useMemo(() => {
    const map = {};
    shownCustomers.forEach((c) => {
      const d = c.date || new Date().toISOString().slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(c);
    });

    // Sort dates in reverse chronological order (latest dates first)
    return Object.keys(map)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        customers: map[date],
      }));
  }, [shownCustomers]);

  // Status counts reflect the current active date filter
  const countStatus = (s) => dateFilteredCustomers.filter((c) => c.status === s).length;
  const counts = {
    All: dateFilteredCustomers.length,
    'In Progress': countStatus('In Progress') + countStatus('Active'),
    Pending: countStatus('Pending'),
    Completed: countStatus('Completed'),
  };

  // ── Universal stage changer (Updates Customer + Work + Drawer in 1 shot) ──
  const changeCustomerStage = (customer, newStage) => {
    const stageObj = SOLAR_STAGES.find((s) => s.id === newStage);
    const progress = stageObj ? stageObj.progress : 10;
    const newStatus = newStage === 'Work All Done' ? 'Completed' : 'In Progress';

    // 1. Update customer in Master / CustomerContext
    updateMaster(customer.id, {
      workflowStage: newStage,
      status: newStatus,
    });

    // 2. Update linked work in works state
    if (customer.linkedWork) {
      updateWork(customer.linkedWork.id, {
        stage: newStage,
        progress: progress,
        status: newStatus,
      });
    } else {
      addWork({
        title: 'Solar Installation Workflow',
        cus: customer.name,
        loc: customer.location,
        team: 'Team A',
        date: customer.date,
        stage: newStage,
        progress: progress,
        status: newStatus,
        sub: `${customer.capacity} Solar Installation`,
        icon: 'Sun',
      });
    }

    // 3. Update active drawer if open
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer((prev) => ({
        ...prev,
        stage: newStage,
        workflowStage: newStage,
        progress: progress,
        status: newStatus,
        color: stageColor(newStage),
      }));
    }
  };

  // Advance to next stage in lifecycle
  const advanceCustomerStage = (customer) => {
    const currentIdx = SOLAR_STAGES.findIndex((s) => s.id === customer.stage);
    if (currentIdx < SOLAR_STAGES.length - 1) {
      const next = SOLAR_STAGES[currentIdx + 1];
      changeCustomerStage(customer, next.id);
    }
  };

  // Save customer modal
  const handleSaveCustomer = (data) => {
    const stage = data.workflowStage || data.stage || 'Anubhandham 1';
    const progress = stageProgress(stage);
    const newStatus = stage === 'Work All Done' ? 'Completed' : data.status || 'In Progress';

    const customerPatch = {
      ...data,
      workflowStage: stage,
      stage: stage,
      status: newStatus,
    };

    if (customerModal && customerModal.id) {
      updateMaster(customerModal.id, customerPatch);

      // Find any linked work and update it too
      const linked = works.find((w) => w.cus === customerModal.id || w.cus === customerModal.name);
      if (linked) {
        updateWork(linked.id, {
          cus: data.name,
          loc: data.district || data.location,
          stage: stage,
          progress: progress,
          status: newStatus,
          date: data.date,
        });
      }

      if (selectedCustomer?.id === customerModal.id) {
        setSelectedCustomer((prev) => ({
          ...prev,
          ...customerPatch,
          progress,
          color: stageColor(stage),
        }));
      }
    } else {
      const id = addMaster(customerPatch);
      const newCus = { ...customerPatch, id };
      setSelectedCustomer(newCus);

      // Auto-create work entry
      addWork({
        title: 'Site Survey & Agreement',
        cus: data.name,
        loc: data.district || data.location || 'Thrissur',
        team: 'Team A',
        date: data.date || new Date().toISOString().slice(0, 10),
        stage: stage,
        progress: progress,
        status: newStatus,
        sub: `${data.systemCapacity || '3 kW'} Solar Installation`,
        icon: 'FileText',
      });
    }
  };

  // Remove customer
  const handleRemoveCustomer = (id) => {
    if (window.confirm('Delete this customer from directory?')) {
      deleteMaster(id);
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    }
  };

  // Customer Card Component
  const renderCustomerCard = (c) => {
    const isSelected = selectedCustomer?.id === c.id;

    return (
      <div
        key={c.id}
        className={`cus-card ${isSelected ? 'cus-selected' : ''}`}
        onClick={() => setSelectedCustomer(c)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 16,
          borderRadius: 18,
          background: '#ffffff',
          border: isSelected ? '2px solid #1a6ff0' : '1.5px solid #eef3f9',
          boxShadow: isSelected
            ? '0 6px 20px rgba(26,111,240,.18)'
            : '0 3px 12px rgba(30,60,120,.05)',
          cursor: 'pointer',
          transition: 'all .2s ease',
        }}
      >
        {/* Top Row: Avatar, Name, Status, Phone */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%' }}>
          <div
            className="cus-avatar"
            style={{
              background:
                c.type === 'Commercial'
                  ? 'linear-gradient(135deg,#f59a10,#d97706)'
                  : 'linear-gradient(135deg,#1a6ff0,#00c2cb)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              width: 44,
              height: 44,
              borderRadius: 14,
            }}
          >
            {c.name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'SO'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: '#0f172a' }}>
                {c.name}
              </h4>
              <span className={`pill ${STATUS_COLORS[c.status] || 'pending'}`} style={{ fontSize: 11.5 }}>
                {c.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>
                {c.id}
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ color: '#1d4ed8', background: '#eff6ff', padding: '2px 7px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                {c.capacity}
              </span>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                {c.type}
              </span>
            </div>

            <div className="cus-meta" style={{ marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span>
                <MapPin size={12} color="#64748b" /> {c.location}
              </span>
              {c.phone && (
                <a
                  href={`tel:${c.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1a6ff0', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}
                >
                  <Phone size={12} /> {c.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Solar Lifecycle Section with Editable Option ── */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Header Row with EDITABLE Solar Stage Select Dropdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Layers size={12} color="#1a6ff0" /> Solar Lifecycle
            </span>

            {/* Editable Stage Dropdown Selector right on the card */}
            <div onClick={(e) => e.stopPropagation()}>
              <select
                value={c.stage}
                onChange={(e) => changeCustomerStage(c, e.target.value)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.color,
                  background: c.color + '15',
                  border: `1.5px solid ${c.color}50`,
                  borderRadius: 8,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                title="Change Solar Lifecycle Stage"
              >
                {SOLAR_STAGES.map((s) => (
                  <option key={s.id} value={s.id} style={{ color: '#0f172a', background: '#fff' }}>
                    {s.emoji} {s.label} ({s.progress}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stepper Progress Indicator (Clickable steps) */}
          <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
            {SOLAR_STAGES.map((s, idx) => {
              const currentIdx = SOLAR_STAGES.findIndex((st) => st.id === c.stage);
              return (
                <div
                  key={s.id}
                  onClick={() => changeCustomerStage(c, s.id)}
                  title={`Click to set stage: ${s.label} (${s.progress}%)`}
                  style={{
                    flex: 1,
                    height: 7,
                    borderRadius: 4,
                    background: idx <= currentIdx ? c.color : '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                />
              );
            })}
          </div>

          {/* Advance Stage Action Button / Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
              Progress: <b style={{ color: c.color }}>{c.progress}%</b>
            </span>

            <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
              {c.stage !== 'Work All Done' ? (
                <button
                  onClick={() => advanceCustomerStage(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: '#1a6ff0',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Advance to next solar lifecycle stage"
                >
                  Next Stage <ArrowRight size={12} />
                </button>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1fae5e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* ── 1. Top Header Row ────────────────────────────── */}
      <div className="page-head-row" style={{ padding: '0 0 16px', borderBottom: '1px solid #eef3fb' }}>
        <div className="page-head" style={{ marginBottom: 0 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👥</span> Customers
          </h1>
          <p>
            {datePreset !== 'all' ? (
              <span>
                Showing <b style={{ color: '#1a6ff0' }}>{shownCustomers.length}</b> of {customers.length} registered customers · Filtered by: <b style={{ color: '#0f172a' }}>{dateRangeLabel}</b>
              </span>
            ) : (
              <span>
                {customers.length} registered customers · Classified by date &amp; solar workflow progress
              </span>
            )}
          </p>
        </div>

        {/* Header Action: Add Customer & Layout Switcher */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Toggle: Date Sections vs Date Columns */}
          <div className="view-toggle">
            <button
              className={dateViewMode === 'sections' ? 'on' : ''}
              onClick={() => setDateViewMode('sections')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              title="Classified Date Sections"
            >
              <Rows3 size={15} /> By Date Sections
            </button>
            <button
              className={dateViewMode === 'columns' ? 'on' : ''}
              onClick={() => setDateViewMode('columns')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              title="Classified Date Columns"
            >
              <Columns3 size={15} /> Date Columns
            </button>
          </div>

          <button
            className="add"
            onClick={() => setCustomerModal('add')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, padding: '9px 18px' }}
          >
            <Plus size={16} /> + Add Customer
          </button>
        </div>
      </div>

      {/* ── 2. Date Filter Bar ──────────────────────────────── */}
      <div className="date-filter-bar" style={{ margin: '16px 0 16px' }}>
        <div className="date-presets">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#44526f', marginRight: 4 }}>
            <CalendarIcon size={16} color="#1a6ff0" />
            Date Filter:
          </span>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.id}
              className={`tab ${datePreset === p.id ? 'on' : ''}`}
              onClick={() => setDatePreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="date-custom-group">
          {datePreset === 'custom' && (
            <>
              <div className="date-input-wrap">
                <label>From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="date-input-wrap">
                <label>To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </>
          )}

          {datePreset !== 'all' && (
            <div className="date-range-badge">
              <Filter size={13} />
              <span>{dateRangeLabel} ({dateFilteredCustomers.length} {dateFilteredCustomers.length === 1 ? 'customer' : 'customers'})</span>
            </div>
          )}

          {datePreset !== 'all' && (
            <button className="reset-btn" onClick={handleResetDateFilter} title="Reset to All Dates">
              <RotateCcw size={13} />
              Reset Date
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Top Metric Statistics ──────────────────────── */}
      <div className="stats" style={{ margin: '18px 0 16px' }}>
        <div className="stat" onClick={() => setFilter('All')} style={{ cursor: 'pointer' }}>
          <span className="sicon cyan"><Users size={24} /></span>
          <div><b>{counts.All}</b><small>Total Customers</small></div>
        </div>
        <div className="stat" onClick={() => setFilter('In Progress')} style={{ cursor: 'pointer' }}>
          <span className="sicon orange"><Clock size={24} /></span>
          <div><b>{counts['In Progress']}</b><small>In Progress</small></div>
        </div>
        <div className="stat" onClick={() => setFilter('Pending')} style={{ cursor: 'pointer' }}>
          <span className="sicon blue"><CalendarIcon size={24} /></span>
          <div><b>{counts.Pending}</b><small>Pending</small></div>
        </div>
        <div className="stat" onClick={() => setFilter('Completed')} style={{ cursor: 'pointer' }}>
          <span className="sicon green"><CheckCircle2 size={24} /></span>
          <div><b>{counts.Completed}</b><small>Completed</small></div>
        </div>
      </div>

      {/* ── 3. Universal Search & Filter Bar ─────────────── */}
      <div className="toolbar" style={{ margin: '14px 0 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="search" style={{ flex: '1 1 280px', maxWidth: 420 }}>
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer name, phone, district, date, stage..."
          />
        </label>

        {/* Primary status filters */}
        <div className="filter-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', 'In Progress', 'Pending', 'Completed'].map((st) => (
            <button
              key={st}
              className={`tab ${filter === st ? 'on' : ''}`}
              onClick={() => setFilter(st)}
              style={{ fontWeight: 600, fontSize: 12.5, padding: '7px 14px', borderRadius: 10 }}
            >
              {st} {counts[st] !== undefined ? `(${counts[st]})` : ''}
            </button>
          ))}

          <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span>

          {['All', 'Residential', 'Commercial'].map((t) => (
            <button
              key={t}
              className={`tab ${customerType === t ? 'on' : ''}`}
              onClick={() => setCustomerType(t)}
              style={{ fontSize: 12, padding: '6px 12px', borderRadius: 9 }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Solar Lifecycle Stage Filter Pills ───────────── */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
        {SOLAR_STAGES.map((s) => {
          const isSelected = filter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setFilter(isSelected ? 'All' : s.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 13px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: isSelected ? 700 : 600,
                border: '1px solid',
                borderColor: isSelected ? s.color : '#e2e8f0',
                background: isSelected ? s.color : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .2s ease',
                boxShadow: isSelected ? `0 3px 10px ${s.color}40` : 'none',
              }}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
              <span style={{ fontSize: 10.5, opacity: 0.85 }}>({s.progress}%)</span>
            </button>
          );
        })}
      </div>

      {/* ── 5. Date-Classified Customer Layout ─────────────── */}
      <div className={`cus-layout ${selectedCustomer ? 'with-detail' : ''}`}>
        <div className="cus-list" style={{ minWidth: 0 }}>
          {dateGroups.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '56px 20px',
                background: '#fff',
                borderRadius: 20,
                border: '1px solid #e3ebf7',
                color: 'var(--mute)',
              }}
            >
              <p style={{ fontSize: 36, marginBottom: 10 }}>👥</p>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                No Customers Found
              </h3>
              <p style={{ fontSize: 13.5, marginBottom: 18 }}>
                {customers.length === 0
                  ? 'Get started by creating your first customer record with solar progress.'
                  : datePreset !== 'all'
                  ? `No customer records found scheduled for ${dateRangeLabel}.`
                  : 'No customer records match your filter criteria.'}
              </p>
              {datePreset !== 'all' ? (
                <button
                  className="reset-btn"
                  style={{ margin: '0 auto', padding: '8px 16px', display: 'inline-flex' }}
                  onClick={handleResetDateFilter}
                >
                  <RotateCcw size={14} /> Reset Date Filter
                </button>
              ) : (
                <button
                  className="add"
                  style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setCustomerModal('add')}
                >
                  <Plus size={15} /> Add Customer
                </button>
              )}
            </div>
          ) : dateViewMode === 'sections' ? (
            /* ── Layout A: Classified By Date Sections ── */
            dateGroups.map((group) => (
              <div key={group.date} style={{ marginBottom: 24 }}>
                {/* Date Classification Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #f0f6ff, #e9f2ff)',
                    border: '1.5px solid #cddffb',
                    borderRadius: 14,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#1a6ff0',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <CalendarIcon size={16} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a' }}>
                        {formatDateHeader(group.date)}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8, fontWeight: 500 }}>
                        {formatDayOfWeek(group.date)}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#1a6ff0',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: 99,
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    {group.customers.length} {group.customers.length === 1 ? 'Customer' : 'Customers'}
                  </span>
                </div>

                {/* Grid of Customer Cards for this Date */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: selectedCustomer
                      ? '1fr'
                      : 'repeat(auto-fill, minmax(330px, 1fr))',
                    gap: 12,
                  }}
                >
                  {group.customers.map((c) => renderCustomerCard(c))}
                </div>
              </div>
            ))
          ) : (
            /* ── Layout B: Classified By Date Columns ── */
            <div className="board" style={{ paddingBottom: 16 }}>
              {dateGroups.map((group) => {
                const d = new Date(`${group.date}T00:00:00`);
                const dayNum = !isNaN(d.getTime()) ? d.getDate() : '';
                const monthStr = !isNaN(d.getTime())
                  ? d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
                  : '';
                const dayStr = !isNaN(d.getTime())
                  ? d.toLocaleDateString('en-US', { weekday: 'short' })
                  : '';

                return (
                  <section
                    key={group.date}
                    className="col"
                    style={{ minWidth: 320, maxWidth: 360 }}
                  >
                    <header>
                      <div>
                        <h3>{dayNum} {monthStr}</h3>
                        <p>{dayStr}, {group.date.slice(0, 4)}</p>
                      </div>
                      <span className="count">{group.customers.length}</span>
                    </header>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {group.customers.map((c) => renderCustomerCard(c))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 6. Right-Hand Detail Panel ────────────────────── */}
        {selectedCustomer && (
          <div className="detail-panel" style={{ position: 'sticky', top: 20 }}>
            <div className="detail-header">
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {selectedCustomer.name}
                </h2>
                <p style={{ color: '#64748b', fontSize: 12.5, margin: '3px 0 0' }}>
                  {selectedCustomer.id} · Scheduled {selectedCustomer.date}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="ghost"
                  style={{ padding: '6px 12px', borderRadius: 9, fontSize: 12, fontWeight: 700 }}
                  onClick={() => setCustomerModal(selectedCustomer)}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Status and Stage Badges */}
            <div style={{ display: 'flex', gap: 8, margin: '8px 0 10px', flexWrap: 'wrap' }}>
              <span className={`pill ${STATUS_COLORS[selectedCustomer.status] || 'pending'}`} style={{ fontSize: 12 }}>
                {selectedCustomer.status}
              </span>
              <span
                className="pill"
                style={{
                  background: selectedCustomer.color + '15',
                  color: selectedCustomer.color,
                  borderColor: selectedCustomer.color + '40',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {SOLAR_STAGES.find((s) => s.id === selectedCustomer.stage)?.emoji} {selectedCustomer.stage} ({selectedCustomer.progress}%)
              </span>
            </div>

            {/* Customer Details Grid */}
            <div className="detail-grid">
              <div className="detail-item">
                <span>Date</span>
                <b>{formatDateHeader(selectedCustomer.date)}</b>
              </div>
              <div className="detail-item">
                <span>Type</span>
                <b>{selectedCustomer.type}</b>
              </div>
              <div className="detail-item">
                <span>Capacity</span>
                <b style={{ color: '#1d4ed8' }}>{selectedCustomer.capacity}</b>
              </div>
              <div className="detail-item">
                <span>District / Location</span>
                <b>{selectedCustomer.district || selectedCustomer.location}</b>
              </div>
              {selectedCustomer.subsidyAmount > 0 && (
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <span>PM Surya Ghar Subsidy</span>
                  <b style={{ color: '#d97706', fontSize: 15 }}>₹{selectedCustomer.subsidyAmount.toLocaleString()}</b>
                </div>
              )}
            </div>

            {/* Active Installation Work Card Box with DIRECT EDITABLE STAGE */}
            <div style={{ background: '#f8fbff', border: '1.5px solid #dbeafe', borderRadius: 14, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  ⚡ Solar Lifecycle Stage
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: selectedCustomer.color }}>
                  {selectedCustomer.progress}%
                </span>
              </div>

              {/* Direct Stage Select Dropdown in the Detail Panel */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Change Solar Stage:
                </label>
                <select
                  value={selectedCustomer.stage}
                  onChange={(e) => changeCustomerStage(selectedCustomer, e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    border: `1.5px solid ${selectedCustomer.color}60`,
                    background: '#ffffff',
                    color: selectedCustomer.color,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '0 10px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {SOLAR_STAGES.map((s) => (
                    <option key={s.id} value={s.id} style={{ color: '#0f172a' }}>
                      {s.emoji} {s.label} ({s.progress}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  className="add"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 12.5 }}
                  onClick={() => advanceCustomerStage(selectedCustomer)}
                  disabled={selectedCustomer.stage === 'Work All Done'}
                >
                  {selectedCustomer.stage === 'Work All Done' ? 'Workflow All Done 🎉' : 'Advance to Next Stage ➔'}
                </button>
              </div>
            </div>

            {/* Direct Communication Buttons */}
            <div className="detail-contacts">
              {selectedCustomer.phone && (
                <a href={`tel:${selectedCustomer.phone}`} className="contact-btn">
                  <Phone size={15} /> Call {selectedCustomer.phone}
                </a>
              )}
              {selectedCustomer.email && (
                <a href={`mailto:${selectedCustomer.email}`} className="contact-btn">
                  <Mail size={15} /> Send Email ({selectedCustomer.email})
                </a>
              )}
            </div>

            <button className="del-btn" onClick={() => handleRemoveCustomer(selectedCustomer.id)}>
              Delete Customer Record
            </button>
          </div>
        )}
      </div>

      {/* ── 7. Customer Modal (Add/Edit) ──────────────────── */}
      {customerModal && (
        <CustomerModal
          cus={customerModal === 'add' ? null : customerModal}
          onSave={handleSaveCustomer}
          onClose={() => setCustomerModal(null)}
        />
      )}
    </div>
  );
}
