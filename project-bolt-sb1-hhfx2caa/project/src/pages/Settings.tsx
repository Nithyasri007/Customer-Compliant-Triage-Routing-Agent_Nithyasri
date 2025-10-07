import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { Bell, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your dashboard preferences</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure how you receive alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Email Notifications', description: 'Receive updates via email', checked: true },
            { label: 'Push Notifications', description: 'Browser push notifications', checked: false },
            { label: 'SLA Alerts', description: 'Get notified when SLA deadlines approach', checked: true },
            { label: 'Daily Summary', description: 'Receive daily complaint summary', checked: true }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
              </label>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage security and privacy settings</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Two-Factor Authentication', description: 'Add an extra layer of security', checked: false },
            { label: 'Session Timeout', description: 'Auto-logout after 30 minutes of inactivity', checked: true },
            { label: 'Data Encryption', description: 'Encrypt sensitive complaint data', checked: true }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600"></div>
              </label>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Configuration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Adjust AI triage settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Auto-Assignment Threshold
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Minimum confidence level for automatic team assignment
            </p>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="75"
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span>0%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Sentiment Analysis
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Enable AI-powered sentiment detection
            </p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={true} />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-purple-600"></div>
            </label>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
