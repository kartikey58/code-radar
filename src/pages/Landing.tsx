import { Calendar as CalendarIcon, Trophy, Code, LineChart, Server, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingProps {
  onLogin: () => void;
}

export function Landing({ onLogin }: LandingProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0b1326] text-white overflow-x-hidden relative font-body selection:bg-blue-500/30">
      
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[20%] w-[60%] h-[40%] rounded-full bg-purple-600/15 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-6 flex justify-between items-center max-w-7xl w-full mx-auto backdrop-blur-xl border-b border-white/5 sticky top-0 bg-[#0b1326]/50">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.svg" alt="Code Radar Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-heading font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Code Radar
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="hidden md:block px-4 py-2 font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">
            View Demo
          </button>
          <button onClick={onLogin} className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-105 cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign In with Google
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center max-w-5xl mx-auto w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs uppercase tracking-widest mb-8 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live System Beta
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-5xl md:text-7xl font-bold leading-tight md:leading-[1.1] tracking-tight mb-6"
        >
          Your Competitive <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 drop-shadow-sm">
            Programming Command Center
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed"
        >
          Unified dashboards, real-time telemetry, and calendar syncing across LeetCode, Codeforces, CodeChef, and GitHub.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button 
            onClick={onLogin} 
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-semibold text-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Code className="relative z-10 w-6 h-6" />
            <span className="relative z-10">Initialize Dashboard</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Bento Grid Feature Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          {/* Feature 1 */}
          <div className="md:col-span-2 bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <CalendarIcon className="text-blue-400 w-6 h-6" />
            </div>
            <h3 className="font-heading text-2xl font-semibold mb-3">Live Contest Radar</h3>
            <p className="text-slate-400 leading-relaxed">
              Never miss a rated round again. View upcoming contests across all major platforms and one-click sync them to your Google Calendar.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-purple-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2"></div>
            <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <LineChart className="text-purple-400 w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3">Telemetry</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Visualize your rating history with interactive progression charts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-cyan-500/30 transition-colors group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2"></div>
            <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Trophy className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-3">Resume Sync</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Instantly compile your live problem-solving stats into resume-ready bullet points.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-2 bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-emerald-500/30 transition-colors group relative overflow-hidden flex flex-col justify-center">
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Server className="text-emerald-400 w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Background Syncing</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Your identity is linked in the cloud via AWS RDS. Authenticate once with Google, and your competitive programming identity follows you everywhere.
            </p>
          </div>
        </motion.div>

      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-slate-500 text-sm font-mono mt-12">
        SYSTEM VER 1.0.0 // ENCRYPTED CONNECTION // BUILT FOR HACKERS
      </footer>
    </div>
  );
}
