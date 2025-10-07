import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { complaints } from '../utils/mockData';
import { TrendingUp, Clock, Target, Star } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { motion } from 'framer-motion';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const resolutionRate = Math.round((resolvedComplaints / totalComplaints) * 100);
  const avgResolutionTime = 18;
  const customerSatisfaction = 4.2;

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

  const categoryData = [
    { name: 'Billing', value: complaints.filter(c => c.category === 'billing').length, color: '#3B82F6' },
    { name: 'Technical', value: complaints.filter(c => c.category === 'technical').length, color: '#8B5CF6' },
    { name: 'Delivery', value: complaints.filter(c => c.category === 'delivery').length, color: '#F97316' },
    { name: 'Refund', value: complaints.filter(c => c.category === 'refund').length, color: '#10B981' },
    { name: 'Care', value: complaints.filter(c => c.category === 'customer_care').length, color: '#EC4899' }
  ];

  const sentimentData = [
    { name: 'Angry', value: complaints.filter(c => c.sentiment === 'angry').length, color: '#EF4444' },
    { name: 'Frustrated', value: complaints.filter(c => c.sentiment === 'frustrated').length, color: '#F97316' },
    { name: 'Neutral', value: complaints.filter(c => c.sentiment === 'neutral').length, color: '#3B82F6' },
    { name: 'Satisfied', value: complaints.filter(c => c.sentiment === 'satisfied').length, color: '#10B981' }
  ];

  const responseTimeData = [
    { range: '0-5m', count: 25 },
    { range: '5-15m', count: 45 },
    { range: '15-30m', count: 30 },
    { range: '30-60m', count: 15 },
    { range: '60m+', count: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Comprehensive overview of complaint metrics</p>
        </div>

        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300
                ${timeRange === range
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white/20 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-800/70'
                }
              `}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard delay={0} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Complaints</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={totalComplaints} />
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.slice(-7)}>
                <defs>
                  <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="url(#sparkGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.1} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Resolution Rate</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={resolutionRate} suffix="%" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/50">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${resolutionRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
            />
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Resolution Time</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                <AnimatedCounter value={avgResolutionTime} suffix="m" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">15% faster than last week</p>
        </GlassCard>

        <GlassCard delay={0.3} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Customer Satisfaction</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AnimatedCounter value={customerSatisfaction} decimals={1} />
                <span className="text-lg">/5</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.round(customerSatisfaction) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaints Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
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
              <Legend />
              <Area type="monotone" dataKey="urgent" stackId="1" stroke="#EF4444" fill="url(#colorUrgent)" />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#F97316" fill="url(#colorHigh)" />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#F59E0B" fill="url(#colorMedium)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1000}
              >
                {categoryData.map((entry, index) => (
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
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData}>
              <XAxis dataKey="range" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} animationDuration={1000} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                animationDuration={1000}
              >
                {sentimentData.map((entry, index) => (
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
        </GlassCard>
      </div>
    </div>
  );
};
