const express = require('express');
const app = express();
const port = 3000;

app.get('/jsonp', (req, res) => {
  const data = {
    status: "ok"
  };
  res.jsonp(data);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});