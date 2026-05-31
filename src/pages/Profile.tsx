import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchCodeforcesStats, fetchLeetCodeStats, fetchCodeChefStats, fetchGitHubStats } from '../api/userStats';
import type { UserStats, GitHubStats } from '../api/userStats';
import { Edit2, Terminal } from 'lucide-react';

export function Profile() {
  const [userProfile] = useState<any>(JSON.parse(localStorage.getItem('google_user_profile') || '{}'));
  
  const [cfStats, setCfStats] = useState<UserStats | null>(null);
  const [lcStats, setLcStats] = useState<UserStats | null>(null);
  const [ccStats, setCcStats] = useState<UserStats | null>(null);
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const cfUser = localStorage.getItem('CODEFORCES_USERNAME');
      const lcUser = localStorage.getItem('LEETCODE_USERNAME');
      const ccUser = localStorage.getItem('CODECHEF_USERNAME');
      const ghUser = localStorage.getItem('GITHUB_USERNAME');

      const [cf, lc, cc, gh] = await Promise.all([
        cfUser ? fetchCodeforcesStats(cfUser) : Promise.resolve(null),
        lcUser ? fetchLeetCodeStats(lcUser) : Promise.resolve(null),
        ccUser ? fetchCodeChefStats(ccUser) : Promise.resolve(null),
        ghUser ? fetchGitHubStats(ghUser) : Promise.resolve(null),
      ]);

      setCfStats(cf);
      setLcStats(lc);
      setCcStats(cc);
      setGhStats(gh);
      setLoading(false);
    }
    loadAll();
  }, []);

  const totalSolved = 
    (cfStats?.problemsSolved.total || 0) + 
    (lcStats?.problemsSolved.total || 0) + 
    (ccStats?.problemsSolved.total || 0);

  const getRankColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-500';
    if (rating >= 2100) return 'text-orange-500';
    if (rating >= 1900) return 'text-purple-500';
    if (rating >= 1600) return 'text-blue-500';
    if (rating >= 1400) return 'text-cyan-500';
    if (rating >= 1200) return 'text-green-500';
    return 'text-gray-400';
  };

  const getRankName = (rating: number) => {
    if (rating >= 2400) return 'Grandmaster';
    if (rating >= 2100) return 'Master';
    if (rating >= 1900) return 'Candidate Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Specialist';
    if (rating >= 1200) return 'Pupil';
    if (rating > 0) return 'Newbie';
    return 'Unrated';
  };

  const getCodechefStars = (rating: number) => {
    if (rating >= 2500) return 7;
    if (rating >= 2200) return 6;
    if (rating >= 2000) return 5;
    if (rating >= 1800) return 4;
    if (rating >= 1600) return 3;
    if (rating >= 1400) return 2;
    if (rating > 0) return 1;
    return 0;
  };

  // Mock heatmap generation
  const generateHeatmap = () => {
    const weeks = 12;
    const days = 7;
    const grid = [];
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < days; d++) {
        const intensity = Math.random();
        let bgClass = 'bg-[#1a2333]';
        if (intensity > 0.9) bgClass = 'bg-blue-400';
        else if (intensity > 0.7) bgClass = 'bg-blue-500/80';
        else if (intensity > 0.4) bgClass = 'bg-blue-500/50';
        else if (intensity > 0.2) bgClass = 'bg-blue-500/30';
        
        col.push(<div key={`${w}-${d}`} className={`w-3 h-3 rounded-[2px] ${bgClass}`}></div>);
      }
      grid.push(<div key={w} className="flex flex-col gap-1">{col}</div>);
    }
    return <div className="flex gap-1">{grid}</div>;
  };

  const lcTotal = lcStats?.problemsSolved.total || 0;
  const lcEasy = lcStats?.problemsSolved.easy || 0;
  const lcMedium = lcStats?.problemsSolved.medium || 0;
  const lcHard = lcStats?.problemsSolved.hard || 0;
  
  // Circumference for the SVG circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Let's just use an aesthetic solid cyan ring if they solved anything
  const dashoffset = lcTotal > 0 ? circumference * 0.25 : circumference;

  const EditProfileForm = () => {
    const [githubId, setGithubId] = useState(localStorage.getItem('GITHUB_USERNAME') || '');
    const [leetcodeId, setLeetcodeId] = useState(localStorage.getItem('LEETCODE_USERNAME') || '');
    const [codechefId, setCodechefId] = useState(localStorage.getItem('CODECHEF_USERNAME') || '');
    const [codeforcesId, setCodeforcesId] = useState(localStorage.getItem('CODEFORCES_USERNAME') || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      setSaving(true);
      const email = userProfile.email;
      
      try {
        await fetch('/api/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-email': email },
          body: JSON.stringify({ githubId, leetcodeId, codechefId })
        });
        
        localStorage.setItem('GITHUB_USERNAME', githubId);
        localStorage.setItem('LEETCODE_USERNAME', leetcodeId);
        localStorage.setItem('CODECHEF_USERNAME', codechefId);
        localStorage.setItem('CODEFORCES_USERNAME', codeforcesId);
        
        setIsEditing(false);
        window.location.reload();
      } catch (e) {
        alert("Failed to save profile.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="bg-[#131b2e] border border-white/5 p-6 rounded-2xl mb-8">
        <h3 className="text-xl font-heading font-bold mb-6 text-white">Edit Connected Handles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Codeforces</label>
            <input className="w-full bg-[#0b1326] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={codeforcesId} onChange={e => setCodeforcesId(e.target.value)} placeholder="e.g. tourist" />
          </div>
          <div>
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 block">LeetCode</label>
            <input className="w-full bg-[#0b1326] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={leetcodeId} onChange={e => setLeetcodeId(e.target.value)} placeholder="e.g. neetcode" />
          </div>
          <div>
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 block">CodeChef</label>
            <input className="w-full bg-[#0b1326] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={codechefId} onChange={e => setCodechefId(e.target.value)} placeholder="e.g. genady" />
          </div>
          <div>
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 block">GitHub</label>
            <input className="w-full bg-[#0b1326] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={githubId} onChange={e => setGithubId(e.target.value)} placeholder="e.g. torvalds" />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl font-medium transition-colors" onClick={() => setIsEditing(false)} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading developer telemetry...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl"></div>
            <img 
              src={userProfile.picture || "https://github.com/identicons/default.png"} 
              alt="Profile" 
              className="relative w-24 h-24 rounded-full border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] object-cover bg-[#0b1326]"
            />
          </div>
          <div>
            <h1 className="text-4xl font-heading font-bold text-white mb-2">{userProfile.name || 'Developer'}</h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 font-mono">
                @{ghStats?.username || 'user'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">{totalSolved.toLocaleString()}</span>
                <span className="text-slate-400 text-sm">Problems Solved</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#131b2e] hover:bg-white/5 border border-white/10 rounded-xl text-white font-medium transition-colors"
        >
          <Edit2 size={16} /> Edit Usernames
        </button>
      </div>

      {isEditing && <EditProfileForm />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Codeforces Dashboard */}
        <div className="lg:col-span-2 bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Codeforces
            </div>
            <Terminal className="text-white/10 w-12 h-12" />
          </div>
          
          <div className="flex items-end gap-3 mb-6">
            <div className="text-5xl font-heading font-bold text-white">{cfStats?.currentRating || 0}</div>
            <div className={`text-lg font-bold pb-1 ${getRankColor(cfStats?.currentRating || 0)}`}>
              {getRankName(cfStats?.currentRating || 0)}
            </div>
          </div>

          <div className="flex-1 min-h-[200px] -mx-6 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cfStats?.ratingHistory || []}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1326', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRating)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div>
              <div className="text-xs text-slate-500 font-mono mb-1">Max Rating</div>
              <div className="text-lg font-bold text-white">{cfStats?.maxRating || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-mono mb-1">Global Rank</div>
              <div className="text-lg font-bold text-white">Top 5%</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-mono mb-1">Contests</div>
              <div className="text-lg font-bold text-white">{cfStats?.contestsAttended || 0}</div>
            </div>
          </div>
        </div>

        {/* LeetCode Dashboard */}
        <div className="bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-8">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            LeetCode
          </div>
          
          <div className="flex justify-center mb-8 relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" className="w-48 h-48" style={{ r: '80px' }} />
              <circle 
                cx="96" cy="96" r={radius} stroke="#22d3ee" strokeWidth="8" fill="none" 
                strokeDasharray={circumference} 
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="w-48 h-48 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000"
                style={{ r: '80px', strokeDasharray: '502', strokeDashoffset: lcTotal > 0 ? '125' : '502' }} 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-heading font-bold text-white">{lcTotal}</span>
              <span className="text-xs text-slate-400">Solved</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>Easy</span>
                <span className="font-mono text-slate-400">{lcEasy}/800</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (lcEasy/800)*100)}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div>Medium</span>
                <span className="font-mono text-slate-400">{lcMedium}/1600</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (lcMedium/1600)*100)}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div>Hard</span>
                <span className="font-mono text-slate-400">{lcHard}/700</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (lcHard/700)*100)}%` }}></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CodeChef */}
        <div className="bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              CodeChef
            </div>
          </div>
          
          <div className="flex items-baseline gap-2 mb-8">
            <div className="text-4xl font-heading font-bold text-white">{ccStats?.currentRating || 0}</div>
            <div className="text-lg font-bold text-purple-400 flex items-center">
              {getCodechefStars(ccStats?.currentRating || 0)} ★
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0b1326] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-500 font-mono mb-1">Global Rank</div>
              <div className="text-lg font-bold text-white">-</div>
            </div>
            <div className="bg-[#0b1326] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-500 font-mono mb-1">Country Rank</div>
              <div className="text-lg font-bold text-white">-</div>
            </div>
          </div>
        </div>

        {/* GitHub Highlights */}
        <div className="lg:col-span-2 bg-[#131b2e]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              GitHub Highlights
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-xs text-slate-500 font-mono mb-3">Top Languages</div>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div> {ghStats?.topLanguage || 'Unknown'}
                </span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div> JavaScript
                </span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Python
                </span>
              </div>

              <div className="flex gap-8">
                <div>
                  <div className="text-xs text-slate-500 font-mono mb-1">Stars</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    {ghStats?.totalStars || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono mb-1">Public Repos</div>
                  <div className="text-2xl font-bold text-white">{ghStats?.publicRepos || 0}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-mono mb-3">Contribution Heatmap (Simulated)</div>
              <div className="bg-[#0b1326] p-4 rounded-xl border border-white/5 inline-block w-full overflow-hidden">
                {generateHeatmap()}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
