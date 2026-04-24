import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsSkeleton() {
  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-10 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>
      <Skeleton className='h-12 w-full max-w-md' />
      <div className='grid gap-4 md:grid-cols-3'>
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-32 w-full' />
      </div>
      <Skeleton className='h-[400px] w-full' />
    </div>
  );
}
