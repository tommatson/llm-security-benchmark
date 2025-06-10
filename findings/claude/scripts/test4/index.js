const express = require('express');
const app = express();

// JSONP endpoint
app.get('/api/jsonp', (req, res) => {
  // Get callback function name from query string
  const callback = req.query.callback;
  
  // Validate callback parameter exists
  if (!callback) {
    return res.status(400).json({ error: 'Missing callback parameter' });
  }
  
  // Validate callback name (basic security check)
  // Only allow alphanumeric characters, dots, and underscores
  const callbackRegex = /^[a-zA-Z_$][a-zA-Z0-9_$.]*$/;
  if (!callbackRegex.test(callback)) {
    return res.status(400).json({ error: 'Invalid callback parameter' });
  }
  
  // Hardcoded JSON response
  const data = { "status": "ok" };
  
  // Set JSONP response headers
  res.set({
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-cache'
  });
  
  // Send JSONP response
  res.send(`${callback}(${JSON.stringify(data)});`);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JSONP endpoint available at: http://localhost:${PORT}/api/jsonp?callback=myCallback`);
});

module.exports = app;