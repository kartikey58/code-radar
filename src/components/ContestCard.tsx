import { useState } from 'react';
import { Calendar, Clock, ExternalLink, CalendarPlus, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Contest } from '../api/contests';

interface ContestCardProps {
  contest: Contest;
  onAddCalendar: (contest: Contest, reminderMinutes: number) => Promise<void>;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function ContestCard({ contest, onAddCalendar, isAuthenticated, onLogin }: ContestCardProps) {
  const [reminder, setReminder] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const getPlatformColor = (platform: string) => {
    switch(platform) {
      case 'Codeforces': return 'var(--cf-color)';
      case 'LeetCode': return 'var(--lc-color)';
      case 'CodeChef': return 'var(--cc-color)';
      case 'AtCoder': return 'var(--ac-color)';
      default: return 'var(--accent-color)';
    }
  };

  const handleAdd = async () => {
    if (!isAuthenticated) {
      onLogin();
      return;
    }
    setLoading(true);
    try {
      await onAddCalendar(contest, reminder);
      setAdded(true);
    } catch (err) {
      alert('Failed to add to calendar. See console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel hover-lift" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ 
          fontSize: '0.8rem', 
          fontWeight: 600, 
          padding: '0.25rem 0.75rem', 
          borderRadius: '999px',
          backgroundColor: `${getPlatformColor(contest.platform)}22`,
          color: getPlatformColor(contest.platform),
          border: `1px solid ${getPlatformColor(contest.platform)}55`
        }}>
          {contest.platform}
        </span>
        <a href={contest.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
          <ExternalLink size={18} />
        </a>
      </div>
      
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', flexGrow: 1, fontWeight: 600, lineHeight: 1.3 }}>
        {contest.name}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} />
          <span>{format(contest.startTime, 'MMM do, yyyy • h:mm a')} (IST)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} />
          <span>Duration: {formatDuration(contest.durationSeconds)}</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto' }}>
        <select 
          value={reminder} 
          onChange={(e) => setReminder(Number(e.target.value))}
          className="input-field"
          style={{ width: 'auto', padding: '0.5rem', cursor: 'pointer' }}
          disabled={added || loading}
        >
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={60}>1 hour</option>
        </select>
        
        <button 
          className={`btn ${added ? 'btn-outline' : 'btn-primary'}`} 
          style={{ flexGrow: 1, padding: '0.5rem', color: added ? '#10b981' : '' }}
          onClick={handleAdd}
          disabled={added || loading}
        >
          {loading ? (
            <span className="spinner"><Clock size={18} /></span>
          ) : added ? (
            <><CheckCircle size={18} /> Added</>
          ) : (
            <><CalendarPlus size={18} /> Add to Cal</>
          )}
        </button>
      </div>
    </div>
  );
}
