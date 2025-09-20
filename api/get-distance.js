import axios from 'axios';

export default async function handler(req, res) {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Missing `from` or `to` parameter.' });
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(from)}&destinations=${encodeURIComponent(to)}&key=${apiKey}`;

    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
      return res.status(500).json({ error: response.data.error_message || 'Google API error' });
    }

    const meters = response.data.rows[0].elements[0].distance.value;
    const miles = meters / 1609.34;

    res.status(200).json({ miles });
  } catch (e) {
    console.error('Distance fetch error:', e.message);
    res.status(500).json({ error: 'Server error fetching distance' });
  }
}