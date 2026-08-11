import { Eye, CalendarClock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "./Badges.jsx";
import { formatDate } from "../utils/formatters.js";

export const QueryCard = ({ query }) => (
  <article className="query-card">
    <div className="query-card__head">
      <div>
        <h3>{query.title}</h3>
        <p>{query.supplierId?.name || query.supplierName}</p>
      </div>
      <StatusBadge status={query.effectiveStatus || query.status} />
    </div>
    <p className="query-card__copy">{query.description}</p>
    <div className="query-card__meta">
      <PriorityBadge priority={query.priority} />
      <span>{query.category}</span>
      <span className="meta-with-icon"><CalendarClock size={14} /> Due {formatDate(query.dueDate)}</span>
    </div>
    <div className="query-card__actions">
      <Link className="btn btn-secondary" to={`/queries/${query._id}`}>
        <Eye size={16} />
        View Query
      </Link>
      <Link className="btn btn-ghost" to={`/queries/${query._id}`}>
        Open <ArrowRight size={16} />
      </Link>
    </div>
  </article>
);
