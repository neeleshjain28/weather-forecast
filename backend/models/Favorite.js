import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  cityName: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  country: { type: String },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
