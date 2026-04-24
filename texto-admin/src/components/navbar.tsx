'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  User,
  LogOut,
  MapPin,
  Users,
  LayoutDashboard,
  Calendar,
  FileText,
  Shield,
  Menu,
  Settings,
  Bell,
} from 'lucide-react';
import TextoHrmsLogo from './texto-logo';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: Calendar },
  { href: '/map', label: 'Map View', icon: MapPin },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/geofencing', label: 'Geo-Fencing', icon: Shield },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const storedUser = window.localStorage.getItem('USER_DATA');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    window.localStorage.removeItem('USER_DATA');
    setUser(null);
    router.push('/login');
  };

  if (!mounted || pathname === '/login') return null;

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <div className='flex items-center gap-8'>
          <Link
            href='/'
            className='flex items-center transition-opacity hover:opacity-90'
          >
            <TextoHrmsLogo />
          </Link>

          <NavigationMenu className='hidden lg:flex'>
            <NavigationMenuList className='gap-1'>
              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      'group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      pathname === item.href
                        ? 'bg-accent/50 text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    <Link href={item.href} passHref>
                      <item.icon
                        className={cn(
                          'mr-2 h-4 w-4',
                          pathname === item.href && 'text-primary',
                        )}
                      />
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className='flex items-center gap-2'>
          {/* Desktop Notification Bell */}
          <div className='hidden items-center gap-2 sm:flex'>
            <Button
              variant='ghost'
              size='icon'
              className='text-muted-foreground'
            >
              <Bell className='h-5 w-5' />
            </Button>
            <Separator orientation='vertical' className='h-6' />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='relative h-9 w-9 rounded-full bg-accent ring-offset-background transition-all hover:ring-2 hover:ring-ring'
              >
                <User className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {user?.name || 'Admin User'}
                  </p>
                  <p className='text-xs italic text-muted-foreground'>
                    {user?.email || 'admin@texto.in'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href='/profile' className='flex w-full items-center'>
                  <User className='mr-2 h-4 w-4' /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/settings' className='flex w-full items-center'>
                  <Settings className='mr-2 h-4 w-4' /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className='text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer'
              >
                <LogOut className='mr-2 h-4 w-4' /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <div className='lg:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <Menu className='h-6 w-6' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-72'>
                <SheetHeader className='text-left'>
                  <SheetTitle>
                    <TextoHrmsLogo />
                  </SheetTitle>
                </SheetHeader>
                <div className='mt-8 flex flex-col gap-4'>
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                        pathname === item.href
                          ? 'bg-accent text-primary font-semibold'
                          : 'text-muted-foreground',
                      )}
                    >
                      <item.icon className='h-5 w-5' />
                      {item.label}
                    </Link>
                  ))}
                  <Separator className='my-2' />
                  <Button
                    variant='ghost'
                    className='justify-start px-3 text-destructive hover:bg-destructive/10 hover:text-destructive'
                    onClick={handleLogout}
                  >
                    <LogOut className='mr-3 h-5 w-5' />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
