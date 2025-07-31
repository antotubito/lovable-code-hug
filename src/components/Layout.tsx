import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Link as LinkIcon, LogOut, Users, Settings, Home, UserCircle2, Bell, QrCode, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './auth/AuthProvider';
import { logout } from '../lib/auth';
import { NotificationDropdown } from './notifications/NotificationDropdown';
import { Footer } from './Footer';
import { supabase } from '../lib/supabase';
import { QRModal } from './qr/QRModal';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideNav, setHideNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Don't show navigation on login, register, onboarding, or verification pages
  const hideNavigation = location.pathname === '/app/login' || 
                        location.pathname === '/app/register' ||
                        location.pathname === '/app/onboarding' ||
                        location.pathname.startsWith('/verify');

  // Check authentication status directly
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session && !user) {
        await refreshUser();
      }
    };
    
    checkAuth();
  }, [user, refreshUser]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHideNav(currentScrollY > lastScrollY && currentScrollY > 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  async function handleLogout() {
    try {
      await logout();
      setIsAuthenticated(false);
      navigate('/waitlist');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadNotifications(0);
  };

  // Page title mapping
  const pageTitleMap = {
    '': 'Home',
    contacts: 'Contacts',
    profile: 'Your Profile',
    settings: 'Settings',
    login: 'Sign In',
    onboarding: 'Welcome to Dislink'
  };

  const currentPage = location.pathname.split('/')[2];
  const pageTitle = pageTitleMap[currentPage];

  // If it's a page without navigation, only render the content
  if (hideNavigation) {
    return <Outlet />;
  }

  // Determine if we should show authenticated UI
  const showAuthenticatedUI = user || isAuthenticated;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <motion.nav
        initial={false}
        animate={{ y: hideNav ? -100 : 0 }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/app" className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-1.5">
                  <LinkIcon className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Dislink</span>
              </Link>
              {pageTitle && (
                <h1 className="ml-6 text-xl font-semibold text-gray-900">{pageTitle}</h1>
              )}
            </div>

            {showAuthenticatedUI ? (
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <Link
                  to="/app"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    location.pathname === '/app'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <Home className="h-5 w-5 mr-1" />
                  Home
                </Link>
                <Link
                  to="/app/contacts"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    location.pathname === '/app/contacts'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-5 w-5 mr-1" />
                  Contacts
                </Link>
                <Link
                  to="/app/profile"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    location.pathname === '/app/profile'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <UserCircle2 className="h-5 w-5 mr-1" />
                  Profile
                </Link>
                <Link
                  to="/app/settings"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    location.pathname === '/app/settings'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <Settings className="h-5 w-5 mr-1" />
                  Settings
                </Link>

                {/* Test Public Profile Link - For Testing Only */}
                <Link
                  to="/share/test-profile"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:border-b-2 hover:border-amber-300"
                  title="Test Public Profile View"
                >
                  <Globe className="h-5 w-5 mr-1" />
                  Test Public Profile
                </Link>
                {/* Quick Actions */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full relative"
                    title="Show QR Code"
                  >
                    <QrCode className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  </button>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-500 hover:text-gray-700 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>

                  <NotificationDropdown
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onClearAll={handleClearAllNotifications}
                  />
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/app/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/app/register"
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {showAuthenticatedUI && (
              <div className="sm:hidden flex items-center">
                <button
                  onClick={() => setShowMobileNav(!showMobileNav)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <span className="sr-only">Open main menu</span>
                  {showMobileNav ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {showMobileNav && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="sm:hidden fixed inset-x-0 top-16 bg-white shadow-lg z-40"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/app"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/app'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileNav(false)}
              >
                <Home className="h-5 w-5 inline-block mr-2" />
                Home
              </Link>
              <Link
                to="/app/contacts"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/app/contacts'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileNav(false)}
              >
                <Users className="h-5 w-5 inline-block mr-2" />
                Contacts
              </Link>
              <Link
                to="/app/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/app/profile'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileNav(false)}
              >
                <UserCircle2 className="h-5 w-5 inline-block mr-2" />
                Profile
              </Link>
              <Link
                to="/app/settings"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/app/settings'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileNav(false)}
              >
                <Settings className="h-5 w-5 inline-block mr-2" />
                Settings
              </Link>
              
              {/* Quick Actions in Mobile Menu */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={() => {
                    setShowQRModal(true);
                    setShowMobileNav(false);
                  }} 
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <QrCode className="h-5 w-5 inline-block mr-2 text-indigo-600" />
                  Show QR Code
                </button>
              </div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileNav(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5 inline-block mr-2" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      {showAuthenticatedUI && !hideNavigation && (
        <motion.div
          initial={false}
          animate={{ y: hideNav ? 100 : 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50"
        >
          <div className="grid grid-cols-4 h-16">
            <Link
              to="/app"
              className={`flex flex-col items-center justify-center ${
                location.pathname === '/app' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/app/contacts"
              className={`flex flex-col items-center justify-center ${
                location.pathname === '/app/contacts' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Users className="h-6 w-6" />
              <span className="text-xs mt-1">Contacts</span>
            </Link>
            
            {/* QR Code Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="flex flex-col items-center justify-center relative group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center -mt-5 shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
                <QrCode className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              </div>
              <span className="text-xs mt-1 text-gray-600 group-hover:text-indigo-600 transition-colors duration-300">Connect</span>
            </button>
            
            <Link
              to="/app/profile"
              className={`flex flex-col items-center justify-center ${
                location.pathname === '/app/profile' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <UserCircle2 className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className={`pt-20 ${showAuthenticatedUI && !hideNavigation ? 'mb-16 sm:mb-6' : ''} flex-1`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!hideNavigation && <Footer />}
      
      {/* QR Code Modal */}
      {user && (
        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          user={user}
        />
      )}
    </div>
  );
}