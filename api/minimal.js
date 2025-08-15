module.exports = (req, res) => {
  console.log('Minimal function called:', req.method, req.url);
  
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    message: 'Minimal function works!',
    timestamp: new Date().toISOString()
  });
}; 