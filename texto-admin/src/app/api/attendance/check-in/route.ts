import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import GeoFence from '@/models/GeoFence';
import { getCurrentUser } from '@/lib/auth';
import { format } from 'date-fns';
import Employee from '@/models/Employee';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: Request) {
  await dbConnect();

  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and Longitude required' },
        { status: 400 },
      );
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    await Employee.findOneAndUpdate(
      { _id: user.userId, working: { $ne: true } },
      { $set: { working: true } },
      { new: true },
    );

    const existing = await Attendance.findOne({
      userId: user.userId,
      date: today,
    });

    if (existing?.checkIn) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 400 },
      );
    }

    // ✅ Fetch fences
    const geofences = await GeoFence.find({}).lean();

    if (!geofences.length) {
      return NextResponse.json(
        { error: 'No geofences configured' },
        { status: 500 },
      );
    }

    // ✅ Check inside any fence
    const isInside = geofences.some((fence) => {
      const distance = getDistance(lat, lng, fence.latitude, fence.longitude);
      return distance <= fence.radius;
    });

    if (!isInside) {
      return NextResponse.json(
        { error: 'Outside assigned geofence' },
        { status: 403 },
      );
    }

    // ✅ Check-in logic
    const checkInTime = new Date();

    const status = checkInTime.getHours() >= 10 ? 'late' : 'on-time';

    const attendance = await Attendance.create({
      userId: user.userId,
      date: today,
      checkIn: checkInTime,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        attendanceId: attendance._id,
        status,
        checkIn: checkInTime,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Check-in error:', error);

    return NextResponse.json({ error: 'Failed to check-in' }, { status: 500 });
  }
}
