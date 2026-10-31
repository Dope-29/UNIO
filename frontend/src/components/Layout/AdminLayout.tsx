import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, WalletCards, Receipt, CreditCard,
  Package, Zap, FileText, Tag, CircleDollarSign, UserCog,
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

const navSections: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { path: '/user/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/user/admin/customers', label: 'Customers', icon: Users },
      { path: '/user/admin/subscriptions', label: 'Subscriptions', icon: WalletCards },
      { path: '/user/admin/invoices', label: 'Invoices', icon: Receipt, badge: 3 },
      { path: '/user/admin/payments', label: 'Payments', icon: CreditCard },
      { path: '/user/admin/overdue', label: 'Overdue', icon: AlertCircle },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { path: '/user/admin/products', label: 'Products', icon: Package },
      { path: '/user/admin/plans', label: 'Plans', icon: Zap },
      { path: '/user/admin/quotation-templates', label: 'Quotation Templates', icon: FileText },
      { path: '/user/admin/discounts', label: 'Discounts', icon: Tag },
      { path: '/user/admin/taxes', label: 'Taxes', icon: CircleDollarSign },
    ],
  },
  {
    label: 'Team',
    items: [
      { path: '/user/admin/staff', label: 'Staff', icon: UserCog },
      { path: '/user/admin/reports', label: 'Reports', icon: TrendingUp },
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

  const getAvatarColor = (initials: string) => {
    const colors = ['avatar-accent', 'avatar-blue', 'avatar-green', 'avatar-orange'];
    return colors[initials.charCodeAt(0) % colors.length];
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
                end={item.path === '/user/admin'}
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
            <div className={`avatar avatar-sm ${getAvatarColor(user.avatarInitials)}`}>
              {user.avatarInitials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
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
              <div className="topbar-user" onClick={handleLogout}>
                <div className={`avatar avatar-sm avatar-accent`}>
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

