import React, { useState } from 'react';
import { AlarmClock, Activity, Utensils, Menu, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PositiveAffirmation } from './PositiveAffirmation';

const menuItems = [
  { path: '/life-track', icon: AlarmClock, label: 'Life Track' },
  { path: '/olahraga-track', icon: Activity, label: 'Olahraga Track' },
  { path: '/ocd-systems', icon: Utensils, label: 'OCD Systems' },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileAffirmation, setShowMobileAffirmation] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-gray-800 md:hidden z-40 transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex flex-col">
          {/* Mobile Affirmation Toggle */}
          <div className="px-4 pt-2">
            <button
              onClick={() => setShowMobileAffirmation(!showMobileAffirmation)}
              className="flex items-center justify-between w-full text-gray-300 p-2 rounded-lg"
            >
              <span className="text-sm">Daily Affirmation</span>
              {showMobileAffirmation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <div className={`transition-all duration-300 ${showMobileAffirmation ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <PositiveAffirmation />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex justify-around items-center p-4 bg-gray-800">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex flex-col items-center space-y-1 ${
                    isActive ? 'text-blue-400' : 'text-gray-300'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-800 min-h-screen p-4">
        <div className="text-white text-xl font-bold mb-8 p-2">
          Lifestyle Monitor
        </div>
        <nav className="flex-1">
          {menuItems.map((item) => {
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
        </nav>
        
        {/* Desktop Affirmation - Always visible */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <PositiveAffirmation />
        </div>
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