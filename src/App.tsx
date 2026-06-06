import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { LayoutDashboard, LineChart, Trophy, FileText } from 'lucide-react';
import axios from 'axios';
import { Contests } from './pages/Contests';
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
      <div className="flex min-h-screen w-full bg-[#0b1326] text-white font-body overflow-hidden selection:bg-blue-500/30">
        
        {/* Dynamic Background Blurs */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
        </div>

        {/* Sidebar */}
        <div className="relative z-20 w-64 bg-[#131b2e]/80 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col shrink-0 transition-all duration-300">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="Code Radar Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-heading font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Code Radar
            </h1>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold mb-8 transition-colors shadow-lg shadow-blue-500/20">
            <Trophy size={18} />
            <span>Join Contest</span>
          </button>

          <nav className="flex flex-col gap-2 flex-grow">
            <NavLink to="/" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard size={20} /> Contests
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Trophy size={20} /> Profile
            </NavLink>
            <NavLink to="/progress" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <LineChart size={20} /> Progress
            </NavLink>
            <NavLink to="/resume" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <FileText size={20} /> Resume
            </NavLink>
          </nav>

          {/* User Shelf */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <img src={userProfile.picture} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-semibold truncate text-white">{userProfile.name}</div>
                <button onClick={logout} className="text-xs text-slate-400 hover:text-red-400 transition-colors text-left p-0 m-0 cursor-pointer">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 h-screen overflow-y-auto px-8 md:px-12 py-8">
          {!localStorage.getItem('VITE_GOOGLE_CLIENT_ID') && !import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
              <span>⚠️ Google OAuth Client ID is missing.</span>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<Contests accessToken={accessToken} onLoginRequest={login} />} />
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
