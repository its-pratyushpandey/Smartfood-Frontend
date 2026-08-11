export const formatDate = (value, options = {}) => {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const isOverdue = (query) => query?.effectiveStatus === "Overdue" || (query?.status !== "Resolved" && new Date(query?.dueDate).getTime() < Date.now());
