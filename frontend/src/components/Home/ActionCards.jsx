import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Edit3, GraduationCap, Users } from 'lucide-react';

export default function ActionCards({ allCollegesCount, onReviewClick, onNavigate }) {
  return (
    <section className="relative z-20 py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 mb-3">Ready to Get Started?</h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">Join thousands of students who have already found their perfect college and shared their experiences</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.5 }}
            whileHover={{ y: -4 }}
            onClick={onReviewClick}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Edit3 size={20} />
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                  {allCollegesCount}+ Universities
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Write a Review</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Share your authentic campus journey and help fellow students make informed decisions</p>
              <div className="flex items-center justify-end text-indigo-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                Get Started <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
            onClick={() => onNavigate('/reviews')}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <GraduationCap size={20} />
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                  {allCollegesCount}+ Universities
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Explore Reviews</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Browse through thousands of genuine student reviews from real colleges across India</p>
              <div className="flex items-center justify-end text-indigo-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                Get Started <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -4 }}
            onClick={() => onNavigate('/community')}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Users size={20} />
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                  {allCollegesCount}+ Universities
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Find Community</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Connect with industry experts, alumni, and fellow students to grow your network</p>
              <div className="flex items-center justify-end text-indigo-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                Get Started <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
