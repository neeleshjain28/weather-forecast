import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbMode } from '../config/db.js';
import Favorite from '../models/Favorite.js';
import History from '../models/History.js';
import Message from '../models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, '../data/local_db.json');

async function readLocalDb() {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    try {
      const data = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch {
      const defaultDb = { favorites: [], searchHistory: [], chatHistory: [] };
      await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return { favorites: [], searchHistory: [], chatHistory: [] };
  }
}

async function writeLocalDb(data) {
  try {
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local JSON db:', err);
  }
}

export const dbService = {
  getFavorites: async () => {
    if (!getDbMode()) {
      return await Favorite.find().sort({ addedAt: -1 });
    } else {
      const db = await readLocalDb();
      return db.favorites;
    }
  },

  addFavorite: async ({ cityName, lat, lon, country }) => {
    if (!getDbMode()) {
      const fav = new Favorite({ cityName, lat, lon, country });
      return await fav.save();
    } else {
      const db = await readLocalDb();
      const existing = db.favorites.find(f => f.cityName.toLowerCase() === cityName.toLowerCase());
      if (existing) return existing;

      const newFav = {
        _id: Date.now().toString(),
        cityName,
        lat,
        lon,
        country,
        addedAt: new Date().toISOString()
      };
      db.favorites.unshift(newFav);
      await writeLocalDb(db);
      return newFav;
    }
  },

  removeFavorite: async (id) => {
    if (!getDbMode()) {
      return await Favorite.findByIdAndDelete(id);
    } else {
      const db = await readLocalDb();
      db.favorites = db.favorites.filter(f => f._id !== id);
      await writeLocalDb(db);
      return { success: true };
    }
  },

  getSearchHistory: async () => {
    if (!getDbMode()) {
      return await History.find().sort({ timestamp: -1 }).limit(20);
    } else {
      const db = await readLocalDb();
      return db.searchHistory.slice(0, 20);
    }
  },

  addSearchHistory: async ({ query, lat, lon, country }) => {
    if (!getDbMode()) {
      await History.deleteMany({ query: { $regex: new RegExp(`^${query}$`, 'i') } });
      const record = new History({ query, lat, lon, country });
      return await record.save();
    } else {
      const db = await readLocalDb();
      db.searchHistory = db.searchHistory.filter(h => h.query.toLowerCase() !== query.toLowerCase());
      const newRecord = {
        _id: Date.now().toString(),
        query,
        lat,
        lon,
        country,
        timestamp: new Date().toISOString()
      };
      db.searchHistory.unshift(newRecord);
      await writeLocalDb(db);
      return newRecord;
    }
  },

  clearSearchHistory: async () => {
    if (!getDbMode()) {
      return await History.deleteMany({});
    } else {
      const db = await readLocalDb();
      db.searchHistory = [];
      await writeLocalDb(db);
      return { success: true };
    }
  },

  getChatHistory: async () => {
    if (!getDbMode()) {
      return await Message.find().sort({ timestamp: 1 }).limit(50);
    } else {
      const db = await readLocalDb();
      return db.chatHistory.slice(-50);
    }
  },

  addChatMessage: async ({ role, content }) => {
    if (!getDbMode()) {
      const msg = new Message({ role, content });
      return await msg.save();
    } else {
      const db = await readLocalDb();
      const newMsg = {
        _id: Date.now().toString(),
        role,
        content,
        timestamp: new Date().toISOString()
      };
      db.chatHistory.push(newMsg);
      await writeLocalDb(db);
      return newMsg;
    }
  },

  clearChatHistory: async () => {
    if (!getDbMode()) {
      return await Message.deleteMany({});
    } else {
      const db = await readLocalDb();
      db.chatHistory = [];
      await writeLocalDb(db);
      return { success: true };
    }
  }
};
