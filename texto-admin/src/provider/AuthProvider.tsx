'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = window.localStorage.getItem('USER_DATA');

    if (!user && pathname !== '/login') {
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (pathname === '/login') return <>{children}</>;

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
