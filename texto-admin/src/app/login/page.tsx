'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TextoHrmsLogo from '@/components/texto-logo';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@texto.in');
  const [password, setPassword] = useState('passwd');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Login successful! Redirecting...');
        router.push('/dashboard');
        window.localStorage.setItem(
          'USER_DATA',
          JSON.stringify({
            id: data?.user?.id,
            name: data?.user?.name,
            email: data?.user?.email,
            role: data?.user?.role,
          }),
        );
        router.refresh();
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 p-4'>
      <div className='absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]'></div>

      <Card className='w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-sm z-10'>
        <CardHeader className='space-y-4 flex flex-col items-center pb-8'>
          <div className='p-3 rounded-2xl'>
            <TextoHrmsLogo />
          </div>
          <div className='text-center space-y-1'>
            <CardTitle className='text-2xl font-bold tracking-tight'>
              Welcome Back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  type='email'
                  placeholder='admin@texto.in'
                  className='pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-primary/20'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  type='password'
                  placeholder='••••••••'
                  className='pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-primary/20'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type='submit'
              className='w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          <div className='mt-8 pt-6 border-t border-slate-100 text-center'>
            <p className='text-xs text-muted-foreground'>
              Secure Enterprise HRMS Access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
