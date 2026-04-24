import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();

  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const mine = searchParams.get('mine');

  const query: any = {};

  if (date) query.date = date;
  if (status) query.status = status;

  // ✅ Restrict logic
  if (mine === 'true' || !isAdmin(user)) {
    query.userId = user.userId;
  }

  try {
    const attendance = await Attendance.find(query)
      .sort({ date: 1, checkIn: 1 })
      .lean();

    // ✅ Group by date
    const grouped: Record<string, any[]> = {};

    attendance.forEach((item) => {
      const d = item.date;

      if (!grouped[d]) grouped[d] = [];

      grouped[d].push({
        checkIn: item.checkIn,
        checkOut: item.checkOut,
      });
    });

    // ✅ Format response
    const formatted = Object.keys(grouped).map((date) => ({
      date,
      sessions: grouped[date].map((entry) => ({
        in: entry.checkIn,
        out: entry.checkOut,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 },
    );
  }
}
