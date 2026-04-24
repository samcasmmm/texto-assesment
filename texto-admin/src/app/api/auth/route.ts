import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const user = await Employee.findOne({ email });

    if (user && user.password === password) {
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' },
      );

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400,
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 },
    );
  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set('token', '', { maxAge: 0 });
  return response;
}
