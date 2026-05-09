import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { ContestCard } from '../components/ContestCard';
import { fetchAllContests } from '../api/contests';
import type { Contest } from '../api/contests';
import { createGoogleCalendarEvent } from '../api/googleCalendar';

interface ContestsProps {
  accessToken: string | null;
  onLoginRequest: () => void;
}

export function Contests({ accessToken, onLoginRequest }: ContestsProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  
  const loadContests = useCallback(async () => {
    setLoading(true);
    const clistUser = localStorage.getItem('CLIST_USER') || import.meta.env.VITE_CLIST_USER || '';
    const clistKey = localStorage.getItem('CLIST_KEY') || import.meta.env.VITE_CLIST_KEY || '';
    
    try {
      const data = await fetchAllContests(clistUser, clistKey);
      setContests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContests();
  }, [loadContests]);

  const handleAddCalendar = async (contest: Contest, reminderMinutes: number) => {
    if (!accessToken) {
      onLoginRequest();
      return;
    }
    
    try {
      await createGoogleCalendarEvent(accessToken, contest, reminderMinutes);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('403')) {
        onLoginRequest(); // Trigger re-login
      }
      throw err;
    }
  };

  const filteredContests = contests.filter(c => 
    filter === 'All' || c.platform === filter
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Upcoming Contests</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Find and schedule your next coding challenge.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Platform:</label>
          <select 
            className="input-field" 
            style={{ width: 'auto', minWidth: '150px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Platforms</option>
            <option value="Codeforces">Codeforces</option>
            <option value="LeetCode">LeetCode</option>
            <option value="CodeChef">CodeChef</option>
            <option value="AtCoder">AtCoder</option>
          </select>
          <button className="btn btn-outline" onClick={loadContests} disabled={loading} style={{ padding: '0.75rem' }}>
            <RefreshCw size={18} className={loading ? "spinner" : ""} />
          </button>
        </div>
      </div>

      {!localStorage.getItem('CLIST_KEY') && !import.meta.env.VITE_CLIST_KEY && (
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span>ℹ️ Configure your Clist.by API Key in the `.env` file to see LeetCode, CodeChef, and AtCoder contests.</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={40} className="spinner" style={{ marginBottom: '1rem', color: 'var(--accent-color)' }} />
          <p>Scanning the radar for upcoming contests...</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredContests.map((contest) => (
            <ContestCard 
              key={contest.id} 
              contest={contest} 
              onAddCalendar={handleAddCalendar}
              isAuthenticated={!!accessToken}
              onLogin={onLoginRequest}
            />
          ))}
          {filteredContests.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No contests found for this platform.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
