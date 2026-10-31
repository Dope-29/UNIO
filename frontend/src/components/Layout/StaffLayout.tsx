import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, WalletCards, Receipt, CreditCard,
  TrendingUp, LogOut, Menu, X, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Staff sidebar does NOT include: Products, Plans, Taxes, Discounts, Staff
const navSections: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { path: '/user/staff', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/user/staff/customers', label: 'Customers', icon: Users },
      { path: '/user/staff/subscriptions', label: 'Subscriptions', icon: WalletCards },
      { path: '/user/staff/invoices', label: 'Invoices', icon: Receipt, badge: 2 },
      { path: '/user/staff/payments', label: 'Payments', icon: CreditCard },
      { path: '/user/staff/overdue', label: 'Overdue', icon: AlertCircle },
      { path: '/user/staff/reports', label: 'Reports', icon: TrendingUp },
    ],
  },
];

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
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div className="nav-section" key={section.label}>
            <span className="nav-section-label">{section.label}</span>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/user/staff'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <item.icon size={17} className="nav-item-icon" />
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" style={{ width: '100%', textAlign: 'left' }} onClick={handleLogout}>
          <LogOut size={17} />
          Sign out
        </button>
        {user && (
          <div className="sidebar-user">
            <div className="avatar avatar-sm avatar-blue">
              {user.avatarInitials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">Staff Member</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface StaffLayoutProps {
  children: ReactNode;
  title: string;
}

export default function StaffLayout({ children, title }: StaffLayoutProps) {
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
                <div className="avatar avatar-sm avatar-blue">
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

