import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const employee = await Employee.findById(user.userId);
    if (!employee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
