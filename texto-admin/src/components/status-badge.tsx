import { AttendanceRecord } from '@/types';
import { Badge } from './ui/badge';

export default function StatusBadge({
  status,
}: {
  status: AttendanceRecord['status'];
}) {
  const styles = {
    'on-time':
      'bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20',
    late: 'bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20',
    absent: 'bg-zinc-500/10 text-zinc-600 border-zinc-200 hover:bg-zinc-500/20',
    excused:
      'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20',
    'checked-out':
      'bg-indigo-500/10 text-indigo-600 border-indigo-200 hover:bg-indigo-500/20',
  };

  return (
    <Badge
      variant='outline'
      className={`capitalize font-medium shadow-none ${styles[status] || 'bg-zinc-100 text-zinc-600'}`}
    >
      {status || 'Unknown'}
    </Badge>
  );
}
