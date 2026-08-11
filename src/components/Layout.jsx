import { useState } from "react";
import { Sidebar } from "./Sidebar.jsx";

export const Layout = ({ header, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen((current) => !current)} />
      <main className="app-main">
        {header}
        {children}
      </main>
    </div>
  );
};
