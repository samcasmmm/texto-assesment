import { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, default: 'password' },
  },
  { timestamps: true },
);

export default models.Employee || model('Employee', EmployeeSchema);
