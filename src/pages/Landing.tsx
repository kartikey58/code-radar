import { Calendar as CalendarIcon, Trophy, Code, LineChart, Server, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ShaderShowcase from '@/components/ui/hero';

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

      {/* Hero Section with ShaderShowcase */}
      <ShaderShowcase onLogin={onLogin} />

        {/* Bento Grid Feature Layout */}
        <motion.div 
          id="features"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full mt-24 max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10"
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-slate-500 text-sm font-mono mt-12">
        SYSTEM VER 1.0.0 // ENCRYPTED CONNECTION // BUILT FOR HACKERS
      </footer>
    </div>
  );
}
