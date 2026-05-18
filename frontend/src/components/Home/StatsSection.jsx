import React from 'react';
import { motion } from 'motion/react';

export default function StatsSection({ statsRef, statsData, statValues, formatStatValue }) {
  return (
    <section className="py-10 bg-indigo-700">
      <div className="max-w-7xl mx-auto px-6" ref={statsRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {statsData.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center mb-2">
                <stat.icon size={18} />
              </div>
              <div className="text-2xl font-display font-black mb-0.5">
                {formatStatValue(statValues[i], stat.format)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
