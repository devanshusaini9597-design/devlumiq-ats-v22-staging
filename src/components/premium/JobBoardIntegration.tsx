'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Linkedin, Search, Building2, ExternalLink, CheckCircle, Globe, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface JobBoard {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  status: 'connected' | 'available' | 'pending';
  clicks: number;
  applications: number;
}

const BOARDS: JobBoard[] = [
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: <Linkedin className="w-5 h-5" />, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    status: 'connected', 
    clicks: 245, 
    applications: 12 
  },
  { 
    id: 'indeed', 
    name: 'Indeed', 
    icon: <Search className="w-5 h-5" />, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50',
    status: 'connected', 
    clicks: 189, 
    applications: 8 
  },
  { 
    id: 'glassdoor', 
    name: 'Glassdoor', 
    icon: <Building2 className="w-5 h-5" />, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    status: 'available', 
    clicks: 0, 
    applications: 0 
  },
  { 
    id: 'web', 
    name: 'Company Website', 
    icon: <Globe className="w-5 h-5" />, 
    color: 'text-brand-600', 
    bgColor: 'bg-brand-50',
    status: 'connected', 
    clicks: 67, 
    applications: 5 
  },
];

interface JobBoardIntegrationProps {
  jobId: string;
  jobTitle: string;
}

export function JobBoardIntegration({ jobId, jobTitle }: JobBoardIntegrationProps) {
  const [boards, setBoards] = useState(BOARDS);
  const [posting, setPosting] = useState<string | null>(null);
  const toast = useToast();

  const postToBoard = async (boardId: string) => {
    setPosting(boardId);
    try {
      await fetch(`/api/jobs/${jobId}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: boardId,
          postUrl: `https://${boardId}.com/jobs/${jobId}`,
          externalId: `ext-${jobId}-${Date.now()}`,
        })
      });
      
      toast.success(`Posted to ${boardId} successfully`);
      
      // Update local state
      setBoards(prev => prev.map(b => 
        b.id === boardId 
          ? { ...b, status: 'connected', clicks: b.clicks + 1 }
          : b
      ));
    } catch {
      toast.error(`Failed to post to ${boardId}`);
    } finally {
      setPosting(null);
    }
  };

  const totalClicks = boards.reduce((sum, b) => sum + b.clicks, 0);
  const totalApplications = boards.reduce((sum, b) => sum + b.applications, 0);

  return (
    <div className="space-y-6">
      {/* Premium Stats Cards - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 border border-blue-200/50 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider hidden sm:inline">Total Clicks</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">{totalClicks}</p>
          <p className="text-xs text-stone-500 mt-0.5 sm:hidden">Total Clicks</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/50 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider hidden sm:inline">Applications</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">{totalApplications}</p>
          <p className="text-xs text-stone-500 mt-0.5 sm:hidden">Applications</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider hidden sm:inline">Active Boards</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">{boards.filter(b => b.status === 'connected').length}</p>
          <p className="text-xs text-stone-500 mt-0.5 sm:hidden">Active Boards</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 border border-purple-200/50 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider hidden sm:inline">Conversion</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900">
            {totalClicks > 0 ? Math.round((totalApplications / totalClicks) * 100) : 0}%
          </p>
          <p className="text-xs text-stone-500 mt-0.5 sm:hidden">Conversion</p>
        </motion.div>
      </div>

      {/* Premium Board Cards - Responsive Table Layout */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 bg-stone-50/80 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
          <div className="col-span-4">Job Board</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Clicks</div>
          <div className="col-span-2 text-center">Applications</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        
        <div className="divide-y divide-stone-100">
          {boards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(250, 250, 249, 0.8)' }}
              className={`flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 p-4 ${
                board.status === 'connected' ? 'bg-white' : 'bg-stone-50/50'
              } transition-colors`}
            >
              {/* Board Info */}
              <div className="sm:col-span-4 flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${board.bgColor} flex items-center justify-center ${board.color} shadow-sm flex-shrink-0`}
                >
                  {board.icon}
                </motion.div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-stone-900 truncate text-sm sm:text-base">{board.name}</h4>
                  <div className="sm:hidden flex items-center gap-3 mt-1 text-xs text-stone-500">
                    <span>{board.clicks} clicks</span>
                    <span>•</span>
                    <span>{board.applications} apps</span>
                  </div>
                </div>
              </div>
              
              {/* Status - Desktop */}
              <div className="sm:col-span-2 hidden sm:flex items-center justify-center">
                {board.status === 'connected' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                    <div className="w-2 h-2 rounded-full bg-stone-400" />
                    Available
                  </span>
                )}
              </div>
              
              {/* Clicks - Desktop */}
              <div className="sm:col-span-2 hidden sm:flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-bold text-stone-900">{board.clicks}</p>
                  <p className="text-xs text-stone-500">clicks</p>
                </div>
              </div>
              
              {/* Applications - Desktop */}
              <div className="sm:col-span-2 hidden sm:flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-bold text-stone-900">{board.applications}</p>
                  <p className="text-xs text-stone-500">applications</p>
                </div>
              </div>
              
              {/* Action */}
              <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                {/* Mobile Status Badge */}
                <div className="sm:hidden">
                  {board.status === 'connected' ? (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                      <div className="w-2 h-2 rounded-full bg-stone-400" />
                      Available
                    </span>
                  )}
                </div>
                
                {board.status === 'connected' ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(`https://${board.id}.com`, '_blank')}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 transition-colors"
                    title="Open Board"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => postToBoard(board.id)}
                    disabled={posting === board.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg font-semibold text-xs hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {posting === board.id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Post Job</span>
                    <span className="sm:hidden">Post</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Info Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100/50 border border-stone-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 mb-1">Job Board Integrations</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              Automatically sync your job posting to multiple platforms and track applicant sources. 
              Connected boards update in real-time with click and application analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
