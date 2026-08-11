export const StatCard = ({ label, value, note, icon }) => (
  <article className="stat-card">
    <div className="stat-card__icon">{icon}</div>
    <div>
      <p>{label}</p>
      <h3>{value}</h3>
      {note ? <span>{note}</span> : null}
    </div>
  </article>
);
