import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, ArrowRight, Zap, Globe, Star, Sparkles, 
  LayoutGrid, BookOpen, Clock, Users, ArrowUpRight,
  ShieldCheck, Share2, Layers
} from 'lucide-react';

const domains = ['All Domains', 'Artificial Intelligence', 'Web 3.0', 'Biotech', 'Sustainable Design'];

const projects = [
  {
    id: 1,
    title: "NeuralSieve: Algorithmic Bias Mitigation in Diagnostics",
    description: "A framework designed to identify and correct systematic biases in imaging analysis, ensuring equitable outcomes.",
    domain: "Artificial Intelligence",
    impact: "94% Accuracy Gain",
    difficulty: "High Complexity",
    facultySupport: 4.9,
    author: "Alex Rivera",
    tags: ["AI & Ethics", "Diagnostics"]
  },
  {
    id: 2,
    title: "SynFlow: Distributed State for Collaborative Tools",
    description: "Optimizing real-time synchronization in low-bandwidth environments for global remote teams.",
    domain: "Web 3.0",
    impact: "45% Latency Drop",
    difficulty: "Medium Complexity",
    facultySupport: 4.2,
    author: "Sarah Chen",
    tags: ["Web3", "Networking"]
  },
  {
    id: 3,
    title: "EcoGrit: Modular Urban Air Filter",
    description: "Passive filtration system using bio-polymeric membranes for high-density urban traffic zones.",
    domain: "Sustainable Design",
    impact: "99.2% Filtration",
    difficulty: "Extreme Challenge",
    facultySupport: 4.5,
    author: "Marcus Thorne",
    tags: ["Environment", "Materials"]
  },
  {
    id: 4,
    title: "GenPath: Protein Folding with Quantum Heuristics",
    description: "Bridging classical compute and quantum efficiency for complex biological modeling and drug discovery.",
    domain: "Biotech",
    impact: "Research Grade",
    difficulty: "Doctoral Level",
    facultySupport: 4.8,
    author: "Dr. Elena Vance",
    tags: ["Bioinformatics", "Quantum"]
  }
];

export default function ProjectsShowcase() {
  const { id } = useParams();
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [hoveredId, setHoveredId] = useState(null);

  const filteredProjects = selectedDomain === 'All Domains' 
    ? projects 
    : projects.filter(p => p.domain === selectedDomain);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#fbfcff] pb-20">
      
      {/* Cinematic Hero */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl -mr-96 -mt-96" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/30 rounded-full blur-3xl -ml-64 -mb-64" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-6 inline-block ring-1 ring-slate-100 shadow-sm">
              The Innovation Atelier
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-[0.9] tracking-tight mb-8">
              Where Rigor Meets <span className="text-gradient">Applied.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg mb-12">
              A curated archive of student-led breakthroughs, from algorithmic bias mitigation to modular biotechnology.
            </p>
            
            {/* Domain Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {domains.map(domain => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                    selectedDomain === domain 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                      : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Exhibition */}
      <main className="max-w-7xl mx-auto px-6">
        <motion.div 
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-700 h-[600px] cursor-pointer ring-1 ring-slate-100"
              >
                <div className="absolute inset-0 overflow-hidden">
                  {project.image ? (
                    <motion.img 
                      animate={{ scale: hoveredId === project.id ? 1.05 : 1 }}
                      transition={{ duration: 1.2 }}
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />
                </div>

                <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                      <span className="glass-dark text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                        {project.domain}
                      </span>
                      <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {project.difficulty}
                      </span>
                    </div>
                    <div className="w-12 h-12 glass-dark rounded-full flex items-center justify-center border border-white/20 group-hover:bg-indigo-600 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-display font-black leading-none tracking-tight mb-6 group-hover:text-indigo-300 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-white/60 font-medium line-clamp-2 md:line-clamp-3 mb-8 max-w-xl group-hover:text-white transition-colors">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center font-black text-xs text-indigo-400">
                        {project.facultySupport}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Faculty Endorsed</span>
                        <span className="text-xs font-bold">Research Excellence</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Target Outcome</span>
                        <span className="text-emerald-400 font-black">{project.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Floating Action for Community */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none"
      >
        <div className="pointer-events-auto glass px-8 py-4 rounded-3xl flex items-center gap-8 shadow-2xl ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {['AR', 'SC', 'MT'].map((initials, index) => (
                <div key={initials} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700">
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Active Mentors Ready</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <Link to="/community" className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
            Discuss Innovation <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
