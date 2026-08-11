import { AlertTriangle, CheckCircle2, Clock3, CircleDot } from "lucide-react";

const badgeClass = (tone) => `badge badge-${tone}`;

export const StatusBadge = ({ status }) => {
  const tone = {
    Pending: "amber",
    "In Progress": "blue",
    Resolved: "green",
    Overdue: "red",
  }[status] || "slate";

  const Icon = {
    Pending: Clock3,
    "In Progress": CircleDot,
    Resolved: CheckCircle2,
    Overdue: AlertTriangle,
  }[status] || CircleDot;

  return (
    <span className={badgeClass(tone)} aria-label={`Status: ${status}`}>
      <Icon size={14} />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const tone = {
    Low: "slate",
    Medium: "amber",
    High: "orange",
    Critical: "red",
  }[priority] || "slate";

  return <span className={badgeClass(tone)} aria-label={`Priority: ${priority}`}>{priority}</span>;
};
