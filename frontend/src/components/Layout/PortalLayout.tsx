import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { WalletCards, Receipt, User, LogOut, Menu, X, Home, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark"><span /></div>
      <strong>unio</strong>
    </div>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/user/portal', label: 'Home', icon: Home },
    { path: '/user/portal/products', label: 'Products', icon: Package },
    { path: '/user/portal/subscriptions', label: 'My Subscriptions', icon: WalletCards },
    { path: '/user/portal/invoices', label: 'My Invoices', icon: Receipt },
    { path: '/user/portal/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <div className="sidebar-logo">
        <Logo />
        {onClose && (
          <button className="sidebar-close-btn btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        )}
      </div>
      <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
          Customer Portal
        </div>
        {user && (
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user.name}
          </div>
        )}
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/user/portal'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={17} className="nav-item-icon" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" style={{ width: '100%', textAlign: 'left' }} onClick={handleLogout}>
          <LogOut size={17} />
          Sign out
        </button>
        {user && (
          <div className="sidebar-user">
            <div className="avatar avatar-sm avatar-green">
              {user.avatarInitials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">Customer</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface PortalLayoutProps {
  children: ReactNode;
  title: string;
}

export default function PortalLayout({ children, title }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="main-content">
        <header className="topbar">
          <button
            className="topbar-menu-btn btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            {user && (
              <div className="topbar-user">
                <div className="avatar avatar-sm avatar-green">
                  {user.avatarInitials}
                </div>
                <span className="topbar-user-name">{user.name}</span>
              </div>
            )}
            <button className="topbar-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

