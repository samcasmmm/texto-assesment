import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getCurrentUser } from '@/lib/auth';
import { format } from 'date-fns';
import Employee from '@/models/Employee';

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser(req);
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const attendance = await Attendance.findOne({
      userId: user.userId,
      date: today,
      checkOut: { $exists: false },
    });

    await Employee.findOneAndUpdate(
      { _id: user.userId, working: true },
      { $set: { working: false } },
      { new: true },
    );

    if (!attendance)
      return NextResponse.json(
        { error: 'No active attendance record' },
        { status: 404 },
      );

    attendance.checkOut = new Date();
    attendance.status = 'checked-out';
    await attendance.save();

    return NextResponse.json({ success: true, checkOut: attendance.checkOut });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check-out' }, { status: 500 });
  }
}
