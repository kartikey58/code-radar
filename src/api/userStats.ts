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
