import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Calendar, ExternalLink, CalendarPlus, CheckCircle, Zap, Bookmark } from 'lucide-react';
import { format, isPast, isFuture, differenceInHours, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { fetchAllContests } from '../api/contests';
import type { Contest } from '../api/contests';
import { createGoogleCalendarEvent } from '../api/googleCalendar';

interface ContestsProps {
  accessToken: string | null;
  onLoginRequest: () => void;
  savedContests: Contest[];
  onToggleSave: (contest: Contest) => void;
}

export function Contests({ accessToken, onLoginRequest, savedContests, onToggleSave }: ContestsProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  
  // State for Add to Cal action
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [reminders, setReminders] = useState<Record<string, number>>({});
  
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

  const handleAddCalendar = async (contest: Contest) => {
    if (!accessToken) {
      onLoginRequest();
      return;
    }
    
    setAddingId(contest.id);
    const reminderMin = reminders[contest.id] || 30;
    
    try {
      await createGoogleCalendarEvent(accessToken, contest, reminderMin);
      setAddedIds(prev => new Set(prev).add(contest.id));
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('403')) {
        onLoginRequest(); // Trigger re-login
      }
      alert('Failed to add to calendar. See console.');
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const filteredContests = contests.filter(c => 
    filter === 'All' || c.platform === filter
  );

  const activeContests = contests.filter(c => isPast(c.startTime) && isFuture(new Date(c.startTime.getTime() + c.durationSeconds * 1000)));
  const upcomingContests = contests.filter(c => isFuture(c.startTime));
  
  // Find next major event (Codeforces or LeetCode preferred)
  const nextMajorEvent = upcomingContests.find(c => ['Codeforces', 'LeetCode'].includes(c.platform)) || upcomingContests[0];

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const getRelativeTime = (date: Date) => {
    const diffHours = differenceInHours(date, new Date());
    const diffDays = differenceInDays(date, new Date());
    if (diffHours < 24) {
      return `Starts in ${diffHours}h`;
    }
    return `Starts in ${diffDays}d`;
  };

  const getPlatformColors = (platform: string) => {
    switch(platform) {
      case 'Codeforces': return 'bg-red-500/10 text-[var(--cf-color)] border-red-500/20';
      case 'LeetCode': return 'bg-amber-500/10 text-[var(--lc-color)] border-amber-500/20';
      case 'CodeChef': return 'bg-purple-500/10 text-[var(--cc-color)] border-purple-500/20';
      case 'AtCoder': return 'bg-emerald-500/10 text-[var(--ac-color)] border-emerald-500/20';
      default: return 'bg-blue-500/10 text-[var(--accent-color)] border-blue-500/20';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Live Schedule</h2>
          <p className="text-slate-400 mt-1">Monitor active contests and upcoming rated rounds.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Platforms</option>
            <option value="Codeforces">Codeforces</option>
            <option value="LeetCode">LeetCode</option>
            <option value="CodeChef">CodeChef</option>
            <option value="AtCoder">AtCoder</option>
          </select>
          <button 
            className="p-2.5 bg-[var(--card-bg)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--card-border)] rounded-xl text-[var(--text-secondary)] transition-colors"
            onClick={loadContests} 
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-blue-400" : ""} />
          </button>
        </div>
      </div>

      {!localStorage.getItem('CLIST_KEY') && !import.meta.env.VITE_CLIST_KEY && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-5 py-3 rounded-xl flex items-center justify-between text-sm">
          <span>ℹ️ Configure your Clist.by API Key in the `.env` file to see LeetCode, CodeChef, and AtCoder contests.</span>
        </div>
      )}

      {/* Bento Analytics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl flex flex-col justify-between hover:border-[var(--text-secondary)] transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-semibold text-[var(--cf-color)] uppercase tracking-wider font-mono">Live Contests</span>
          </div>
          <div className="text-5xl font-heading font-bold text-[var(--text-primary)]">{activeContests.length.toString().padStart(2, '0')}</div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl flex flex-col justify-between hover:border-[var(--text-secondary)] transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-[var(--accent-color)]" />
            <span className="text-sm font-semibold text-[var(--accent-color)] uppercase tracking-wider font-mono">Upcoming</span>
          </div>
          <div className="text-5xl font-heading font-bold text-[var(--text-primary)]">{upcomingContests.length.toString().padStart(2, '0')}</div>
        </div>

        <div className="bg-gradient-to-br from-[var(--accent-color)]/10 to-[var(--cc-color)]/10 border border-[var(--accent-color)]/20 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 to-[var(--cc-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Zap className="w-4 h-4 text-[var(--lc-color)]" />
            <span className="text-sm font-semibold text-[var(--lc-color)] uppercase tracking-wider font-mono">Next Major Event</span>
          </div>
          {nextMajorEvent ? (
            <div className="relative z-10">
              <div className="text-lg font-bold text-[var(--text-primary)] mb-1 line-clamp-1" title={nextMajorEvent.name}>{nextMajorEvent.name}</div>
              <div className="text-sm text-[var(--text-secondary)] font-mono">{getRelativeTime(nextMajorEvent.startTime)} • {nextMajorEvent.platform}</div>
            </div>
          ) : (
            <div className="text-[var(--text-secondary)]">No major events scheduled.</div>
          )}
        </div>
      </div>

      {/* Unified Schedule Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
            <RefreshCw size={32} className="animate-spin mb-4 text-[var(--accent-color)]" />
            <p>Scanning global telemetry...</p>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-secondary)]">
            No scheduled events found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-black/5 dark:bg-black/20 text-xs uppercase tracking-widest text-[var(--text-secondary)] font-mono font-semibold">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Contest</th>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-sm">
                {filteredContests.map((contest, i) => {
                  const isActive = isPast(contest.startTime) && isFuture(new Date(contest.startTime.getTime() + contest.durationSeconds * 1000));
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      key={contest.id} 
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        {isActive ? (
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[var(--cf-color)] font-medium">LIVE</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-secondary)] font-medium">UPCOMING</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getPlatformColors(contest.platform)}`}>
                          {contest.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)] max-w-[300px]">
                        <div className="truncate" title={contest.name}>{contest.name}</div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] font-mono">
                        <div className="flex flex-col">
                          <span>{format(contest.startTime, 'MMM dd, HH:mm')}</span>
                          <span className="text-xs text-[var(--text-secondary)]/75">{!isActive && getRelativeTime(contest.startTime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)] font-mono">
                        {formatDuration(contest.durationSeconds)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <a 
                            href={contest.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                            title="Open Contest"
                          >
                            <ExternalLink size={16} />
                          </a>

                          <button 
                            onClick={() => onToggleSave(contest)}
                            className={`p-2 rounded-lg transition-colors ${
                              savedContests.some(c => c.id === contest.id) 
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                            title={savedContests.some(c => c.id === contest.id) ? "Remove from Library" : "Add to Library"}
                          >
                            <Bookmark size={16} className={savedContests.some(c => c.id === contest.id) ? "fill-current" : ""} />
                          </button>
                          
                          <select 
                            value={reminders[contest.id] || 30}
                            onChange={(e) => setReminders({...reminders, [contest.id]: Number(e.target.value)})}
                            className="bg-[var(--bg-color)] border border-[var(--card-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-blue-500"
                            disabled={addedIds.has(contest.id) || addingId === contest.id}
                          >
                            <option value={15}>15m</option>
                            <option value={30}>30m</option>
                            <option value={60}>1h</option>
                          </select>

                          <button 
                            onClick={() => handleAddCalendar(contest)}
                            disabled={addedIds.has(contest.id) || addingId === contest.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                              addedIds.has(contest.id) 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20'
                            }`}
                          >
                            {addingId === contest.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : addedIds.has(contest.id) ? (
                              <><CheckCircle size={14} /> Added</>
                            ) : (
                              <><CalendarPlus size={14} /> Sync</>
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
