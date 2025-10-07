import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { User, Mail, CreditCard as Edit, MessageSquare, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const channels = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'chat', label: 'Chat', icon: '💬' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'web', label: 'Web Form', icon: '🌐' }
];

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    channel: 'email'
  });

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  useEffect(() => {
    if (formData.description.length > 100 && !isAnalyzing && !aiAnalysis) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const categories = ['billing', 'technical', 'delivery', 'refund', 'customer_care'];
        const priorities = ['urgent', 'high', 'medium', 'low'];
        const sentiments = ['angry', 'frustrated', 'neutral'];

        setAiAnalysis({
          category: categories[Math.floor(Math.random() * categories.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
          confidence: 75 + Math.random() * 20,
          suggestedTeam: 'Technical Support'
        });
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [formData.description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const id = `CMP${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      setComplaintId(id);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'angry': return 'text-red-500';
      case 'frustrated': return 'text-orange-500';
      case 'neutral': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'angry': return '😡';
      case 'frustrated': return '😟';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

  const charLimit = 500;
  const charsLeft = charLimit - formData.description.length;
  const charColor = charsLeft > 100 ? 'text-green-600 dark:text-green-400' : charsLeft > 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
                  Submit New Complaint
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700/50 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/25 transition-all duration-300 text-gray-900 dark:text-white outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700/50 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/25 transition-all duration-300 text-gray-900 dark:text-white outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <div className="relative">
                      <Edit className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700/50 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/25 transition-all duration-300 text-gray-900 dark:text-white outline-none"
                        placeholder="Brief description of your issue"
                        maxLength={100}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Complaint Description
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => {
                          if (e.target.value.length <= charLimit) {
                            setFormData({ ...formData, description: e.target.value });
                          }
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 dark:bg-slate-800/50 border-2 border-white/30 dark:border-slate-700/50 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/25 transition-all duration-300 text-gray-900 dark:text-white outline-none resize-none"
                        rows={6}
                        placeholder="Please describe your issue in detail..."
                      />
                    </div>
                    <div className={`text-sm mt-2 text-right ${charColor} font-medium`}>
                      {charsLeft} characters remaining
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Channel
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {channels.map((channel) => (
                        <button
                          key={channel.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, channel: channel.value })}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-300
                            ${formData.channel === channel.value
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500 shadow-lg shadow-blue-500/25'
                              : 'bg-white/10 dark:bg-slate-800/30 border-white/30 dark:border-slate-700/50 hover:border-blue-400'
                            }
                          `}
                        >
                          <div className="text-2xl mb-2">{channel.icon}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{channel.label}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/75 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Processing...
                      </span>
                    ) : (
                      'Submit Complaint'
                    )}
                  </motion.button>
                </form>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard className="p-6 sticky top-20">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span>🤖</span> AI Analysis
                </h3>

                {formData.description.length < 100 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Type at least 100 characters to see AI analysis...</p>
                    <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((formData.description.length / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Analyzing...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">AI is processing your complaint</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiAnalysis && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Predicted Category</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{aiAnalysis.category}</p>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${aiAnalysis.confidence}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{Math.round(aiAnalysis.confidence)}% confidence</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Predicted Priority</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{aiAnalysis.priority}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sentiment</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSentimentEmoji(aiAnalysis.sentiment)}</span>
                        <p className={`text-lg font-bold capitalize ${getSentimentColor(aiAnalysis.sentiment)}`}>
                          {aiAnalysis.sentiment}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Suggested Team</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{aiAnalysis.suggestedTeam}</p>
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard className="p-12 text-center max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Complaint Submitted Successfully!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your complaint has been received and assigned to the appropriate team.
              </p>

              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Complaint ID</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{complaintId}</p>
                  <button className="p-2 rounded-lg bg-white/20 dark:bg-slate-800/50 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-colors">
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Expected response time: <span className="font-bold text-gray-900 dark:text-white">24 hours</span>
              </p>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', description: '', channel: 'email' });
                    setAiAnalysis(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl transition-all duration-300"
                >
                  Submit Another
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/complaints')}
                  className="px-6 py-3 rounded-xl bg-white/20 dark:bg-slate-800/50 text-gray-900 dark:text-white font-semibold border-2 border-white/30 dark:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-300"
                >
                  View All Complaints
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
