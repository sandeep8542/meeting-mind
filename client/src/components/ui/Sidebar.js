import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, LayoutDashboard, CheckSquare, LogOut, Plus, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CheckSquare, label: 'Actions', path: '/actions' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo} onClick={() => navigate('/dashboard')}>
        <div className={styles.logoIcon}><Mic size={16} /></div>
        <span className={styles.logoText}>MeetingMind</span>
      </div>

      {/* New Meeting CTA */}
      <button className={styles.newBtn} onClick={() => navigate('/meeting/new')}>
        <Plus size={16} />
        <span>New Meeting</span>
      </button>

      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
              onClick={() => navigate(item.path)}
            >
              {active && (
                <motion.div
                  className={styles.navActiveBg}
                  layoutId="activeNav"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
