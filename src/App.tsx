import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar as CalendarIcon, User, LayoutDashboard, LineChart, Trophy } from 'lucide-react';
import axios from 'axios';
import { Contests } from './pages/Contests';
import { Profile } from './pages/Profile';
import { Progress } from './pages/Progress';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(sessionStorage.getItem('google_access_token'));
  const [userProfile, setUserProfile] = useState<any>(JSON.parse(sessionStorage.getItem('google_user_profile') || 'null'));

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
      sessionStorage.setItem('google_user_profile', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  };

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
    sessionStorage.removeItem('google_access_token');
    sessionStorage.removeItem('google_user_profile');
  };

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
            {userProfile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <img src={userProfile.picture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userProfile.name}</div>
                  <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', padding: 0, textAlign: 'left' }}>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => login()} style={{ width: '100%' }}>
                <User size={18} /> Link Google
              </button>
            )}
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
            <Route path="/" element={<Contests accessToken={accessToken} onLoginRequest={login} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
