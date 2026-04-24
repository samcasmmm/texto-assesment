import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GeoFence from '@/models/GeoFence';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const geofences = await GeoFence.find({});
    return NextResponse.json(geofences);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch geofences' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const geofence = await GeoFence.create(data);
    return NextResponse.json(geofence, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create geofence' }, { status: 400 });
  }
}
