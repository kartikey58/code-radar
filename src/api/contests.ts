import axios from 'axios';

export interface Contest {
  id: string;
  name: string;
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef' | 'AtCoder';
  startTime: Date;
  durationSeconds: number;
  url: string;
}

export async function fetchCodeforces(): Promise<Contest[]> {
  try {
    const res = await axios.get('https://codeforces.com/api/contest.list');
    if (res.data.status !== 'OK') return [];
    
    return res.data.result
      .filter((c: any) => c.phase === 'BEFORE')
      .map((c: any) => ({
        id: `cf-${c.id}`,
        name: c.name,
        platform: 'Codeforces',
        startTime: new Date(c.startTimeSeconds * 1000),
        durationSeconds: c.durationSeconds,
        url: `https://codeforces.com/contest/${c.id}`
      }));
  } catch (err) {
    console.error('Codeforces API Error', err);
    return [];
  }
}


export async function fetchClist(username: string, apiKey: string, resourceIds: number[]): Promise<Contest[]> {
  if (!username || !apiKey) return [];
  
  try {
    const params = new URLSearchParams({
      format: 'json',
      order_by: 'start',
      start__gte: new Date().toISOString(),
      resource_id__in: resourceIds.join(','),
      limit: '100'
    });

    const res = await axios.get(`https://clist.by/api/v1/contest/?${params.toString()}`, {
      headers: {
        Authorization: `ApiKey ${username}:${apiKey}`
      }
    });

    return res.data.objects.map((c: any) => {
      let platform: Contest['platform'] = 'Codeforces';
      const rName = c.resource.name.toLowerCase();
      if (rName.includes('codechef')) platform = 'CodeChef';
      else if (rName.includes('atcoder')) platform = 'AtCoder';
      else if (rName.includes('leetcode')) platform = 'LeetCode';
      else if (rName.includes('codeforces')) platform = 'Codeforces';
      
      return {
        id: `clist-${c.id}`,
        name: c.event,
        platform,
        startTime: new Date(c.start.endsWith('Z') ? c.start : `${c.start}Z`),
        durationSeconds: c.duration,
        url: c.href
      };
    });
  } catch (err) {
    console.error('Clist API Error', err);
    return [];
  }
}

export async function fetchAllContests(clistUser: string, clistKey: string): Promise<Contest[]> {
  // We fetch Codeforces directly as it's reliable and doesn't have CORS issues usually.
  // We fetch LeetCode, CodeChef, and AtCoder via Clist to avoid CORS (LeetCode) and use a unified API.
  // Clist Resource IDs: 1: Codeforces, 2: CodeChef, 93: AtCoder, 102: LeetCode
  const [cf, clist] = await Promise.all([
    fetchCodeforces(),
    fetchClist(clistUser, clistKey, [102, 2, 93]).catch(() => []) 
  ]);

  // Combine and sort
  const all = [...cf, ...clist];
  all.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Deduplicate by name and platform
  const unique = [];
  const seen = new Set();
  for (const c of all) {
    const key = `${c.platform}-${c.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(c);
    }
  }
  return unique;
}
