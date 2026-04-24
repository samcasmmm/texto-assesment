import { TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j} className={j === 0 ? 'pl-6' : j === columns - 1 ? 'pr-6' : ''}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
