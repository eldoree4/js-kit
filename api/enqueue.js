export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform, message, target } = req.body || {};

  if (!platform || !message || !target) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  return res.status(200).json({
    success: true,
    message: `Broadcast scheduled to ${platform} target: ${target}`
  });
}
