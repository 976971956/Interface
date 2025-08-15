module.exports = (req, res) => {
  console.log('Test function called:', req.method, req.url);
  
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    message: 'Test API function is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}; 