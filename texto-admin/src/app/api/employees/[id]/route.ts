import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User can only see themselves, Admin can see anyone
  if (!isAdmin(user) && user.userId !== params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const employee = await Employee.findById(params.id);
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User can only update themselves, Admin can update anyone
  if (!isAdmin(user) && user.userId !== params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    
    // Prevent non-admins from changing their own role
    if (!isAdmin(user)) {
      delete data.role;
    }

    const employee = await Employee.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 400 });
  }
}

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
    await Employee.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 400 });
  }
}
