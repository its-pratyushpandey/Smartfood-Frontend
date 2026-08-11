export const LoadingState = ({ label = "Loading" }) => (
  <div className="state state-loading" role="status" aria-live="polite">
    <div className="spinner" />
    <div>
      <h3>{label}</h3>
      <p>Pulling the latest supplier and query data.</p>
    </div>
  </div>
);
