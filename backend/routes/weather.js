import express from 'express';
import { weatherService } from '../services/weatherService.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

// Search weather by city name
router.get('/search', async (req, res) => {
  const { city } = req.query;

  if (!city || city.trim().length === 0) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const locations = await weatherService.geocodeCity(city);
    const primaryLoc = locations[0]; // Take the best match

    const { name, latitude, longitude, country, timezone } = primaryLoc;

    const weatherData = await weatherService.getWeatherData(latitude, longitude, timezone);
    
    const responseData = {
      cityName: name,
      country: country || '',
      latitude,
      longitude,
      timezone,
      ...weatherData
    };

    // Save to search history asynchronously
    dbService.addSearchHistory({
      query: city,
      lat: latitude,
      lon: longitude,
      country: country || ''
    }).catch(err => console.error('Failed to log search history:', err.message));

    res.json(responseData);
  } catch (error) {
    console.error(`Search error for "${city}":`, error.message);
    res.status(500).json({ error: error.message || 'Failed to retrieve weather data' });
  }
});

// Search weather by coordinate (e.g., auto-detect GPS location)
router.get('/coords', async (req, res) => {
  const { lat, lon, name } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const cityName = name || `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
    const timezone = 'auto';

    const weatherData = await weatherService.getWeatherData(latitude, longitude, timezone);
    
    const responseData = {
      cityName,
      country: '',
      latitude,
      longitude,
      timezone,
      ...weatherData
    };

    // Log to history
    dbService.addSearchHistory({
      query: cityName,
      lat: latitude,
      lon: longitude,
      country: ''
    }).catch(err => console.error('Failed to log search history:', err.message));

    res.json(responseData);
  } catch (error) {
    console.error(`Coords error (${lat}, ${lon}):`, error.message);
    res.status(500).json({ error: error.message || 'Failed to retrieve weather data' });
  }
});

export default router;
