import { SOLAR_STAGES } from '../data/solarStages';

const STATUS_TABS = [
  ['All', 'All'],
  ['In Progress', 'In Progress'],
  ['Pending', 'Pending'],
  ['Completed', 'Completed'],
];

export default function FilterTabs({ filter, onFilter, counts }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {/* Primary status tabs matching screenshot */}
      <div className="filter-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {STATUS_TABS.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${filter === key ? 'on' : ''}`}
            onClick={() => onFilter(key)}
            style={{ fontWeight: 600, fontSize: 13, padding: '7px 16px', borderRadius: 10 }}
          >
            {label} {counts[key] !== undefined ? `(${counts[key]})` : ''}
          </button>
        ))}

        <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span>

        {/* Solar stage pills */}
        {SOLAR_STAGES.map((s) => (
          <button
            key={s.id}
            className={`tab ${filter === s.id ? 'on' : ''}`}
            onClick={() => onFilter(s.id)}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 10,
              background: filter === s.id ? s.color : '#fff',
              color: filter === s.id ? '#fff' : '#475569',
              borderColor: filter === s.id ? s.color : '#e2e8f0',
              fontWeight: filter === s.id ? 700 : 500,
            }}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
