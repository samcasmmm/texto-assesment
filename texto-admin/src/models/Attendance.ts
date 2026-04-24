import { Schema, model, models } from 'mongoose';

const AttendanceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ['on-time', 'late', 'absent', 'checked-out'],
      default: 'absent',
    },
    lateByMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default models.Attendance || model('Attendance', AttendanceSchema);
