export default function handler(req, res) {
  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: 'Missing jobId' });
  }

  return res.status(200).json({
    jobId,
    status: 'completed',
    delivered: true,
  });
}
