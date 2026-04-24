import { Schema, model, models } from 'mongoose';

const GeoFenceSchema = new Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radius: { type: Number, required: true }, // in meters
}, { timestamps: true });

export default models.GeoFence || model('GeoFence', GeoFenceSchema);
