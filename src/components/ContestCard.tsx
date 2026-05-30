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

  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const handleAdd = () => {
    if (!isAuthenticated) {
      onLogin();
      return;
    }
    setLoading(true);
    onAddCalendar(contest, reminder)
      .then(() => setAdded(true))
      .catch((err) => {
        alert('Failed to add to calendar. See console.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSendWhatsApp = async () => {
    setSendingWhatsApp(true);
    try {
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contest.name,
          platform: contest.platform,
          startTime: contest.startTime,
          url: contest.url
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsappSent(true);
        setTimeout(() => setWhatsappSent(false), 4000);
      } else {
        alert(`Error: ${data.error || 'Failed to send contest to WhatsApp.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network Error: Could not connect to the backend api/cron.');
    } finally {
      setSendingWhatsApp(false);
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

        <button 
          className="btn" 
          title="Send to WhatsApp"
          style={{ 
            padding: '0.5rem', 
            backgroundColor: whatsappSent ? 'rgba(37, 211, 102, 0.1)' : '#25D366', 
            color: whatsappSent ? '#25D366' : 'white', 
            border: whatsappSent ? '1px solid #25D366' : 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            flexShrink: 0,
            transition: 'background-color 0.2s',
          }}
          onClick={handleSendWhatsApp}
          disabled={sendingWhatsApp}
          onMouseOver={(e) => {
            if (!whatsappSent) e.currentTarget.style.backgroundColor = '#128C7E';
          }}
          onMouseOut={(e) => {
            if (!whatsappSent) e.currentTarget.style.backgroundColor = '#25D366';
          }}
        >
          {sendingWhatsApp ? (
            <span className="spinner"><Clock size={18} /></span>
          ) : whatsappSent ? (
            <CheckCircle size={18} />
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.002 6.142 1.233 8.377 3.469 2.235 2.236 3.462 5.214 3.46 8.381-.004 6.535-5.33 11.859-11.859 11.859-2.007-.002-3.978-.512-5.714-1.484L0 24zm6.59-4.846c1.666.988 3.308 1.492 5.261 1.493 5.485.002 9.948-4.461 9.95-9.95.001-2.657-1.02-5.155-2.877-7.013C17.067 1.828 14.57 .807 11.91 .807 6.423.807 1.96 5.27 1.957 10.757c-.001 2.036.531 3.738 1.547 5.342l-1.018 3.716 3.818-1.002c.001 0 .001 0 0 0zm11.365-7.79c-.311-.155-1.843-.91-2.128-1.013-.284-.104-.492-.156-.701.156-.208.311-.803.963-.984 1.17-.181.208-.363.234-.674.078-.311-.155-1.316-.484-2.507-1.548-.927-.827-1.553-1.848-1.735-2.16-.182-.311-.02-.479.136-.633.14-.139.311-.364.467-.546.156-.182.208-.312.311-.52.104-.208.052-.39-.026-.546-.078-.156-.701-1.689-.961-2.312-.253-.609-.51-.527-.701-.527-.181 0-.39-.013-.597-.013-.208 0-.546.078-.832.39-.286.312-1.092 1.066-1.092 2.6 0 1.534 1.117 3.016 1.272 3.224.156.208 2.199 3.359 5.328 4.71.745.322 1.326.514 1.778.658.749.238 1.432.205 1.972.125.602-.09 1.843-.754 2.102-1.444.26-.69.26-1.287.182-1.413-.078-.127-.286-.208-.597-.363z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
