import { Skeleton } from '../ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className='space-y-8 container mx-auto py-6'>
      <div className='flex justify-between items-center'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-10 w-32' />
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-28 w-full' />
        ))}
      </div>
      <Skeleton className='h-[500px] w-full rounded-xl' />
    </div>
  );
}
