import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { teams } from '../utils/mockData';
import { Mail, TrendingUp, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export const Teams: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teams & Routing</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage teams and their complaint routing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard hover className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTeamGradient(team.color)} flex items-center justify-center text-2xl shadow-lg`}>
                    {team.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{team.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{team.members.length} members</p>
                  </div>
                </div>
                {team.activeComplaints > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/50"
                  >
                    {team.activeComplaints} active
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-800/30 rounded-lg p-3 border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Time</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{team.avgResponseTime}m</p>
                </div>

                <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-800/30 rounded-lg p-3 border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rate</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{team.resolutionRate}%</p>
                </div>

                <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-800/30 rounded-lg p-3 border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-purple-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{team.activeComplaints}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Team Members</p>
                <div className="flex -space-x-2">
                  {team.members.slice(0, 5).map((member) => (
                    <motion.div
                      key={member.id}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${getTeamGradient(team.color)} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900 cursor-pointer`}
                      title={member.name}
                    >
                      {member.avatar}
                    </motion.div>
                  ))}
                  {team.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-bold ring-2 ring-white dark:ring-slate-900">
                      +{team.members.length - 5}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Handles Categories</p>
                <div className="flex flex-wrap gap-2">
                  {team.categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-white/20 dark:bg-slate-800/50 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-white/30 dark:border-slate-700/50"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs">{team.email}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Routing Configuration</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20 dark:border-slate-700/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Default Team</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Avg Response Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <motion.tr
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/10 dark:border-slate-700/30 hover:bg-white/5 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {team.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg text-xs font-medium text-gray-900 dark:text-white"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{team.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{team.avgResponseTime} minutes</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${team.resolutionRate}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{team.resolutionRate}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

const getTeamGradient = (color: string) => {
  const gradients: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600'
  };
  return gradients[color] || 'from-gray-500 to-gray-600';
};
