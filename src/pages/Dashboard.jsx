import { useState, useMemo } from 'react';
import {
  TrendingUp, Sun, Zap, Users, FolderKanban, CheckCircle2,
  Clock, AlertTriangle, ArrowUpRight, Calendar, RotateCcw, Filter
} from 'lucide-react';
import { INITIAL_PROJECTS } from '../data/appData';
import { useCustomers } from '../context/CustomerContext';

const PRESETS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today', start: '2026-10-15', end: '2026-10-15' },
  { id: 'week', label: 'This Week', start: '2026-10-12', end: '2026-10-18' },
  { id: 'month', label: 'This Month', start: '2026-10-01', end: '2026-10-31' },
  { id: 'quarter', label: 'Last 3 Months', start: '2026-08-01', end: '2026-10-31' },
  { id: 'year', label: 'This Year', start: '2026-01-01', end: '2026-12-31' },
  { id: 'custom', label: 'Custom' },
];

const MONTHLY_BASE = [
  { m: 'Jun', monthStr: '2026-06', kw: 0, proj: 0 },
  { m: 'Jul', monthStr: '2026-07', kw: 0, proj: 0 },
  { m: 'Aug', monthStr: '2026-08', kw: 0, proj: 0 },
  { m: 'Sep', monthStr: '2026-09', kw: 0, proj: 0 },
  { m: 'Oct', monthStr: '2026-10', kw: 0, proj: 0 },
  { m: 'Nov', monthStr: '2026-11', kw: 0, proj: 0 },
];

const ALL_ACTIVITIES = [];

const STATUS_COLORS = {
  Active: '#1fae5e',
  'In Progress': '#1a6ff0',
  Pending: '#f59a10',
  Completed: '#8b5cf6',
};

