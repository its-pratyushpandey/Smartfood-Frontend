import { Bell, Search, Check, LogOut, ShieldCheck, Clock3, AlertTriangle, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export const Header = ({ title, subtitle, searchPlaceholder = "Search", searchParam = "search" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(new URLSearchParams(location.search).get(searchParam) || "");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const notifications = [
    {
      title: "3 overdue queries need review",
      description: "Open the overdue list and resolve the highest risk items first.",
      icon: AlertTriangle,
      to: "/queries?status=Overdue",
    },
    {
      title: "2 pending supplier responses",
      description: "Pending responses are waiting in the query queue.",
      icon: Clock3,
      to: "/queries?status=Pending",
    },
    {
      title: "Latest query activity is ready",
      description: "Review the newest supplier response and internal note updates.",
      icon: FileText,
      to: "/queries?sortBy=updatedAt&order=desc",
    },
  ];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    if (value.trim()) params.set(searchParam, value.trim());
    else params.delete(searchParam);
    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" });
  };

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Smartfood</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      <form className="header-search" onSubmit={submit}>
        <Search size={16} />
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
      </form>
      <div className="header-actions">
        <div className="notification-popover" ref={notificationsRef}>
          <button
            className="icon-button"
            type="button"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setProfileOpen(false);
            }}
          >
            <Bell size={18} />
            <span className="notification-dot" aria-hidden="true" />
          </button>

          {notificationsOpen ? (
            <div className="notification-menu" role="menu" aria-label="Notifications">
              <div className="notification-menu__header">
                <strong>Notifications</strong>
                <span>Quick actions for active work</span>
              </div>

              <div className="notification-menu__list">
                {notifications.map((notification) => {
                  const Icon = notification.icon;

                  return (
                    <button
                      key={notification.title}
                      className="notification-menu__item"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate(notification.to);
                      }}
                    >
                      <span className="notification-menu__icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <span className="notification-menu__copy">
                        <strong>{notification.title}</strong>
                        <span>{notification.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="profile-popover" ref={profileRef}>
          <button
            className="profile-chip"
            type="button"
            aria-label="Open QA Manager profile"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((current) => !current);
              setNotificationsOpen(false);
            }}
          >
            <span className="profile-avatar" aria-hidden="true">
              QM
            </span>
            <span className="profile-chip__text">
              <strong>QA Manager</strong>
              <span>Active profile</span>
            </span>
          </button>

          {profileOpen ? (
            <div className="profile-menu" role="menu" aria-label="QA Manager profile options">
              <div className="profile-menu__header">
                <div className="profile-avatar profile-avatar--large" aria-hidden="true">
                  QM
                </div>
                <div>
                  <strong>QA Manager</strong>
                  <span>qa.manager@smartfood.com</span>
                </div>
              </div>

              <button className="profile-menu__item profile-menu__item--selected" type="button" role="menuitem" aria-label="Current profile QA Manager" onClick={() => { setProfileOpen(false); navigate("/"); }}>
                <Check size={16} />
                <div>
                  <strong>QA Manager</strong>
                  <span>Current workspace profile</span>
                </div>
              </button>

              <button className="profile-menu__item" type="button" role="menuitem" aria-label="Food-safety admin settings" onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                <ShieldCheck size={16} />
                <div>
                  <strong>Food-safety admin</strong>
                  <span>Supplier queries, workflow, and preferences</span>
                </div>
              </button>

              <button className="profile-menu__item profile-menu__item--button" type="button" onClick={() => setProfileOpen(false)}>
                <LogOut size={16} />
                <div>
                  <strong>Close profile</strong>
                  <span>Dismiss this profile card</span>
                </div>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
