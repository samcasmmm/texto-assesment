import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    const query: any = { date };
    if (!isAdmin(user)) {
      query.userId = user.userId;
    }

    const attendanceRecords = await Attendance.find(query).populate(
      'userId',
      'name email role',
    );

    // Summary logic
    let summary;
    if (isAdmin(user)) {
      const totalEmployees = await Employee.countDocuments();
      const checkedIn = attendanceRecords.filter((r) => r.checkIn).length;
      const late = attendanceRecords.filter((r) => r.status === 'late').length;

      summary = {
        totalEmployees,
        checkedIn,
        late,
        absent: totalEmployees - checkedIn,
      };
    } else {
      // User specific summary
      const record = attendanceRecords[0];
      summary = {
        status: record?.status || 'absent',
        checkIn: record?.checkIn || null,
        checkOut: record?.checkOut || null,
      };
    }

    return NextResponse.json({
      date,
      summary,
      records: attendanceRecords,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    );
  }
}
