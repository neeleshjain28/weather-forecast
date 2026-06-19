import express from 'express';
import { dbService } from '../services/dbService.js';

const router = express.Router();

// GET search history
router.get('/', async (req, res) => {
  try {
    const list = await dbService.getSearchHistory();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE clear search history
router.delete('/', async (req, res) => {
  try {
    await dbService.clearSearchHistory();
    res.json({ success: true, message: 'Search history cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
