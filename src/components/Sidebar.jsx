import { Users, ShieldCheck, Home, FolderKanban, MapPin, Wrench, UsersRound, Settings } from 'lucide-react';

const ITEMS = [
  ['Customers', Users],
  ['Master', ShieldCheck],
  ['Dashboard', Home],
  ['Projects', FolderKanban],
  ['Site Survey', MapPin],
  ['Installations', Wrench],
  ['Team', UsersRound],
  ['Settings', Settings],
];

export default function Sidebar({ active, onSelect }) {
  const currentActive =
    active === 'Work Progress' || active === 'Work & Customers' ? 'Customers' : active;

  return (
    <aside className="sidebar">
      <div className="brand"><strong>Royal Eye</strong><span>Solar Power</span></div>
      <nav>
        {ITEMS.map(([name, Icon]) => (
          <button
            key={name}
            className={name === currentActive ? 'nav active' : 'nav'}
            onClick={() => onSelect(name)}
          >
            <Icon size={18} />{name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
