import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getCurrentUser(req: Request) {
  const token =
    (await cookies()).get('token')?.value ||
    (await req.headers.get('Authorization'))?.split(' ')[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

export function isAdmin(user: any) {
  return user?.role?.toLowerCase() === 'admin';
}
