import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // 1. Allow login page and auth API without token
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 2. Redirect to login if no token
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Verify token
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/attendance/:path*',
    '/api/employees/:path*',
    '/api/geofences/:path*',
    '/api/location-logs/:path*',
  ],
};
