import { Schema, model, models } from 'mongoose';

const LocationPointSchema = new Schema(
  {
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    timestamp: { type: Date, required: true },
  },
  { _id: false },
);

const LocationLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    attendanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Attendance',
      required: true,
    },

    date: { type: String, required: true },

    locations: [LocationPointSchema],
  },
  { timestamps: true },
);

LocationLogSchema.index({ userId: 1, date: 1 });

export default models.LocationLog || model('LocationLog', LocationLogSchema);