export default function Dashboard() {
  const { masters } = useCustomers();
  const [preset, setPreset] = useState('all');
  const [customStart, setCustomStart] = useState('2026-10-01');
  const [customEnd, setCustomEnd] = useState('2026-10-31');

  // Customer map for ID -> Name lookup
  const customerMap = useMemo(() => {
    const map = {};
    masters.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [masters]);

  // Determine current active start and end dates
  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    if (preset === 'all') {
      return { startDate: null, endDate: null, dateRangeLabel: 'All Time' };
    }
    if (preset === 'custom') {
      return {
        startDate: customStart,
        endDate: customEnd,
        dateRangeLabel: `${customStart || 'Start'} to ${customEnd || 'End'}`,
      };
    }
    const found = PRESETS.find((p) => p.id === preset);
    return {
      startDate: found?.start || null,
      endDate: found?.end || null,
      dateRangeLabel: found?.label || preset,
    };
  }, [preset, customStart, customEnd]);

  // Filter projects based on date range
  const filteredProjects = useMemo(() => {
    if (!startDate && !endDate) return INITIAL_PROJECTS;
    return INITIAL_PROJECTS.filter((p) => {
      const pStart = p.startDate;
      const pEnd = p.endDate || p.startDate;
      if (startDate && pEnd < startDate) return false;
      if (endDate && pStart > endDate) return false;
      return true;
    });
  }, [startDate, endDate]);

  // Filter activities based on date range
  const filteredActivities = useMemo(() => {
    if (!startDate && !endDate) return ALL_ACTIVITIES;
    return ALL_ACTIVITIES.filter((a) => {
      if (startDate && a.date < startDate) return false;
      if (endDate && a.date > endDate) return false;
      return true;
    });
  }, [startDate, endDate]);

  // Calculate dynamic KPIs
  const completedProjectsCount = useMemo(() => {
    return filteredProjects.filter((p) => p.status === 'Completed').length;
  }, [filteredProjects]);

  const activeProjectsCount = useMemo(() => {
    return filteredProjects.filter((p) => p.status === 'In Progress' || p.status === 'Pending').length;
  }, [filteredProjects]);

  const uniqueCustomersCount = useMemo(() => {
    if (!startDate && !endDate) return masters.length;
    const ids = new Set(filteredProjects.map((p) => p.customer));
    return ids.size;
  }, [filteredProjects, startDate, endDate, masters]);

  const totalKw = useMemo(() => {
    const sum = filteredProjects.reduce((acc, p) => acc + (parseFloat(p.capacity) || 0), 0);
    return `${sum} kW`;
  }, [filteredProjects]);

  const kpis = [
    { label: 'Completed Systems', value: String(completedProjectsCount), sub: 'Commissioned', icon: CheckCircle2, color: '#1fae5e', trend: `+${completedProjectsCount}` },
    { label: 'Active Projects', value: String(activeProjectsCount), sub: 'In pipeline', icon: FolderKanban, color: '#1a6ff0', trend: `+${activeProjectsCount}` },
    { label: 'Total Customers', value: String(uniqueCustomersCount), sub: dateRangeLabel, icon: Users, color: '#f59a10', trend: `+${uniqueCustomersCount}` },
    { label: 'kW Capacity', value: totalKw, sub: 'In scope', icon: Zap, color: '#8b5cf6', trend: `+${totalKw}` },
  ];

  // Status breakdown for Donut chart
  const byStatus = useMemo(() => {
    const counts = {};
    filteredProjects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [filteredProjects]);
  const totalStatusCount = filteredProjects.length;

  // Month matching for Capacity Bar Chart
  const isMonthActive = (monthStr) => {
    if (!startDate && !endDate) return true;
    const startM = startDate ? startDate.slice(0, 7) : '2000-01';
    const endM = endDate ? endDate.slice(0, 7) : '2099-12';
    return monthStr >= startM && monthStr <= endM;
  };

  const handleResetFilter = () => {
    setPreset('all');
    setCustomStart('2026-10-01');
    setCustomEnd('2026-10-31');
  };

  return (
    <div className="page">
      <div className="page-head-row">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <h1>Dashboard</h1>
          <p>Real-time overview of Royal Eye Solar Power operations</p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="date-filter-bar">
        <div className="date-presets">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#44526f', marginRight: 4 }}>
            <Calendar size={16} color="#1a6ff0" />
            Date Filter:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`tab ${preset === p.id ? 'on' : ''}`}
              onClick={() => setPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="date-custom-group">
          {preset === 'custom' && (
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

          {preset !== 'all' && (
            <div className="date-range-badge">
              <Filter size={13} />
              <span>{dateRangeLabel} ({filteredProjects.length} projects)</span>
            </div>
          )}

          {preset !== 'all' && (
            <button className="reset-btn" onClick={handleResetFilter} title="Reset to All Time">
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map(({ label, value, sub, icon: Icon, color, trend }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-icon" style={{ background: color + '1a', color }}>
              <Icon size={22} />
            </div>
            <div className="kpi-body">
              <div className="kpi-value">{value}</div>
              <div className="kpi-label">{label}</div>
              <div className="kpi-sub">{sub}</div>
            </div>
            <div className="kpi-trend" style={{ color }}>
              <ArrowUpRight size={14} />{trend}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row">
        {/* Capacity Bar Chart */}
        <div className="dash-card wide">
          <div className="dash-card-head">
            <h3>Monthly Capacity Installed (kW)</h3>
            <span style={{ fontSize: 12, color: 'var(--mute)' }}>
              {preset === 'all' ? 'Showing 6-month trend' : `Highlighted for: ${dateRangeLabel}`}
            </span>
          </div>
          <div className="bar-chart">
            {MONTHLY_BASE.map(({ m, monthStr, kw }) => {
              const active = isMonthActive(monthStr);
              return (
                <div className="bar-col" key={m} style={{ opacity: active ? 1 : 0.35, transition: 'opacity .3s' }}>
                  <div
                    className="bar-val"
                    style={{
                      height: `${(kw / 45) * 100}%`,
                      background: active
                        ? 'linear-gradient(180deg,#3b95ff,#1a6ff0)'
                        : '#cbd5e1',
                      borderRadius: '8px 8px 0 0',
                      minHeight: kw ? 8 : 0,
                      boxShadow: active ? '0 4px 12px rgba(26,111,240,.25)' : 'none',
                    }}
                  >
                    {kw > 0 && <span className="bar-label-top">{kw}kW</span>}
                  </div>
                  <div className="bar-month" style={{ fontWeight: active ? 700 : 400, color: active ? 'var(--ink)' : 'var(--mute)' }}>
                    {m}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Status Donut */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>Project Status Breakdown</h3>
            <span style={{ fontSize: 12, color: 'var(--mute)' }}>{dateRangeLabel}</span>
          </div>
          <div className="donut-wrap">
            <svg viewBox="0 0 120 120" width="140" height="140">
              {(() => {
                if (totalStatusCount === 0) {
                  return <circle cx="60" cy="60" r="45" fill="none" stroke="#e3ebf7" strokeWidth="18" />;
                }
                let offset = 0;
                return Object.entries(byStatus).map(([status, count]) => {
                  const pct = count / totalStatusCount;
                  const dash = pct * 283;
                  const gap = 283 - dash;
                  const el = (
                    <circle
                      key={status}
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke={STATUS_COLORS[status] || '#ccc'}
                      strokeWidth="18"
                      strokeDasharray={`${dash} ${gap}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dasharray .4s ease' }}
                    />
                  );
                  offset += dash;
                  return el;
                });
              })()}
              <text x="60" y="66" textAnchor="middle" fontSize="22" fontWeight="800" fill="#101a33">
                {totalStatusCount}
              </text>
            </svg>
            <div className="donut-legend">
              {Object.keys(byStatus).length > 0 ? (
                Object.entries(byStatus).map(([status, count]) => (
                  <div className="legend-item" key={status}>
                    <span className="legend-dot" style={{ background: STATUS_COLORS[status] || '#ccc' }} />
                    <span>{status}</span>
                    <b>{count}</b>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--mute)', fontSize: 13 }}>No projects in this period</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dash-card">
        <div className="dash-card-head">
          <h3>Recent Operations Activity</h3>
          <span style={{ fontSize: 12, color: 'var(--mute)' }}>
            {filteredActivities.length} updates found
          </span>
        </div>
        <div className="activity-list">
          {filteredActivities.length > 0 ? (
            filteredActivities.map(({ icon: Icon, color, text, time }, i) => (
              <div className="activity-row" key={i}>
                <div className="act-icon" style={{ background: color + '18', color }}>
                  <Icon size={16} />
                </div>
                <span className="act-text">{text}</span>
                <span className="act-time">{time}</span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mute)', fontSize: 13 }}>
              No activities found for {dateRangeLabel}.
            </div>
          )}
        </div>
      </div>

      {/* Project Summary Table */}
      <div className="dash-card">
        <div className="dash-card-head">
          <div>
            <h3>Project Summary</h3>
            <p style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>
              Showing {filteredProjects.length} projects active during {dateRangeLabel}
            </p>
          </div>
          {preset !== 'all' && (
            <button className="reset-btn" onClick={handleResetFilter}>
              <RotateCcw size={12} /> Show All
            </button>
          )}
        </div>

        {filteredProjects.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Timeline</th>
                <th>System Capacity</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const cusName = customerMap[p.customer] || p.customer;
                const prog = p.progress || 0;
                return (
                  <tr key={p.id}>
                    <td><code>{p.id}</code></td>
                    <td><strong>{cusName}</strong></td>
                    <td>{p.location}</td>
                    <td style={{ fontSize: 12, color: 'var(--mute)' }}>
                      {p.startDate} → {p.endDate}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{p.capacity}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#e3ebf7', borderRadius: 6, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${prog}%`,
                              height: '100%',
                              background: prog === 100 ? '#1fae5e' : '#1a6ff0',
                              borderRadius: 6,
                              transition: 'width .3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7894', width: 34 }}>{prog}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${p.status.toLowerCase().replace(' ', '')}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--mute)' }}>
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              No projects found for the selected date range ({dateRangeLabel}).
            </p>
            <button className="add" style={{ margin: '0 auto' }} onClick={handleResetFilter}>
              <RotateCcw size={15} /> Reset Date Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
