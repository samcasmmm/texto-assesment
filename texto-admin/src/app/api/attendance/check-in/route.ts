import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import GeoFence from '@/models/GeoFence';
import { getCurrentUser } from '@/lib/auth';
import { format } from 'date-fns';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { lat, lng } = await req.json();
    const today = format(new Date(), 'yyyy-MM-dd');

    const existing = await Attendance.findOne({ userId: user.userId, date: today });
    if (existing && existing.checkIn) return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });

    const geofences = await GeoFence.find({});
    let isInside = false;
    for (const fence of geofences) {
      const distance = getDistance(lat, lng, fence.latitude, fence.longitude);
      if (distance <= fence.radius) {
        isInside = true;
        break;
      }
    }

    if (!isInside) return NextResponse.json({ error: 'Outside assigned geofence' }, { status: 403 });

    const checkInTime = new Date();
    const status = checkInTime.getHours() >= 10 ? 'late' : 'on-time';

    const attendance = await Attendance.create({
      userId: user.userId,
      date: today,
      checkIn: checkInTime,
      status: status,
    });

    return NextResponse.json({ success: true, attendanceId: attendance._id, status }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check-in' }, { status: 500 });
  }
}
