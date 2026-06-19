import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import weatherRouter from './routes/weather.js';
import favoritesRouter from './routes/favorites.js';
import historyRouter from './routes/history.js';
import chatRouter from './routes/chat.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'UptoWeather Backend is running smoothly' });
});

// Routes
app.use('/api/weather', weatherRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/history', historyRouter);
app.use('/api/chat', chatRouter);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  // All other GET requests should return the index.html (for client-side routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Connect database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 UptoWeather Server active on port ${PORT}`);
  });
}).catch(err => {
  console.error('Critical database initialization error:', err);
  process.exit(1);
});
