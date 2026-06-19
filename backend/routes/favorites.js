import express from 'express';
import { dbService } from '../services/dbService.js';

const router = express.Router();

// GET all favorites
router.get('/', async (req, res) => {
  try {
    const list = await dbService.getFavorites();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new favorite
router.post('/', async (req, res) => {
  const { cityName, lat, lon, country } = req.body;
  if (!cityName || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Missing cityName, lat, or lon' });
  }

  try {
    const item = await dbService.addFavorite({ cityName, lat, lon, country });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a favorite
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbService.removeFavorite(id);
    res.json({ success: true, message: 'Removed from favorites', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
