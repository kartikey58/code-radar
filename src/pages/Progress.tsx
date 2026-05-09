import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { fetchLeetCodeStats } from '../api/userStats';
import type { UserStats } from '../api/userStats';

export function Progress() {
  const [lcStats, setLcStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const lcUser = localStorage.getItem('LEETCODE_USERNAME');
      if (lcUser) {
        const stats = await fetchLeetCodeStats(lcUser);
        setLcStats(stats);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const getDifficultyData = () => {
    if (!lcStats) return [];
    return [
      { name: 'Easy', count: lcStats.problemsSolved.easy || 0, color: '#10b981' },
      { name: 'Medium', count: lcStats.problemsSolved.medium || 0, color: '#f59e0b' },
      { name: 'Hard', count: lcStats.problemsSolved.hard || 0, color: '#ef4444' }
    ];
  };

  const getContestParticipation = () => {
    if (!lcStats) return [];
    
    // Group contests by month
    const months: Record<string, number> = {};
    lcStats.ratingHistory.forEach(h => {
      const date = new Date(h.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });

    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 active months
      .map(([month, count]) => ({ month, count }));
  };

  if (loading) return <div>Loading progress data...</div>;

  if (!lcStats) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>No LeetCode data found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please enter your LeetCode username in the Profile section to see your progress graphs.</p>
      </div>
    );
  }

  const difficultyData = getDifficultyData();
  const participationData = getContestParticipation();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Progress Tracker</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize your problem solving journey.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* LeetCode Problems Solved Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--lc-color)' }}>LeetCode Problems Solved</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contest Participation Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Contests Per Month (LeetCode)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--text-secondary)" />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
