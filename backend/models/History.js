import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  query: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  country: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.History || mongoose.model('History', HistorySchema);
