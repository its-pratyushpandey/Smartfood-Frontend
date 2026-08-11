import { Link } from "react-router-dom";
import { CalendarClock, Eye } from "lucide-react";
import { PriorityBadge, StatusBadge } from "./Badges.jsx";
import { formatDate } from "../utils/formatters.js";
import { QueryCard } from "./QueryCard.jsx";

export const QueryTable = ({ queries, emptyState }) => {
  if (!queries.length) return emptyState;

  return (
    <>
      <div className="table-wrap desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Query</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((query) => (
              <tr key={query._id}>
                <td>
                  <strong>{query.supplierId?.name || query.supplierName}</strong>
                  <div className="subtle">{query.supplierId?.contactPerson || query.supplierContact}</div>
                </td>
                <td>
                  <strong>{query.title}</strong>
                  <div className="subtle">{query.queryId}</div>
                </td>
                <td>{query.category}</td>
                <td><PriorityBadge priority={query.priority} /></td>
                <td><StatusBadge status={query.effectiveStatus || query.status} /></td>
                <td>{formatDate(query.updatedAt)}</td>
                <td>
                  <span className="meta-with-icon"><CalendarClock size={14} /> {formatDate(query.dueDate)}</span>
                </td>
                <td>
                  <Link className="btn btn-secondary btn-sm" to={`/queries/${query._id}`}>
                    <Eye size={16} /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-only card-grid">
        {queries.map((query) => <QueryCard key={query._id} query={query} />)}
      </div>
    </>
  );
};
