import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GeoFence from '@/models/GeoFence';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();
  const user = await getCurrentUser(req);
  const { id } = await params;

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await GeoFence.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Geofence deleted',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete geofence' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();
  const user = await getCurrentUser(req);
  const { id } = await params;

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const geofence = await GeoFence.findByIdAndUpdate(id, data, {
      new: true,
    });
    return NextResponse.json(geofence);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update geofence' },
      { status: 400 },
    );
  }
}
