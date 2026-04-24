import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';

export default function EmployeeSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          <TableCell colSpan={5} className='p-4'>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-[150px]' />
                <Skeleton className='h-3 w-[100px]' />
              </div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
