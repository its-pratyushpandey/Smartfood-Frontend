import { LayoutDashboard, PackageSearch, Settings, FilePlus2, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/suppliers", label: "Suppliers", icon: PackageSearch },
  { to: "/queries", label: "Queries", icon: FilePlus2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = ({ open, onClose, onToggle }) => (
  <>
    <button className="mobile-nav-toggle" type="button" onClick={onToggle} aria-label={open ? "Close navigation" : "Open navigation"}>
      {open ? <X size={18} /> : <Menu size={18} />}
    </button>
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand-row">
        <div className="brand-mark">SF</div>
        <div>
          <strong>Smartfood</strong>
          <span>Supplier Query Management</span>
        </div>
      </div>
      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={onClose}>
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <p>QA managers can prioritize overdue and critical supplier issues at a glance.</p>
      </div>
    </aside>
    {open ? <button type="button" className="sidebar-backdrop" aria-label="Close navigation overlay" onClick={onClose} /> : null}
  </>
);
