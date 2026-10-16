import { Briefcase, Clock, Settings, CheckCircle2 } from 'lucide-react';

export default function StatCards({ counts }) {
  const cards = [
    ['blue', Briefcase, counts.All, 'Active Works'],
    ['orange', Clock, counts.Pending, 'Pending'],
    ['cyan', Settings, counts['In Progress'], 'In Progress'],
    ['green', CheckCircle2, counts.Completed, 'Completed'],
  ];
  return (
    <div className="stats">
      {cards.map(([tone, Icon, n, label]) => (
        <div className="stat" key={label}>
          <span className={`sicon ${tone}`}><Icon size={26} /></span>
          <div><b>{n}</b><small>{label}</small></div>
        </div>
      ))}
    </div>
  );
}
