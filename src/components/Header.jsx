import { Search, Plus, Bell, ChevronDown } from 'lucide-react';

export default function Header({ query, onQuery, onAdd }) {
  return (
    <header className="top">
      <div className="title">
        <h1>Work Progress &amp; Status</h1>
        <p>Solar installation project tracker</p>
      </div>
      <label className="search">
        <Search size={18} />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search works, customer, location..." />
      </label>
      <button className="add" onClick={onAdd}><Plus size={18} />Add Work</button>
      <button className="bell" aria-label="Notifications"><Bell size={18} /><i /></button>
      <div className="user">
        <span className="avatar">KK</span>
        <div><b>Krishnanunni</b><small>Marketing Head</small></div>
        <ChevronDown size={16} />
      </div>
    </header>
  );
}
