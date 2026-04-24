import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GeoFence from '@/models/GeoFence';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await GeoFence.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete geofence' }, { status: 400 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const geofence = await GeoFence.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json(geofence);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update geofence' }, { status: 400 });
  }
}
