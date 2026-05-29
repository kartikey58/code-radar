import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, GitBranch, Code, Code2 } from 'lucide-react';

interface OnboardingProps {
  userEmail: string;
  userName: string;
  onComplete: () => void;
}

export function Onboarding({ userEmail, userName, onComplete }: OnboardingProps) {
  const [githubId, setGithubId] = useState(localStorage.getItem('GITHUB_USERNAME') || '');
  const [leetcodeId, setLeetcodeId] = useState(localStorage.getItem('LEETCODE_USERNAME') || '');
  const [codechefId, setCodechefId] = useState(localStorage.getItem('CODECHEF_USERNAME') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/user-profile', {
        name: userName,
        githubId,
        leetcodeId,
        codechefId
      }, {
        headers: {
          'x-user-email': userEmail
        }
      });
      
      // Save locally to use immediately
      if (githubId) localStorage.setItem('GITHUB_USERNAME', githubId);
      if (leetcodeId) localStorage.setItem('LEETCODE_USERNAME', leetcodeId);
      if (codechefId) localStorage.setItem('CODECHEF_USERNAME', codechefId);

      onComplete();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile to AWS RDS. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', 
          background: 'var(--accent-color)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 1.5rem' 
        }}>
          <User size={32} color="white" />
        </div>
        
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Welcome, {userName}!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Let's set up your Code Radar profile. Connect your accounts to track your progress and see all your contests in one place.
        </p>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          
          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitBranch size={16} /> GitHub Username
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. torvalds" 
              value={githubId}
              onChange={(e) => setGithubId(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={16} color="var(--lc-color)" /> LeetCode Username
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. tourist" 
              value={leetcodeId}
              onChange={(e) => setLeetcodeId(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={16} color="var(--cc-color)" /> CodeChef Username
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. genady" 
              value={codechefId}
              onChange={(e) => setCodechefId(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Setup & Save to Database'}
          </button>
        </form>
      </div>
    </div>
  );
}
