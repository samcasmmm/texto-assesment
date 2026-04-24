import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  const query: any = {};
  if (date) query.date = date;
  if (status) query.status = status;

  // If not admin, restrict to own records
  if (!isAdmin(user)) {
    query.userId = user.userId;
  }

  try {
    const attendance = await Attendance.find(query).populate(
      'userId',
      'name email role',
    );
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Regular users can only check-in for themselves
    if (!isAdmin(user)) {
      data.userId = user.userId;
    }

    const attendance = await Attendance.create(data);
    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 400 },
    );
  }
}
