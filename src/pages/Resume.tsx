import { useState, useEffect } from 'react';
import { FileText, Copy, Check, Download, Loader2 } from 'lucide-react';
import { fetchLeetCodeStats, fetchCodeforcesStats, fetchGitHubStats, fetchCodeChefStats } from '../api/userStats';

export function Resume() {
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateResume();
  }, []);

  const generateResume = async () => {
    setLoading(true);
    
    const lcUser = localStorage.getItem('LEETCODE_USERNAME');
    const cfUser = localStorage.getItem('CODEFORCES_USERNAME') || localStorage.getItem('LEETCODE_USERNAME'); // Fallback if they use same
    const ghUser = localStorage.getItem('GITHUB_USERNAME');
    const ccUser = localStorage.getItem('CODECHEF_USERNAME');

    try {
      const [lc, cf, gh, cc] = await Promise.all([
        lcUser ? fetchLeetCodeStats(lcUser) : null,
        cfUser ? fetchCodeforcesStats(cfUser) : null,
        ghUser ? fetchGitHubStats(ghUser) : null,
        ccUser ? fetchCodeChefStats(ccUser) : null
      ]);

      let text = '';
      text += '============================================================\n';
      text += '  CODING PROFILES — RESUME READY\n';
      text += `  Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}\n`;
      text += '============================================================\n';

      if (lc) {
        text += '\n📌 COMPETITIVE PROGRAMMING (LeetCode)\n';
        text += `  • Solved ${lc.problemsSolved.total} problems (Easy: ${lc.problemsSolved.easy}, Medium: ${lc.problemsSolved.medium}, Hard: ${lc.problemsSolved.hard})\n`;
        if (lc.currentRating) {
          text += `  • Contest Rating: ${lc.currentRating}\n`;
        }
        if (lc.contestsAttended) {
          text += `  • Participated in ${lc.contestsAttended} contests\n`;
        }
        
        text += '\n  ✏️  Resume bullet (copy-paste):\n';
        text += `  Solved ${lc.problemsSolved.total}+ problems on LeetCode (Medium: ${lc.problemsSolved.medium}, Hard: ${lc.problemsSolved.hard}); `;
        if (lc.currentRating) {
          text += `Contest rating ${lc.currentRating}.\n`;
        } else {
          text += `Active problem solver.\n`;
        }
      }

      if (cf) {
        text += '\n📌 COMPETITIVE PROGRAMMING (Codeforces)\n';
        text += `  • Handle: ${cfUser}\n`;
        text += `  • Current Rating: ${cf.currentRating}\n`;
        text += `  • Max Rating: ${cf.maxRating}\n`;
        text += `  • Problems solved: ${cf.problemsSolved.total}\n`;
        text += `  • Contests participated: ${cf.contestsAttended}\n`;

        text += '\n  ✏️  Resume bullet (copy-paste):\n';
        text += `  Codeforces rating ${cf.maxRating}; solved ${cf.problemsSolved.total}+ problems across ${cf.contestsAttended} rated contests.\n`;
      }

      if (cc) {
        text += '\n📌 COMPETITIVE PROGRAMMING (CodeChef)\n';
        text += `  • Handle: ${ccUser}\n`;
        text += `  • Current Rating: ${cc.currentRating}\n`;
        text += `  • Max Rating: ${cc.maxRating}\n`;
        text += `  • Fully Solved: ${cc.problemsSolved.total}\n`;
        text += `  • Contests participated: ${cc.contestsAttended}\n`;

        text += '\n  ✏️  Resume bullet (copy-paste):\n';
        text += `  CodeChef highest rating ${cc.maxRating}; fully solved ${cc.problemsSolved.total}+ problems.\n`;
      }

      if (gh) {
        text += '\n📌 OPEN SOURCE / GITHUB\n';
        text += `  • Public repositories: ${gh.publicRepos}\n`;
        text += `  • Total stars earned:  ${gh.totalStars}\n`;
        text += `  • Followers:           ${gh.followers}\n`;
        if (gh.topLanguage) {
          text += `  • Primary Language:    ${gh.topLanguage}\n`;
        }

        if (gh.recentRepos && gh.recentRepos.length > 0) {
          text += '\n  Top repositories:\n';
          gh.recentRepos.slice(0, 3).forEach(r => {
            text += `    ★ ${r.stars}  ${r.name} (${r.language})\n`;
            text += `       ${r.url}\n`;
          });
        }

        text += '\n  ✏️  Resume bullet (copy-paste):\n';
        text += `  Active GitHub profile with ${gh.publicRepos} repositories and ${gh.totalStars} stars, primarily coding in ${gh.topLanguage || 'multiple languages'}.\n`;
      }

      text += '\n============================================================\n';
      text += '  PROFILE LINKS\n';
      text += '============================================================\n';
      if (lcUser) text += `  LeetCode:   https://leetcode.com/${lcUser}\n`;
      if (cfUser) text += `  Codeforces: https://codeforces.com/profile/${cfUser}\n`;
      if (ccUser) text += `  CodeChef:   https://www.codechef.com/users/${ccUser}\n`;
      if (ghUser) text += `  GitHub:     https://github.com/${ghUser}\n`;
      text += '============================================================\n';

      setResumeText(text);
    } catch (error) {
      console.error("Failed to generate resume", error);
      setResumeText("Error fetching data. Please ensure your usernames are set in your Profile.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([resumeText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `resume_coding_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={28} color="var(--accent-color)" />
            Resume Generator
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
            Instantly turn your live competitive programming stats into resume-ready bullet points.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={generateResume} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? <Loader2 size={18} className="spinner" /> : <FileText size={18} />}
          Regenerate
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Toolbar */}
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          padding: '0.75rem 1.5rem', 
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={copyToClipboard}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              title="Copy to clipboard"
            >
              {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={downloadTxt}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              title="Download as .txt"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div style={{ padding: '2rem', background: '#0d1117', minHeight: '400px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)' }}>
              <Loader2 size={48} className="spinner" style={{ marginBottom: '1rem', color: 'var(--accent-color)' }} />
              <p>Extracting your coding profiles...</p>
            </div>
          ) : (
            <pre style={{ 
              margin: 0, 
              color: '#c9d1d9', 
              fontFamily: '"Fira Code", "Consolas", monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {resumeText || "No stats found. Please fill out your profile usernames."}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
