export default async function handler(req, res) {
  // Extract query parameters to forward to the football API
  const searchParams = new URLSearchParams(req.query).toString();
  const url = `https://api.football-data.org/v4/matches?${searchParams}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY
      }
    });
    
    const data = await response.json();
    
    // Set CORS headers so the browser accepts the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
