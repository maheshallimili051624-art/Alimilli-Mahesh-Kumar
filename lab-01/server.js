const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Home route
app.get('/', (req, res) => {
  res.status(200).send('Welcome to BDF Lab 1 - Node.js and Express Server!');
});

// About route
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'Alimilli Mahesh Kumar',
    section: 'CSE - CORE(223)'
  });
});

// Time route
app.get('/time', (req, res) => {
  res.status(200).send(new Date().toString());
});

// Unknown routes
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});