import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Zap, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { PriorityBadge } from '../components/PriorityBadge';
import { complaints, activityEvents, teams } from '../utils/mockData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const complaintsToday = complaints.filter(c => {
    const complaintDate = new Date(c.timestamp);
    complaintDate.setHours(0, 0, 0, 0);
    return complaintDate.getTime() === today.getTime();
  });

  const pendingComplaints = complaints.filter(c => c.status === 'new' || c.status === 'in_progress');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

  const avgResponseTime = 18;
  const slaCompliance = Math.round((resolvedComplaints.length / complaints.length) * 100);

  const priorityData = [
    { name: 'Urgent', value: complaints.filter(c => c.priority === 'urgent').length, color: '#EF4444' },
    { name: 'High', value: complaints.filter(c => c.priority === 'high').length, color: '#F97316' },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: complaints.filter(c => c.priority === 'low').length, color: '#10B981' }
  ];

  const categoryData = [
    { name: 'Billing', value: complaints.filter(c => c.category === 'billing').length, icon: '💰' },
    { name: 'Technical', value: complaints.filter(c => c.category === 'technical').length, icon: '🔧' },
    { name: 'Delivery', value: complaints.filter(c => c.category === 'delivery').length, icon: '📦' },
    { name: 'Refund', value: complaints.filter(c => c.category === 'refund').length, icon: '💳' },
    { name: 'Care', value: complaints.filter(c => c.category === 'customer_care').length, icon: '❤️' },
    { name: 'Product', value: complaints.filter(c => c.category === 'product').length, icon: '📱' }
  ].sort((a, b) => b.value - a.value);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const trendData = last7Days.map(date => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayComplaints = complaints.filter(c => {
      const cDate = new Date(c.timestamp);
      return cDate.toDateString() === date.toDateString();
    });

    return {
      date: dateStr,
      urgent: dayComplaints.filter(c => c.priority === 'urgent').length,
      high: dayComplaints.filter(c => c.priority === 'high').length,
      medium: dayComplaints.filter(c => c.priority === 'medium').length,
      low: dayComplaints.filter(c => c.priority === 'low').length,
      total: dayComplaints.length
    };
  });

  const recentComplaints = complaints.slice(0, 10);
  const recentActivity = activityEvents.slice(0, 10);

  const [displayedActivity, setDisplayedActivity] = useState(recentActivity.slice(0, 5));

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedActivity(prev => {
        const newIndex = (recentActivity.indexOf(prev[prev.length - 1]) + 1) % recentActivity.length;
        return [...prev.slice(1), recentActivity[newIndex]];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'angry': return '😡';
      case 'frustrated': return '😟';
      case 'neutral': return '😐';
      case 'satisfied': return '😊';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard delay={0} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Complaints Today</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <AnimatedCounter value={complaintsToday.length} />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">12% vs yesterday</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.1} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending Complaints</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <AnimatedCounter value={pendingComplaints.length} />
              </div>
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Needs attention</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/50 relative">
              <Clock className="w-6 h-6 text-white" />
              {pendingComplaints.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Response Time</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <AnimatedCounter value={avgResponseTime} suffix="m" />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Under target</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.3} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">SLA Compliance</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <AnimatedCounter value={slaCompliance} suffix="%" />
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${slaCompliance}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${slaCompliance >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' : slaCompliance >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                />
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/50">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {priorityData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaints by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[0, 8, 8, 0]} animationDuration={1000} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaints Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotal)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Complaints</h3>
              <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full">
                {pendingComplaints.length} New
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-white/10 dark:bg-slate-800/30 rounded-xl p-3 border border-white/20 dark:border-slate-700/50 cursor-pointer transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {complaint.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{complaint.customerName}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTime(complaint.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{complaint.subject}</p>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={complaint.priority} size="sm" glow />
                        <span className="text-lg">{getSentimentEmoji(complaint.sentiment)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Activity</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {displayedActivity.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="text-lg">{event.icon}</span>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{event.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRelativeTime(event.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h3>
            <div className="space-y-4">
              {teams.slice(0, 3).map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-2xl">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{team.avgResponseTime}m avg response</p>
                  </div>
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">{team.resolutionRate}%</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
