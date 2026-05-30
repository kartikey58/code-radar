import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchCodeforcesStats, fetchLeetCodeStats, fetchCodeChefStats, fetchGitHubStats } from '../api/userStats';
import type { UserStats, GitHubStats } from '../api/userStats';
import { format } from 'date-fns';
import { Trophy, Target, Hash, ChevronDown, ChevronRight, GitBranch, Star, Users, BookOpen, ExternalLink, Edit2 } from 'lucide-react';

interface PlatformProfileProps {
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef';
  fetchStats: (username: string) => Promise<UserStats | null>;
  color: string;
}

function PlatformProfile({ platform, fetchStats, color }: PlatformProfileProps) {
  const storageKey = `${platform.toUpperCase()}_USERNAME`;
  const [username] = useState(localStorage.getItem(storageKey) || '');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(localStorage.getItem(`${storageKey}_EXPANDED`) !== 'false');

  const loadStats = async (user: string) => {
    if (!user) return;
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
    }
  };

  useEffect(() => {
    if (username) loadStats(username);
  }, []);



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
        <div style={{ display: 'flex', gap: '0.5rem', opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s' }}>
          {username && (
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '8px', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              @{username}
            </div>
          )}
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

interface GitHubProfileProps {
  color: string;
}

function GitHubProfile({ color }: GitHubProfileProps) {
  const storageKey = 'GITHUB_USERNAME';
  const [username] = useState(localStorage.getItem(storageKey) || '');
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(localStorage.getItem(`${storageKey}_EXPANDED`) !== 'false');

  const loadStats = async (user: string) => {
    if (!user) return;
    setError(false);
    try {
      const data = await fetchGitHubStats(user);
      if (data) {
        setStats(data);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    }
  };

  useEffect(() => {
    if (username) loadStats(username);
  }, []);



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
          GitHub Profile
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s' }}>
          {username && (
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '8px', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              @{username}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          {error && (
            <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Could not fetch GitHub user data. Please check the username.
            </div>
          )}

          {stats && (
            <>
              {/* Profile Card & Bio */}
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                background: 'rgba(255,255,255,0.03)', 
                padding: '1.5rem', 
                borderRadius: '16px', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <img 
                  src={stats.avatarUrl} 
                  alt={stats.name} 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', border: `2px solid ${color}` }} 
                />
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0 }}>{stats.name}</h4>
                    <a 
                      href={`https://github.com/${stats.username}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center' }}
                      onMouseOver={(e) => e.currentTarget.style.color = color}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: color, marginBottom: '0.5rem', fontWeight: 500 }}>@{stats.username}</div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>{stats.bio}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <BookOpen size={24} color={color} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.publicRepos}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Public Repositories</div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <Star size={24} color={color} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalStars}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Stars</div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <Users size={24} color={color} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.followers}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {stats.following}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Followers / Following</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: color }}>{stats.topLanguage}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Top Primary Language</div>
                </div>
              </div>

              {/* Repositories */}
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GitBranch size={18} color={color} />
                  <span>Top & Recent Repositories</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  {stats.recentRepos.map((repo, idx) => (
                    <a 
                      key={idx}
                      href={repo.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="glass-panel"
                      style={{ 
                        padding: '1.25rem', 
                        textDecoration: 'none', 
                        color: 'inherit',
                        transition: 'transform 0.2s, border-color 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid var(--card-border)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = color;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'var(--card-border)';
                      }}
                    >
                      <div>
                        <h5 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {repo.name}
                        </h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {repo.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></span>
                          {repo.language}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={12} fill="var(--text-secondary)" stroke="none" />
                          {repo.stars}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const EditProfileForm = () => {
    const [githubId, setGithubId] = useState(localStorage.getItem('GITHUB_USERNAME') || '');
    const [leetcodeId, setLeetcodeId] = useState(localStorage.getItem('LEETCODE_USERNAME') || '');
    const [codechefId, setCodechefId] = useState(localStorage.getItem('CODECHEF_USERNAME') || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      const userProfileStr = localStorage.getItem('google_user_profile');
      if (!userProfileStr) return;
      const email = JSON.parse(userProfileStr).email;
      
      setLoading(true);
      try {
        await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': email
          },
          body: JSON.stringify({
            githubId,
            leetcodeId,
            codechefId
          })
        });
        
        localStorage.setItem('GITHUB_USERNAME', githubId);
        localStorage.setItem('LEETCODE_USERNAME', leetcodeId);
        localStorage.setItem('CODECHEF_USERNAME', codechefId);
        
        setIsEditing(false);
        // Force reload to fetch new stats
        window.location.reload();
      } catch (e) {
        alert("Failed to save profile.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--accent-color)' }}>Edit Platform Usernames</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>GitHub Username</label>
            <input className="input-field" value={githubId} onChange={e => setGithubId(e.target.value)} placeholder="e.g. torvalds" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>LeetCode Username</label>
            <input className="input-field" value={leetcodeId} onChange={e => setLeetcodeId(e.target.value)} placeholder="e.g. neetcode" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>CodeChef Username</label>
            <input className="input-field" value={codechefId} onChange={e => setCodechefId(e.target.value)} placeholder="e.g. tourist" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ padding: '0.75rem 1.5rem', flex: 1, display: 'flex', justifyContent: 'center' }}>
              {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Save Changes'}
            </button>
            <button className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>User Profile</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track your ratings and stats across platforms.</p>
        </div>
        {!isEditing && (
          <button 
            className="btn btn-outline" 
            onClick={() => setIsEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
          >
            <Edit2 size={18} /> Edit Platforms
          </button>
        )}
      </div>

      {isEditing && <EditProfileForm />}

      <PlatformProfile platform="Codeforces" fetchStats={fetchCodeforcesStats} color="var(--cf-color)" />
      <PlatformProfile platform="LeetCode" fetchStats={fetchLeetCodeStats} color="var(--lc-color)" />
      <PlatformProfile platform="CodeChef" fetchStats={fetchCodeChefStats} color="var(--cc-color)" />
      <GitHubProfile color="var(--github-color)" />
      
      {/* AtCoder omitted because public APIs for full rating history are not readily available without scraping */}
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ℹ️ <i>AtCoder profile is currently view-only in Contests due to lack of public rating history APIs.</i>
      </div>
    </div>
  );
}

