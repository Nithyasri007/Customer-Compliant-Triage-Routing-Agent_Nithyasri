import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, FileText, Users, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems: Array<{ path: string; icon: any; label: string }> = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/submit', icon: PlusCircle, label: 'Submit' },
  { path: '/complaints', icon: FileText, label: 'Complaints' },
  { path: '/teams', icon: Users, label: 'Teams' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export const Sidebar: React.FC = () => {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 backdrop-blur-xl bg-white/10 dark:bg-slate-900/70 border-r border-white/20 dark:border-slate-700/50 p-6 z-40"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          ComplaintAI
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Triage Dashboard</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
              ${isActive
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20 border-l-4 border-blue-500'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-slate-800/50 hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/20 dark:border-slate-700/50">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">AI-Powered Triage</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">All Systems Operational</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
