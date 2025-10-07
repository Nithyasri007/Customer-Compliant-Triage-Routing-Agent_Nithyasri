import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { complaints as mockComplaints } from '../utils/mockData';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Priority, Status, Category } from '../types';
import { apiService } from '../services/api';

export const ComplaintsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority[]>([]);
  const [filterCategory] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [allComplaints, setAllComplaints] = useState(mockComplaints);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch complaints from API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const complaints = await apiService.getComplaints();
        setAllComplaints(complaints);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
        setError('Failed to load complaints');
        // Keep using mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesSearch =
      complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesPriority = filterPriority.length === 0 || filterPriority.includes(complaint.priority);
    const matchesCategory = filterCategory.length === 0 || filterCategory.includes(complaint.category);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const togglePriority = (priority: Priority) => {
    setFilterPriority(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

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

  const getCategoryIcon = (category: Category) => {
    const icons = {
      billing: '💰',
      technical: '🔧',
      delivery: '📦',
      refund: '💳',
      customer_care: '❤️',
      product: '📱',
      account: '👤'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Complaints</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, subject, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700/50 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/25 transition-all duration-300 text-gray-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <div className="flex gap-2">
                {(['all', 'new', 'in_progress', 'resolved', 'escalated'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                      ${filterStatus === status
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-white/20 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-800/70'
                      }
                    `}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
              <div className="flex gap-2">
                {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => togglePriority(priority)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                      ${filterPriority.includes(priority)
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/50'
                        : 'bg-white/20 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-800/70'
                      }
                    `}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {paginatedComplaints.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.005 }}
              onClick={() => navigate(`/complaints/${complaint.id}`)}
              className="backdrop-blur-xl bg-white/10 dark:bg-slate-800/30 rounded-xl p-4 border border-white/20 dark:border-slate-700/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID</p>
                  <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{complaint.id}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRelativeTime(complaint.timestamp)}</p>
                </div>

                <div className="col-span-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {complaint.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{complaint.customerEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{complaint.subject}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xl">{getCategoryIcon(complaint.category)}</span>
                  </div>
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                  <PriorityBadge priority={complaint.priority} size="sm" glow />
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sentiment</p>
                  <span className="text-2xl">{getSentimentEmoji(complaint.sentiment)}</span>
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <StatusBadge status={complaint.status} size="sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/20 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(page)}
                className={`
                  w-10 h-10 rounded-lg font-medium transition-all duration-300
                  ${currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/20 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-800/70'
                  }
                `}
              >
                {page}
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/20 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
