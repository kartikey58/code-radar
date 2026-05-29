import axios from 'axios';

export interface RatingHistory {
  name: string; // e.g., contest name or date
  rating: number;
  timestamp: number;
}

export interface UserStats {
  platform: string;
  username: string;
  currentRating: number;
  maxRating: number;
  contestsAttended: number;
  problemsSolved: {
    easy?: number;
    medium?: number;
    hard?: number;
    total: number;
  };
  ratingHistory: RatingHistory[];
}

export async function fetchCodeforcesStats(username: string): Promise<UserStats | null> {
  if (!username) return null;
  try {
    const [infoRes, ratingRes] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${username}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${username}`)
    ]);

    if (infoRes.data.status !== 'OK' || ratingRes.data.status !== 'OK') return null;

    const info = infoRes.data.result[0];
    const history = ratingRes.data.result;

    return {
      platform: 'Codeforces',
      username,
      currentRating: info.rating || 0,
      maxRating: info.maxRating || 0,
      contestsAttended: history.length,
      problemsSolved: {
        total: 0 // CF API doesn't easily provide total solved without scraping or large status queries
      },
      ratingHistory: history.map((h: any) => ({
        name: h.contestName,
        rating: h.newRating,
        timestamp: h.ratingUpdateTimeSeconds * 1000
      }))
    };
  } catch (err) {
    console.error('Codeforces Stats Error', err);
    return null;
  }
}

export async function fetchLeetCodeStats(username: string): Promise<UserStats | null> {
  if (!username) return null;
  try {
    // We use a community API to avoid CORS issues with direct LeetCode GraphQL calls from browser
    const [profileRes, contestRes, solvedRes] = await Promise.all([
      axios.get(`https://alfa-leetcode-api.onrender.com/${username}`),
      axios.get(`https://alfa-leetcode-api.onrender.com/${username}/contest`),
      axios.get(`https://alfa-leetcode-api.onrender.com/${username}/solved`)
    ]);

    const profile = profileRes.data;
    const contest = contestRes.data;
    const solved = solvedRes.data;

    const history = contest.contestParticipation || [];

    return {
      platform: 'LeetCode',
      username,
      currentRating: Math.round(profile.contestRating || history.length > 0 ? history[history.length - 1].rating : 0),
      maxRating: history.length > 0 ? Math.max(...history.map((h: any) => h.rating)) : 0,
      contestsAttended: history.length,
      problemsSolved: {
        easy: solved.easySolved || 0,
        medium: solved.mediumSolved || 0,
        hard: solved.hardSolved || 0,
        total: solved.solvedProblem || 0
      },
      ratingHistory: history.map((h: any) => ({
        name: h.contest.title,
        rating: Math.round(h.rating),
        timestamp: h.contest.startTime * 1000
      }))
    };
  } catch (err) {
    console.error('LeetCode Stats Error', err);
    return null;
  }
}

export async function fetchCodeChefStats(username: string): Promise<UserStats | null> {
  if (!username) return null;
  try {
    const res = await axios.get(`/api/codechef?username=${username}`);
    const html = res.data;
    
    // Extract rating history
    const match = html.match(/var all_rating = (\[.*?\]);/);
    let history: any[] = [];
    if (match) {
      history = JSON.parse(match[1]);
    }
    
    // Extract current rating
    const ratingMatch = html.match(/<div class="rating-number">(\d+)\?*<\/div>/);
    const currentRating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    
    // Extract fully solved
    const solvedMatch = html.match(/<h3>Fully Solved \s*\((\d+)\)<\/h3>/);
    const totalSolved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

    return {
      platform: 'CodeChef',
      username,
      currentRating,
      maxRating: history.length > 0 ? Math.max(...history.map((h: any) => parseInt(h.rating))) : currentRating,
      contestsAttended: history.length,
      problemsSolved: {
        total: totalSolved
      },
      ratingHistory: history.map((h: any) => {
        const dateStr = `${h.getyear}-${h.getmonth}-${h.getday}`;
        return {
          name: h.name,
          rating: parseInt(h.rating),
          timestamp: new Date(dateStr).getTime()
        };
      })
    };
  } catch (err) {
    console.error('CodeChef Stats Error', err);
    return null;
  }
}

export interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
}

export interface GitHubStats {
  platform: 'GitHub';
  username: string;
  avatarUrl: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  topLanguage: string;
  recentRepos: GitHubRepo[];
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  if (!username) return null;
  try {
    const [profileRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
    ]);

    const profile = profileRes.data;
    const repos = reposRes.data || [];

    // Calculate total stars
    const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0);

    // Calculate top language
    const languageCounts: { [key: string]: number } = {};
    repos.forEach((repo: any) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });
    let topLanguage = 'None';
    let maxCount = 0;
    for (const lang in languageCounts) {
      if (languageCounts[lang] > maxCount) {
        maxCount = languageCounts[lang];
        topLanguage = lang;
      }
    }

    // Get top 5 repos sorted by stars, fallback to updated
    const sortedRepos = [...repos].sort((a: any, b: any) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    const recentRepos: GitHubRepo[] = sortedRepos.slice(0, 5).map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'No description provided.',
      stars: repo.stargazers_count || 0,
      language: repo.language || 'Plain Text',
      url: repo.html_url
    }));

    return {
      platform: 'GitHub',
      username,
      avatarUrl: profile.avatar_url,
      name: profile.name || username,
      bio: profile.bio || 'No bio available.',
      publicRepos: profile.public_repos || 0,
      followers: profile.followers || 0,
      following: profile.following || 0,
      totalStars,
      topLanguage,
      recentRepos
    };
  } catch (err) {
    console.error('GitHub Stats Error', err);
    return null;
  }
}

