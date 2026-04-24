import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className='relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center overflow-hidden bg-background'>
      <div className='absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]' />
      <div className='absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]' />

      <section className='container relative z-10 flex flex-col items-center justify-center px-4 text-center'>
        <div className='max-w-[900px] space-y-8'>
          <h1 className='text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl'>
            The Operating System for{' '}
            <span className='block italic font-serif bg-linear-to-r from-blue-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent animate-gradient-x py-2'>
              Modern Teams.
            </span>
          </h1>

          <p className='mx-auto max-w-[600px] text-lg text-muted-foreground sm:text-xl leading-relaxed'>
            TextoHRMS simplifies workforce management, location logistics, and
            automated reporting in one unified interface.
          </p>
        </div>

        <div className='mt-12 flex items-center justify-center'>
          <Button
            asChild
            className='h-14 rounded-full px-10 text-base font-semibold shadow-[0_20px_50px_rgba(37,_99,_235,_0.2)] transition-all hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(37,_99,_235,_0.4)] active:scale-[0.98]'
          >
            <Link href='/dashboard'>
              Get Started <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
