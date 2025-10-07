import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { complaints, teams } from '../utils/mockData';
import { ArrowLeft, Mail, Calendar, Clock, RefreshCw, Flag, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const complaint = complaints.find(c => c.id === id);

  if (!complaint) {
    return (
      <div className="flex items-center justify-center h-96">
        <GlassCard className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Complaint Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The complaint you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/complaints')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/50"
          >
            Back to Complaints
          </button>
        </GlassCard>
      </div>
    );
  }

  const team = teams.find(t => t.id === complaint.teamId);
  const assignedMember = team?.members.find(m => m.id === complaint.assignedTo);

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'angry': return '😡';
      case 'frustrated': return '😟';
      case 'neutral': return '😐';
      case 'satisfied': return '😊';
      default: return '😐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'angry': return 'text-red-500';
      case 'frustrated': return 'text-orange-500';
      case 'neutral': return 'text-blue-500';
      case 'satisfied': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const timeRemaining = Math.max(0, Math.floor((complaint.slaDeadline.getTime() - new Date().getTime()) / (1000 * 60)));
  const totalSlaTime = 24 * 60;
  const slaProgress = ((totalSlaTime - timeRemaining) / totalSlaTime) * 100;
  const slaColor = timeRemaining > 360 ? 'green' : timeRemaining > 120 ? 'yellow' : 'red';

  return (
    <div className="space-y-6">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => navigate('/complaints')}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Complaints</span>
      </motion.button>

      <GlassCard className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              {complaint.subject}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">ID: {complaint.id}</span>
              <StatusBadge status={complaint.status} size="lg" />
              <PriorityBadge priority={complaint.priority} size="lg" glow />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Details</h3>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {complaint.customerName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{complaint.customerName}</h4>
                <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{complaint.customerEmail}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Received</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {complaint.timestamp.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Last Updated</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {complaint.updatedAt.toLocaleString()}
                </p>
              </div>
            </div>

            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Complaint Description</h4>
            <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.description}</p>
            </div>

            {complaint.entities && Object.keys(complaint.entities).length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Extracted Information</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(complaint.entities).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {[
                { icon: '📥', text: 'Complaint received', time: complaint.timestamp, color: 'blue' },
                { icon: '🤖', text: 'AI classified as ' + complaint.category, time: new Date(complaint.timestamp.getTime() + 30000), color: 'purple' },
                { icon: '👤', text: `Assigned to ${team?.name}`, time: new Date(complaint.timestamp.getTime() + 60000), color: 'green' },
                ...(complaint.status !== 'new' ? [{ icon: '🔄', text: 'Status changed to ' + complaint.status.replace('_', ' '), time: complaint.updatedAt, color: 'orange' }] : [])
              ].map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shrink-0">
                    {event.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.time.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                AI Analysis
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Category</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{complaint.category}</p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${complaint.aiConfidence}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{Math.round(complaint.aiConfidence)}% confidence</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sentiment</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getSentimentEmoji(complaint.sentiment)}</span>
                  <p className={`text-lg font-bold capitalize ${getSentimentColor(complaint.sentiment)}`}>
                    {complaint.sentiment}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">AI Summary</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic border-l-2 border-green-500 pl-3">
                  Customer experiencing issues with {complaint.category}. Priority level assessed as {complaint.priority}.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Routing Information</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Assigned Team</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{team?.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{team?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{team?.email}</p>
                  </div>
                </div>
              </div>

              {assignedMember && (
                <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Assigned To</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {assignedMember.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{assignedMember.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{assignedMember.role}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-white/10 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">SLA Tracking</p>
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 dark:text-gray-700 stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                      />
                      <circle
                        className={`${slaColor === 'green' ? 'text-green-500' : slaColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'} stroke-current transition-all duration-500`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        strokeDasharray={`${slaProgress * 2.51} 251.2`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor(timeRemaining / 60)}h</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{timeRemaining % 60}m</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className={`text-sm text-center font-medium ${slaColor === 'green' ? 'text-green-600' : slaColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {timeRemaining > 0 ? 'Time Remaining' : 'SLA Breached'}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Re-classify
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg shadow-orange-500/50 flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Change Priority
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Reassign
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
