import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LocationLog from '@/models/LocationLog';
import mongoose from 'mongoose';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date'); // yyyy-mm-dd

  const query: any = {};
  
  if (isAdmin(user)) {
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }
  } else {
    // Regular user only sees their own
    query.userId = new mongoose.Types.ObjectId(user.userId);
  }
  
  if (date) query.date = date;

  const logs = await LocationLog.find(query).populate('userId', 'name role').lean();

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { attendanceId, coordinates, timestamp } = await req.json();
    const date = format(new Date(), 'yyyy-MM-dd');

    // Find or create the daily log for this user
    let log = await LocationLog.findOne({ userId: user.userId, date });

    const newPoint = {
      coordinates: { type: 'Point', coordinates: coordinates },
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    if (log) {
      log.locations.push(newPoint);
      if (attendanceId) log.attendanceId = attendanceId;
      await log.save();
    } else {
      log = await LocationLog.create({
        userId: user.userId,
        attendanceId: attendanceId || new mongoose.Types.ObjectId(), // Fallback if no attendanceId
        date,
        locations: [newPoint],
      });
    }

    return NextResponse.json({ success: true, logId: log._id }, { status: 201 });
  } catch (error) {
    console.error('POST Location Log Error:', error);
    return NextResponse.json({ error: 'Failed to log location' }, { status: 400 });
  }
}
