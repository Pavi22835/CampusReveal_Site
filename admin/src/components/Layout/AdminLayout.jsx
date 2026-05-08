import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard,
  GraduationCap,
  Star,
  Users,
  PlusCircle,
  Menu,
  LogOut,
  Settings,
  MessageCircle
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/universities', name: 'Universities', icon: GraduationCap, badge: 'Manage' },
    { path: '/admin/add-university', name: 'Add University', icon: PlusCircle },
    { path: '/admin/reviews', name: 'Reviews', icon: Star },
    { path: '/admin/users', name: 'Users', icon: Users },
    { path: '/admin/discussions', name: 'Discussions', icon: MessageCircle },
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${!sidebarOpen ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <GraduationCap size={32} />
            {sidebarOpen && <span>CampusReveal</span>}
          </div>
          {/* Only show sidebar toggle on desktop */}
          <button 
            className="sidebar-toggle desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
              {sidebarOpen && item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin/settings" className="nav-item">
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
          <button onClick={handleLogout} className="nav-item logout">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header - Mobile menu button only */}
        <header className="admin-header">
          {/* Mobile menu button - only visible on mobile */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
          
          <div className="header-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
              {sidebarOpen && (
                <div className="user-details">
                  <span className="user-name">{user?.name || 'Admin'}</span>
                  <span className="user-role">Administrator</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;