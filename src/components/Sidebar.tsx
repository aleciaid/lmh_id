import React, { useState, useEffect } from 'react';
import { AlarmClock, Activity, Utensils, Menu, X, LogOut, Settings, LogIn, History } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PositiveAffirmation } from './PositiveAffirmation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const menuItems = [
  { path: '/life-track', icon: AlarmClock, label: 'Life Track' },
  { path: '/olahraga-track', icon: Activity, label: 'Olahraga Track' },
  { path: '/ocd-systems', icon: Utensils, label: 'OCD Systems' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const [hasNewChangelog, setHasNewChangelog] = useState(false);
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState(() => {
    return localStorage.getItem('lastViewedChangelog') || '0';
  });

  useEffect(() => {
    checkNewChangelogs();
    
    if (location.pathname === '/changelog') {
      const now = new Date().toISOString();
      localStorage.setItem('lastViewedChangelog', now);
      setLastViewedTimestamp(now);
      setHasNewChangelog(false);
    }
  }, [location.pathname]);

  async function checkNewChangelogs() {
    try {
      const { data, error } = await supabase
        .from('changelogs')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latestChangelog = new Date(data[0].created_at);
        const lastViewed = new Date(lastViewedTimestamp);
        setHasNewChangelog(latestChangelog > lastViewed);
      }
    } catch (error) {
      console.error('Error checking changelogs:', error);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const allMenuItems = [...menuItems];
  if (userRole === 'admin') {
    allMenuItems.push({ path: '/admin/console', icon: Settings, label: 'Console' });
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 md:hidden z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 mt-12"> {/* Added mt-12 for spacing below menu button */}
            <h1 className="text-xl font-bold text-white mb-6">Lifestyle Monitor</h1>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {allMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/changelog"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors relative ${
                location.pathname === '/changelog'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <History size={20} />
              <span>Changelog</span>
              {hasNewChangelog && (
                <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Link>
          </nav>

          {user && (
            <div className="px-4 py-2">
              <PositiveAffirmation />
            </div>
          )}

          <div className="p-4 border-t border-gray-700">
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 w-full"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700"
              >
                <LogIn size={20} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-800 min-h-screen p-4">
        <div className="text-white text-xl font-bold mb-8 p-2">
          Lifestyle Monitor
        </div>
        <nav className="flex-1">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/changelog"
            className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors relative ${
              location.pathname === '/changelog'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <History size={20} />
            <span>Changelog</span>
            {hasNewChangelog && (
              <span className="absolute top-3 left-7 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 p-3 rounded-lg mb-2 text-gray-300 hover:bg-gray-700 w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center space-x-3 p-3 rounded-lg mb-2 text-gray-300 hover:bg-gray-700"
            >
              <LogIn size={20} />
              <span>Login</span>
            </Link>
          )}
        </nav>
        
        {user && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <PositiveAffirmation />
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}