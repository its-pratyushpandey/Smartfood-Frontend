import { Inbox } from "lucide-react";

export const EmptyState = ({ title, description, action }) => (
  <div className="state state-empty">
    <Inbox size={32} />
    <h3>{title}</h3>
    <p>{description}</p>
    {action}
  </div>
);
