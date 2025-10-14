export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { businessName, email } = req.body || {};

  if (!businessName || !email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  return res.status(200).json({
    success: true,
    message: `Business ${businessName} registered successfully.`,
  });
}
