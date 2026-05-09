import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchCodeforcesStats, fetchLeetCodeStats, fetchCodeChefStats } from '../api/userStats';
import type { UserStats } from '../api/userStats';
import { format } from 'date-fns';
import { Save, RefreshCw, Trophy, Target, Hash, ChevronDown, ChevronRight } from 'lucide-react';

interface PlatformProfileProps {
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef';
  fetchStats: (username: string) => Promise<UserStats | null>;
  color: string;
}

function PlatformProfile({ platform, fetchStats, color }: PlatformProfileProps) {
  const storageKey = `${platform.toUpperCase()}_USERNAME`;
  const [username, setUsername] = useState(localStorage.getItem(storageKey) || '');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(localStorage.getItem(`${storageKey}_EXPANDED`) !== 'false');

  const loadStats = async (user: string) => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const data = await fetchStats(user);
      if (data) {
        setStats(data);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) loadStats(username);
  }, []);

  const handleSave = () => {
    localStorage.setItem(storageKey, username);
    loadStats(username);
  };

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem(`${storageKey}_EXPANDED`, String(newState));
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '1.5rem' : '0' }}>
        <h3 
          style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, cursor: 'pointer', userSelect: 'none' }}
          onClick={toggleExpand}
        >
          {isExpanded ? <ChevronDown size={20} color="var(--text-secondary)" /> : <ChevronRight size={20} color="var(--text-secondary)" />}
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}></span>
          {platform} Profile
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', opacity: isExpanded ? 1 : 0, pointerEvents: isExpanded ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '200px', padding: '0.5rem' }}
          />
          <button className="btn btn-primary" onClick={handleSave} disabled={loading || !username}>
            {loading ? <RefreshCw size={16} className="spinner" /> : <Save size={16} />}
            <span>Save</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          {error && (
            <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Could not fetch user data. Please check the username.
            </div>
          )}

          {stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <Trophy size={24} color={color} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.currentRating}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Rating</div>
                </div>
                
                {stats.maxRating > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                    <Target size={24} color={color} style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.maxRating}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Max Rating</div>
                  </div>
                )}
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <Hash size={24} color={color} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.contestsAttended}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contests Attended</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: color }}>{stats.problemsSolved.total}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Problems Solved</div>
                </div>
              </div>

              <div style={{ height: '300px', width: '100%' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Rating History</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.ratingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(tick) => format(new Date(tick), 'MMM yyyy')}
                      stroke="var(--text-secondary)"
                      fontSize={12}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="var(--text-secondary)"
                      fontSize={12}
                    />
                    <Tooltip 
                      labelFormatter={(label) => format(new Date(label), 'MMM do, yyyy')}
                      contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke={color} 
                      strokeWidth={3}
                      dot={{ r: 3, fill: color, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Profile() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>User Profile</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Track your ratings and stats across platforms.</p>
      </div>

      <PlatformProfile platform="Codeforces" fetchStats={fetchCodeforcesStats} color="var(--cf-color)" />
      <PlatformProfile platform="LeetCode" fetchStats={fetchLeetCodeStats} color="var(--lc-color)" />
      <PlatformProfile platform="CodeChef" fetchStats={fetchCodeChefStats} color="var(--cc-color)" />
      
      {/* AtCoder omitted because public APIs for full rating history are not readily available without scraping */}
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ℹ️ <i>AtCoder profile is currently view-only in Contests due to lack of public rating history APIs.</i>
      </div>
    </div>
  );
}
