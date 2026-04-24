import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LocationLog from '@/models/LocationLog';
import mongoose from 'mongoose';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { format } from 'date-fns';

const shouldAddPoint = (last: Date, now: Date) => {
  return now.getTime() - new Date(last).getTime() >= 2 * 60 * 1000;
};

export async function GET(req: Request) {
  await dbConnect();

  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');

  const query: any = {};

  if (isAdmin(user)) {
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }
  } else {
    query.userId = new mongoose.Types.ObjectId(user.userId);
  }

  if (date) query.date = date;

  const logs = await LocationLog.find(query)
    .populate('userId', 'name role')
    .lean();

  return NextResponse.json({
    success: true,
    data: logs,
  });
}

export async function POST(req: Request) {
  await dbConnect();

  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { attendanceId, coordinates, timestamp } = await req.json();

    if (!coordinates) {
      return NextResponse.json(
        { error: 'Coordinates required' },
        { status: 400 },
      );
    }

    const now = timestamp ? new Date(timestamp) : new Date();
    const date = format(now, 'yyyy-MM-dd');

    const existing = await LocationLog.findOne({
      userId: user.userId,
      date,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Log already exists. Use PATCH to update.' },
        { status: 400 },
      );
    }

    const log = await LocationLog.create({
      userId: user.userId,
      attendanceId: attendanceId || new mongoose.Types.ObjectId(),
      date,
      locations: [
        {
          coordinates: { type: 'Point', coordinates },
          timestamp: now,
        },
      ],
    });

    return NextResponse.json(
      { success: true, logId: log._id },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST error:', error);

    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 400 },
    );
  }
}

export async function PATCH(req: Request) {
  await dbConnect();

  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { coordinates, timestamp } = await req.json();

    if (!coordinates) {
      return NextResponse.json(
        { error: 'Coordinates required' },
        { status: 400 },
      );
    }

    const now = timestamp ? new Date(timestamp) : new Date();
    const date = format(now, 'yyyy-MM-dd');

    const log = await LocationLog.findOne({
      userId: user.userId,
      date,
    });

    if (!log) {
      return NextResponse.json(
        { error: 'No log found. Use POST first.' },
        { status: 404 },
      );
    }

    const lastLocation = log.locations[log.locations.length - 1];

    const allowUpdate =
      !lastLocation || shouldAddPoint(lastLocation.timestamp, now);

    if (allowUpdate) {
      log.locations.push({
        coordinates: { type: 'Point', coordinates },
        timestamp: now,
      });

      await log.save();
    }

    return NextResponse.json({
      success: true,
      updated: allowUpdate,
    });
  } catch (error) {
    console.error('PATCH error:', error);

    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 400 },
    );
  }
}
