import WorkCard from './WorkCard';

export default function DayColumn({ date, works, onUpdate, onRemove }) {
  const d = new Date(`${date}T00:00:00`);
  return (
    <section className="col">
      <header>
        <div>
          <h3>{d.getDate()} {d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</h3>
          <p>{d.toLocaleDateString('en-US', { weekday: 'short' })}, {d.getFullYear()}</p>
        </div>
        <span className="count">{works.length}</span>
      </header>
      {works.map((w) => <WorkCard key={w.id} work={w} onUpdate={onUpdate} onRemove={onRemove} />)}
    </section>
  );
}
