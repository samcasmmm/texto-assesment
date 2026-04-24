'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TableSkeleton from '@/components/skeleton/table-skeleton';
import { format, isToday, parseISO } from 'date-fns';
import {
  CalendarDays,
  Download,
  FilterX,
  Clock,
  User,
  ArrowRightLeft,
} from 'lucide-react';
import StatusBadge from '@/components/status-badge';

// Strict typing for attendance data
interface AttendanceRecord {
  _id: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'on-time' | 'late' | 'checked-out' | 'absent';
  lateByMinutes: number;
  userId: {
    name: string;
    email: string;
  };
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      try {
        let url = `/api/attendance?date=${date}`;
        if (status !== 'all') url += `&status=${status}`;

        const res = await fetch(url);
        const data = await res.json();
        setAttendance(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [date, status]);

  const handleResetFilters = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setStatus('all');
  };

  return (
    <div className='container mx-auto py-8 space-y-8 max-w-7xl'>
      {/* Header with Quick Stats/Actions */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>Attendance Logs</h1>
          <p className='text-muted-foreground'>
            Monitoring daily workforce entry and exit flows.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              /* Logic to export CSV */
            }}
          >
            <Download className='mr-2 h-4 w-4' /> Export CSV
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className='flex flex-wrap gap-4 items-end bg-card p-4 rounded-xl border shadow-sm'>
        <div className='grid w-full md:w-auto items-center gap-1.5'>
          <label className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-1'>
            Selected Date
          </label>
          <div className='flex gap-2'>
            <Input
              type='date'
              value={date}
              className='w-[180px] bg-background'
              onChange={(e) => setDate(e.target.value)}
            />
            {!isToday(parseISO(date)) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))}
              >
                Today
              </Button>
            )}
          </div>
        </div>

        <div className='grid w-full md:w-64 items-center gap-1.5'>
          <label className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-1'>
            Filter Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className='bg-background'>
              <SelectValue placeholder='Select Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Records</SelectItem>
              <SelectItem value='on-time'>On-time Only</SelectItem>
              <SelectItem value='late'>Late Arrivals</SelectItem>
              <SelectItem value='checked-out'>Completed Shifts</SelectItem>
              <SelectItem value='absent'>Absentees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(status !== 'all' || !isToday(parseISO(date))) && (
          <Button
            variant='ghost'
            size='icon'
            onClick={handleResetFilters}
            title='Clear Filters'
            className='text-muted-foreground'
          >
            <FilterX className='h-4 w-4' />
          </Button>
        )}
      </div>

      <Card className='border-none shadow-sm overflow-hidden'>
        <CardContent className='p-0'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead className='pl-6 h-12'>Employee</TableHead>
                <TableHead className='h-12'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-3 w-3' /> Check-in
                  </div>
                </TableHead>
                <TableHead className='h-12'>
                  <div className='flex items-center gap-2'>
                    <ArrowRightLeft className='h-3 w-3' /> Check-out
                  </div>
                </TableHead>
                <TableHead className='h-12 text-center'>Status</TableHead>
                <TableHead className='pr-6 h-12 text-right'>
                  Tardiness
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton columns={5} rows={8} />
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-20'>
                    <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                      <CalendarDays className='h-10 w-10 opacity-20' />
                      <p>No activity recorded for this criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((record) => (
                  <TableRow
                    key={record._id}
                    className='hover:bg-muted/20 transition-colors'
                  >
                    <TableCell className='pl-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center'>
                          <User className='h-4 w-4 text-zinc-500' />
                        </div>
                        <div className='flex flex-col'>
                          <span className='font-semibold text-sm'>
                            {record.userId?.name}
                          </span>
                          <span className='text-xs text-muted-foreground font-normal'>
                            {record.userId?.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='font-mono text-xs'>
                      {record.checkIn
                        ? format(new Date(record.checkIn), 'hh:mm a')
                        : '—'}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>
                      {record.checkOut
                        ? format(new Date(record.checkOut), 'hh:mm a')
                        : '—'}
                    </TableCell>
                    <TableCell className='text-center'>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className='pr-6 text-right'>
                      {record.lateByMinutes > 0 ? (
                        <div className='inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded'>
                          +{record.lateByMinutes}m
                        </div>
                      ) : (
                        <span className='text-zinc-300 text-xs'>—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

