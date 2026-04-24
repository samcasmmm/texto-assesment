import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const employee = await Employee.findById(user.userId);
    if (!employee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('employee', employee);
    return NextResponse.json({
      success: true,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        working: Boolean(employee.working),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
