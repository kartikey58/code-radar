import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar as CalendarIcon, User, LayoutDashboard, LineChart, Trophy } from 'lucide-react';
import axios from 'axios';
import { Contests } from './pages/Contests';
import { Profile } from './pages/Profile';
import { Progress } from './pages/Progress';
import { Onboarding } from './pages/Onboarding';
import { Landing } from './pages/Landing';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(sessionStorage.getItem('google_access_token'));
  const [userProfile, setUserProfile] = useState<any>(JSON.parse(sessionStorage.getItem('google_user_profile') || 'null'));
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(sessionStorage.getItem('onboarding_complete') === 'true');
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
        sessionStorage.setItem('onboarding_complete', 'true');
        
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
      sessionStorage.setItem('google_user_profile', JSON.stringify(res.data));
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
      sessionStorage.setItem('google_access_token', codeResponse.access_token);
      fetchUserProfile(codeResponse.access_token);
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events'
  });

  const logout = () => {
    setAccessToken(null);
    setUserProfile(null);
    setOnboardingComplete(false);
    sessionStorage.removeItem('google_access_token');
    sessionStorage.removeItem('google_user_profile');
    sessionStorage.removeItem('onboarding_complete');
  };

  // State 1: Logged Out -> Show Landing Page
  if (!userProfile) {
    return (
      <BrowserRouter>
        <Landing onLogin={() => login()} />
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
                    sessionStorage.setItem('onboarding_complete', 'true');
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
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '260px', 
          backgroundColor: 'rgba(20, 26, 38, 0.8)', 
          borderRight: '1px solid var(--card-border)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--accent-color), var(--cc-color))',
              padding: '0.6rem',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <CalendarIcon size={24} color="white" />
            </div>
            <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              Radar
            </h1>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
            <NavLink to="/" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Contests
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Trophy size={20} /> Profile
            </NavLink>
            <NavLink to="/progress" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <LineChart size={20} /> Progress
            </NavLink>
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <img src={userProfile.picture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userProfile.name}</div>
                <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', padding: 0, textAlign: 'left' }}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flexGrow: 1, padding: '2rem 3rem', height: '100vh', overflowY: 'auto' }}>
          {!localStorage.getItem('VITE_GOOGLE_CLIENT_ID') && !import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>⚠️ Google OAuth Client ID is missing.</span>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<Contests accessToken={accessToken} onLoginRequest={() => login()} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
