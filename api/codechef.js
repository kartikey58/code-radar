export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const response = await fetch(`https://www.codechef.com/users/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch CodeChef profile' });
    }

    const html = await response.text();
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
