import { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, default: 'password' },
    working: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default models.Employee || model('Employee', EmployeeSchema);
