import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  LogOut, 
  Settings, 
  UserCircle, 
  HelpCircle, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && showMobileMenu) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  // Function to scroll to University Explorer section
  const scrollToUniversityExplorer = (e) => {
    e.preventDefault();
    setShowMobileMenu(false);
    // Check if we're on home page
    if (window.location.pathname === '/') {
      const element = document.getElementById('university-explorer');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home first, then scroll after component mounts
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('university-explorer');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] h-16 transition-all duration-300 border-b ${
      isScrolled 
        ? 'bg-slate-900/95 backdrop-blur-md border-slate-700/50 shadow-lg' 
        : 'bg-slate-900 border-transparent shadow-none'
    }`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        
        {/* LEFT: Hamburger Menu (Mobile only) */}
        <button
          type="button"
          className="lg:hidden text-slate-300 hover:text-indigo-400 transition-colors p-2 -ml-2"
          onClick={() => setShowMobileMenu(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={showMobileMenu}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* CENTER/LEFT: Logo */}
        <div 
          className="flex items-center cursor-pointer lg:ml-0"
          onClick={() => navigate('/')}
        >
          <span className="text-2xl font-display font-bold tracking-tight text-white">
            Campus<span className="text-indigo-400">Reveal</span>
          </span>
        </div>

        {/* DESKTOP NAVIGATION - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-8">
          <button 
            onClick={scrollToUniversityExplorer}
            className="text-[13px] font-bold text-slate-300 hover:text-indigo-400 transition-colors tracking-tight"
          >
            Colleges
          </button>
          <Link 
            to="/reviews" 
            className="text-[13px] font-bold text-slate-300 hover:text-indigo-400 transition-colors tracking-tight"
          >
            Explore
          </Link>
          <Link 
            to="/community" 
            className="text-[13px] font-bold text-slate-300 hover:text-indigo-400 transition-colors tracking-tight"
          >
            Community
          </Link>
        </div>

        {/* RIGHT: Actions (Search, Auth, etc.) */}
        <div className="flex items-center gap-3">
          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-72 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{user?.name || 'User'}</h4>
                          <p className="text-xs text-slate-400">{user?.email || 'user@campusreveal.com'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        <UserCircle size={18} className="text-indigo-400" />
                        <span className="font-medium">My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        <Settings size={18} className="text-indigo-400" />
                        <span className="font-medium">Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/help');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        <HelpCircle size={18} className="text-indigo-400" />
                        <span className="font-medium">Help & Support</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-700"></div>

                    {/* Logout Button */}
                    <div className="p-4">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/20 text-rose-400 rounded-xl font-bold text-sm hover:bg-rose-500/30 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Logged Out: Show Login and Sign Up buttons
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 border border-indigo-500/50 text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-500/10 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay - Full screen slide from left */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-[105] lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-slate-900 z-[110] shadow-2xl lg:hidden flex flex-col"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    navigate('/');
                    setShowMobileMenu(false);
                  }}
                >
                  <span className="text-xl font-bold text-white">
                    Campus<span className="text-indigo-400">Reveal</span>
                  </span>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Mobile Menu Navigation Links */}
              <div className="flex-1 py-6 px-5 space-y-1">
                <button
                  onClick={scrollToUniversityExplorer}
                  className="w-full text-left px-4 py-3 text-base font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span>🏛️</span>
                  Colleges
                </button>
                <Link
                  to="/compare"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 text-base font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span>⚖️</span>
                  Compare
                </Link>
                <Link
                  to="/community"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 text-base font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-3"
                >
                  <span>💬</span>
                  Community
                </Link>

                <div className="my-4 border-t border-slate-800"></div>

                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-3 text-base font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-3"
                    >
                      <UserCircle size={18} className="text-indigo-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-4 py-3 text-base font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-3"
                    >
                      <Settings size={18} className="text-indigo-400" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate('/help');
                      }}
                      className="w-full text-left px-4 py-3 text-base font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-3"
                    >
                      <HelpCircle size={18} className="text-indigo-400" />
                      Help & Support
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-base font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-3 mt-4"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate('/login');
                      }}
                      className="w-full px-4 py-3 border border-indigo-500/50 text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-500/10 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate('/register');
                      }}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-5 border-t border-slate-800">
                <p className="text-xs text-slate-500 text-center">
                  © 2024 CampusReveal. All rights reserved.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}