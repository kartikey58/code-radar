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
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappNotification, setWhatsappNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
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

  const sendWhatsAppDigest = async () => {
    setSendingWhatsApp(true);
    setWhatsappNotification(null);
    try {
      // Trigger API with 24 hours lookahead
      const res = await fetch('/api/cron?hours=24');
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.contestsFound > 0) {
          setWhatsappNotification({
            type: 'success',
            message: `🚀 Success! Sent digest of ${data.contestsFound} contest(s) to your WhatsApp.`
          });
        } else {
          setWhatsappNotification({
            type: 'success',
            message: 'ℹ️ Checked Clist, but no contests are starting in the next 24 hours.'
          });
        }
      } else {
        setWhatsappNotification({
          type: 'error',
          message: `⚠️ Error: ${data.error || 'Failed to send WhatsApp digest. Please configure environment variables.'}`
        });
      }
    } catch (err) {
      console.error(err);
      setWhatsappNotification({
        type: 'error',
        message: '⚠️ Network Error: Could not connect to the backend api/cron.'
      });
    } finally {
      setSendingWhatsApp(false);
    }
  };

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
      {whatsappNotification && (
        <div style={{ 
          backgroundColor: whatsappNotification.type === 'success' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          border: `1px solid ${whatsappNotification.type === 'success' ? '#25D366' : '#ef4444'}`, 
          color: whatsappNotification.type === 'success' ? '#25D366' : '#ef4444', 
          padding: '1rem 1.25rem', 
          borderRadius: '10px', 
          marginBottom: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{whatsappNotification.message}</span>
          <button 
            onClick={() => setWhatsappNotification(null)} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'inherit', 
              cursor: 'pointer', 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              padding: '0 0.5rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Upcoming Contests</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Find and schedule your next coding challenge.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-whatsapp" 
            onClick={sendWhatsAppDigest} 
            disabled={sendingWhatsApp} 
            style={{ 
              backgroundColor: '#25D366', 
              color: 'white', 
              border: 'none',
              padding: '0.65rem 1.2rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#128C7E'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
          >
            {sendingWhatsApp ? (
              <RefreshCw size={16} className="spinner" />
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.002 6.142 1.233 8.377 3.469 2.235 2.236 3.462 5.214 3.46 8.381-.004 6.535-5.33 11.859-11.859 11.859-2.007-.002-3.978-.512-5.714-1.484L0 24zm6.59-4.846c1.666.988 3.308 1.492 5.261 1.493 5.485.002 9.948-4.461 9.95-9.95.001-2.657-1.02-5.155-2.877-7.013C17.067 1.828 14.57 .807 11.91 .807 6.423.807 1.96 5.27 1.957 10.757c-.001 2.036.531 3.738 1.547 5.342l-1.018 3.716 3.818-1.002c.001 0 .001 0 0 0zm11.365-7.79c-.311-.155-1.843-.91-2.128-1.013-.284-.104-.492-.156-.701.156-.208.311-.803.963-.984 1.17-.181.208-.363.234-.674.078-.311-.155-1.316-.484-2.507-1.548-.927-.827-1.553-1.848-1.735-2.16-.182-.311-.02-.479.136-.633.14-.139.311-.364.467-.546.156-.182.208-.312.311-.52.104-.208.052-.39-.026-.546-.078-.156-.701-1.689-.961-2.312-.253-.609-.51-.527-.701-.527-.181 0-.39-.013-.597-.013-.208 0-.546.078-.832.39-.286.312-1.092 1.066-1.092 2.6 0 1.534 1.117 3.016 1.272 3.224.156.208 2.199 3.359 5.328 4.71.745.322 1.326.514 1.778.658.749.238 1.432.205 1.972.125.602-.09 1.843-.754 2.102-1.444.26-.69.26-1.287.182-1.413-.078-.127-.286-.208-.597-.363z"/>
              </svg>
            )}
            Send to WhatsApp
          </button>

          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '0.5rem' }}>Platform:</label>
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
