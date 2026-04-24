import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let employees;
    if (isAdmin(user)) {
      employees = await Employee.find({});
    } else {
      employees = await Employee.find({ _id: user.userId });
    }
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser(req);

  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const employee = await Employee.create(data);
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 400 },
    );
  }
}
