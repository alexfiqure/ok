const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    bot: 'ISLAMICK BOT - Running'
  });
});

// Start health check server
app.listen(port, () => {
  console.log(`Health check server running on port ${port}`);
});
