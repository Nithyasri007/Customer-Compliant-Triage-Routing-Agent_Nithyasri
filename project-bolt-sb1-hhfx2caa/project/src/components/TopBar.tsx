import React, { useState } from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const TopBar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'New urgent complaint assigned', time: '2 min ago', unread: true },
    { id: 2, text: 'SLA deadline approaching for CMP00042', time: '15 min ago', unread: true },
    { id: 3, text: 'Team performance report ready', time: '1 hour ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="fixed top-0 left-64 right-0 h-16 backdrop-blur-xl bg-white/10 dark:bg-slate-900/70 border-b border-white/20 dark:border-slate-700/50 px-6 flex items-center justify-between z-30">
      <div className={`flex-1 max-w-2xl transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaints, customers, or teams..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`
              w-full pl-10 pr-4 py-2 rounded-xl
              bg-white/20 dark:bg-slate-800/50
              border-2 transition-all duration-300
              ${searchFocused
                ? 'border-blue-500 shadow-lg shadow-blue-500/25'
                : 'border-white/30 dark:border-slate-700/50'
              }
              text-gray-900 dark:text-white
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              focus:outline-none
            `}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/20 dark:bg-slate-800/50 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-colors duration-300 relative overflow-hidden group"
          title="Toggle dark mode"
        >
          <motion.div
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {isDark ? (
              <Moon className="w-5 h-5 text-yellow-400" />
            ) : (
              <Sun className="w-5 h-5 text-orange-500" />
            )}
          </motion.div>
        </motion.button>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-white/20 dark:bg-slate-800/50 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-colors duration-300 relative"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      className={`p-4 border-b border-gray-200 dark:border-slate-700 last:border-0 cursor-pointer ${notif.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{notif.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-900/50 text-center">
                  <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 pl-3 ml-3 border-l border-gray-300 dark:border-slate-700">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white/50 dark:ring-slate-800/50">
            AU
          </div>
        </div>
      </div>
    </div>
  );
};
