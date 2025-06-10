const express = require('express');
const app = express();
const port = 3000;

// JSONP endpoint
app.get('/jsonp-endpoint', (req, res) => {
  // Get the callback function name from the query string
  const callback = req.query.callback;

  // Hardcoded JSON object
  const responseData = { status: 'ok' };

  if (callback) {
    // Respond with the JSON object wrapped in the callback function
    res.type('text/javascript'); // Set the response type to JavaScript
    res.send(`${callback}(${JSON.stringify(responseData)})`);
  } else {
    // If no callback is provided, respond with an error
    res.status(400).json({ error: 'Callback parameter is required' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`JSONP endpoint running at http://localhost:${port}/jsonp-endpoint`);
});