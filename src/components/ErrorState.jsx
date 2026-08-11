import { AlertTriangle, RotateCcw } from "lucide-react";

export const ErrorState = ({ title = "Unable to load data", message, onRetry }) => (
  <div className="state state-error" role="alert">
    <AlertTriangle size={30} />
    <h3>{title}</h3>
    <p>{message || "Please try again."}</p>
    {onRetry ? (
      <button className="btn btn-secondary" onClick={onRetry} type="button">
        <RotateCcw size={16} />
        Retry
      </button>
    ) : null}
  </div>
);
