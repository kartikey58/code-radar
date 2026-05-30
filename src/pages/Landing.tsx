import { Calendar as CalendarIcon, Trophy, Code } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

export function Landing({ onLogin }: LandingProps) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.15), transparent 40%)'
    }}>
      <nav style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-color), var(--cc-color))',
            padding: '0.6rem',
            borderRadius: '10px',
            display: 'flex'
          }}>
            <CalendarIcon size={24} color="white" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Code Radar
          </h1>
        </div>
        <button className="btn btn-primary" onClick={onLogin} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          Sign In
        </button>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(139, 92, 246, 0.1)', 
          border: '1px solid rgba(139, 92, 246, 0.2)',
          padding: '0.5rem 1rem', 
          borderRadius: '9999px',
          color: 'var(--accent-color)',
          fontWeight: 600,
          marginBottom: '2rem',
          fontSize: '0.875rem'
        }}>
          <Trophy size={16} /> The ultimate competitive programming dashboard
        </div>
        
        <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Never miss a <span className="text-gradient">coding contest</span> again.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', lineHeight: 1.6 }}>
          Track your progress, sync upcoming contests to your calendar, and view all your competitive programming stats in one beautiful dashboard.
        </p>

        <button className="btn btn-primary" onClick={onLogin} style={{ padding: '1rem 2.5rem', fontSize: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)' }}>
          <Code size={24} /> Get Started Now
        </button>
      </main>
    </div>
  );
}
