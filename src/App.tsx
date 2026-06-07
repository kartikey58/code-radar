import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { LayoutDashboard, LineChart, Trophy, FileText, X, Bookmark, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { Contests } from './pages/Contests';
import type { Contest } from './api/contests';
import { Profile } from './pages/Profile';
import { Progress } from './pages/Progress';
import { Onboarding } from './pages/Onboarding';
import { Landing } from './pages/Landing';
import { Resume } from './pages/Resume';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('google_access_token'));
  const [userProfile, setUserProfile] = useState<any>(JSON.parse(localStorage.getItem('google_user_profile') || 'null'));
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(localStorage.getItem('onboarding_complete') === 'true');
  const [isLoadingDB, setIsLoadingDB] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [savedContests, setSavedContests] = useState<Contest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('saved_contests') || '[]');
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleSaveContest = (contest: Contest) => {
    setSavedContests(prev => {
      const exists = prev.find(c => c.id === contest.id);
      let next;
      if (exists) {
         next = prev.filter(c => c.id !== contest.id);
      } else {
         next = [...prev, contest];
      }
      localStorage.setItem('saved_contests', JSON.stringify(next));
      return next;
    });
  };

  const checkUserInDB = async (email: string) => {
    setIsLoadingDB(true);
    try {
      const res = await axios.get('/api/user-profile', {
        headers: { 'x-user-email': email }
      });
      
      // Ensure we received a JSON object from the API, not an HTML string fallback from Vite
      if (res.data && typeof res.data === 'object' && !res.data.error && Object.keys(res.data).length > 0) {
        setOnboardingComplete(true);
        localStorage.setItem('onboarding_complete', 'true');
        
        if (res.data.githubId) localStorage.setItem('GITHUB_USERNAME', res.data.githubId);
        if (res.data.leetcodeId) localStorage.setItem('LEETCODE_USERNAME', res.data.leetcodeId);
        if (res.data.codechefId) localStorage.setItem('CODECHEF_USERNAME', res.data.codechefId);
      } else {
        setOnboardingComplete(false);
      }
    } catch (err) {
      console.error("Failed to check user in AWS RDS", err);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
      localStorage.setItem('google_user_profile', JSON.stringify(res.data));
      if (res.data.email) {
        checkUserInDB(res.data.email);
      }
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  };

  useEffect(() => {
    if (userProfile?.email && !onboardingComplete) {
      checkUserInDB(userProfile.email);
    }
  }, [userProfile]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setAccessToken(codeResponse.access_token);
      localStorage.setItem('google_access_token', codeResponse.access_token);
      fetchUserProfile(codeResponse.access_token);
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events'
  });

  const logout = () => {
    setAccessToken(null);
    setUserProfile(null);
    setOnboardingComplete(false);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user_profile');
    localStorage.removeItem('onboarding_complete');
  };

  // State 1: Logged Out -> Show Landing Page
  if (!userProfile) {
    return (
      <BrowserRouter>
        <Landing onLogin={login} />
      </BrowserRouter>
    );
  }

  // State 2: Logged In but Checking DB or Onboarding NOT complete -> Show Onboarding Page Fullscreen
  if (isLoadingDB || !onboardingComplete) {
    return (
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {isLoadingDB ? (
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--accent-color)', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '1rem' }}></div>
              <h2 style={{ color: 'var(--text-secondary)' }}>Loading your profile...</h2>
            </div>
          ) : (
            <Routes>
              <Route path="/onboarding" element={
                <Onboarding 
                  userEmail={userProfile.email} 
                  userName={userProfile.name} 
                  onComplete={() => {
                    setOnboardingComplete(true);
                    localStorage.setItem('onboarding_complete', 'true');
                  }} 
                />
              } />
              <Route path="*" element={<Navigate to="/onboarding" />} />
            </Routes>
          )}
        </div>
      </BrowserRouter>
    );
  }

  // State 3: Logged In and Onboarding Complete -> Show App Dashboard
  return (
    <BrowserRouter>
      {/* Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2 text-slate-900 dark:text-white">
                <Bookmark className="text-blue-500 dark:text-blue-400 w-5 h-5" /> Contest Library
              </h2>
              <button onClick={() => setIsLibraryOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {savedContests.length === 0 ? (
                <div className="text-center py-10">
                  <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">Your library is empty.</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Add contests from the schedule to easily join them later.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedContests.map(c => (
                    <div key={c.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                      <div className="truncate pr-4 flex-1">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={c.name}>{c.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-400">{c.platform}</span>
                          <span>{new Date(c.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <a 
                        href={c.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                      >
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-white font-body overflow-hidden selection:bg-blue-500/30">
        
        {/* Dynamic Background Blurs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 dark:bg-purple-600/10 blur-[100px]" />
        </div>

        {/* Sidebar */}
        <div className="relative z-20 w-64 bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 p-6 flex flex-col shrink-0 transition-all duration-300">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.svg" alt="Code Radar Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-heading font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Code Radar
              </h1>
            </div>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <button onClick={() => setIsLibraryOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold mb-8 transition-colors shadow-lg shadow-blue-500/20">
            <Trophy size={18} />
            <span>Join Contest</span>
          </button>

          <nav className="flex flex-col gap-2 flex-grow">
            <NavLink to="/" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              <LayoutDashboard size={20} /> Contests
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              <Trophy size={20} /> Profile
            </NavLink>
            <NavLink to="/progress" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              <LineChart size={20} /> Progress
            </NavLink>
            <NavLink to="/resume" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              <FileText size={20} /> Resume
            </NavLink>
          </nav>

          {/* User Shelf */}
          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors">
              <img src={userProfile.picture} alt="Profile" className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10" />
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-semibold truncate text-slate-900 dark:text-white">{userProfile.name}</div>
                <button onClick={logout} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-left p-0 m-0 cursor-pointer">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 h-screen overflow-y-auto px-8 md:px-12 py-8">
          
          {/* Library Modal */}
          {isLibraryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#131b2e] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h2 className="font-heading font-bold text-xl flex items-center gap-2 text-white">
                    <Bookmark className="text-blue-400 w-5 h-5" /> Contest Library
                  </h2>
                  <button onClick={() => setIsLibraryOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto flex-1">
                  {savedContests.length === 0 ? (
                    <div className="text-center py-10">
                      <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Your library is empty.</p>
                      <p className="text-sm text-slate-500 mt-1">Add contests from the schedule to easily join them later.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedContests.map(c => (
                        <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors group">
                          <div className="truncate pr-4 flex-1">
                            <div className="font-semibold text-sm text-white truncate" title={c.name}>{c.name}</div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold tracking-wider">{c.platform}</span>
                              <span>{new Date(c.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <a 
                            href={c.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                          >
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!localStorage.getItem('VITE_GOOGLE_CLIENT_ID') && !import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
              <span>⚠️ Google OAuth Client ID is missing.</span>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<Contests accessToken={accessToken} onLoginRequest={login} savedContests={savedContests} onToggleSave={toggleSaveContest} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
