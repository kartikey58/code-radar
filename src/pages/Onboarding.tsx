import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Code2, Network, ShieldCheck, ArrowRight, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingProps {
  userEmail: string;
  userName: string;
  onComplete: () => void;
}

export function Onboarding({ userEmail, userName, onComplete }: OnboardingProps) {
  const [githubId, setGithubId] = useState(localStorage.getItem('GITHUB_USERNAME') || '');
  const [leetcodeId, setLeetcodeId] = useState(localStorage.getItem('LEETCODE_USERNAME') || '');
  const [codeforcesId, setCodeforcesId] = useState(localStorage.getItem('CODEFORCES_USERNAME') || '');
  const [codechefId, setCodechefId] = useState(localStorage.getItem('CODECHEF_USERNAME') || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save supported fields to AWS DB
      await axios.post('/api/user-profile', {
        name: userName,
        githubId,
        leetcodeId,
        codechefId
      }, {
        headers: {
          'x-user-email': userEmail
        }
      });
      
      // Save everything to localStorage for immediate dashboard access
      if (githubId) localStorage.setItem('GITHUB_USERNAME', githubId);
      if (leetcodeId) localStorage.setItem('LEETCODE_USERNAME', leetcodeId);
      if (codeforcesId) localStorage.setItem('CODEFORCES_USERNAME', codeforcesId);
      if (codechefId) localStorage.setItem('CODECHEF_USERNAME', codechefId);

      onComplete();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to securely sync identity. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1326] text-white p-6 relative overflow-hidden font-body selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-[#131b2e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-6 shadow-lg shadow-blue-500/30">
              <Network className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-3 tracking-tight">Identity Sync</h1>
            <p className="text-slate-400">
              Welcome <span className="text-white font-medium">{userName}</span>. Link your developer handles to initialize your unified telemetry dashboard.
            </p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* LeetCode Field */}
            <motion.div variants={itemVariants} className="space-y-2 group">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">LeetCode Handle</label>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={leetcodeId}
                  onChange={(e) => setLeetcodeId(e.target.value)}
                  placeholder="e.g. tourist"
                  className="w-full bg-[#0b1326]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all group-hover:border-white/20"
                />
                <div className="absolute inset-0 rounded-xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>

            {/* Codeforces Field */}
            <motion.div variants={itemVariants} className="space-y-2 group">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">Codeforces Handle</label>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={codeforcesId}
                  onChange={(e) => setCodeforcesId(e.target.value)}
                  placeholder="e.g. genady"
                  className="w-full bg-[#0b1326]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all group-hover:border-white/20"
                />
                <div className="absolute inset-0 rounded-xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>

            {/* CodeChef Field */}
            <motion.div variants={itemVariants} className="space-y-2 group">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">CodeChef Handle</label>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={codechefId}
                  onChange={(e) => setCodechefId(e.target.value)}
                  placeholder="e.g. tourist_cc"
                  className="w-full bg-[#0b1326]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all group-hover:border-white/20"
                />
                <div className="absolute inset-0 rounded-xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>

            {/* GitHub Field */}
            <motion.div variants={itemVariants} className="space-y-2 group">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">GitHub Username</label>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={githubId}
                  onChange={(e) => setGithubId(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="w-full bg-[#0b1326]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all group-hover:border-white/20"
                />
                <div className="absolute inset-0 rounded-xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Data is fetched via public APIs</span>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">{loading ? 'Syncing...' : 'Finish Setup'}</span>
                {!loading && <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </motion.div>

          </form>
        </div>
      </motion.div>
    </div>
  );
}
