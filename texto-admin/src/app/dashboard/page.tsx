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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserCheck,
  UserMinus,
  Clock,
  Download,
  Search,
  RefreshCcw,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceRecord, SummaryStats } from '@/types';
import StatusBadge from '@/components/status-badge';
import DashboardSkeleton from '@/components/skeleton/dashboard-skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const [statsRes, attendanceRes] = await Promise.all([
        fetch(`/api/reports?date=${today}`).then((res) => res.json()),
        fetch(`/api/attendance?date=${today}`).then((res) => res.json()),
      ]);

      setStats(statsRes.summary || null);
      setAttendance(Array.isArray(attendanceRes) ? attendanceRes : []);
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAttendance = useMemo(() => {
    return (attendance || []).filter(
      (record) =>
        record.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [attendance, searchQuery]);

  if (loading && attendance.length === 0) {
    return <DashboardSkeleton />;
  }

  const cardConfigs = [
    {
      title: 'Total Workforce',
      value: stats?.totalEmployees,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Present Now',
      value: stats?.checkedIn,
      icon: UserCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Completed Shift',
      value: stats?.checkedOut,
      icon: UserMinus,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Late Arrivals',
      value: stats?.late,
      icon: Clock,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <div className='space-y-8 container mx-auto py-6 max-w-7xl'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-3xl font-bold tracking-tight'>Control Tower</h1>
            <span
              className='flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1'
              title='Live Data'
            />
          </div>
          <p className='text-muted-foreground'>
            Activity overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={fetchData}>
            <RefreshCcw className='mr-2 h-4 w-4' /> Sync
          </Button>
          <Button size='sm'>
            <Download className='mr-2 h-4 w-4' /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {cardConfigs.map((card) => (
          <Card
            key={card.title}
            className='border-none shadow-sm bg-card/50 backdrop-blur'
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>{card.value || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className='border-none shadow-sm'>
        <CardHeader>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div>
              <CardTitle>Attendance Log</CardTitle>
              <CardDescription>
                Real-time check-in/out status for all employees.
              </CardDescription>
            </div>
            <div className='flex items-center gap-2 w-full md:w-72'>
              <div className='relative w-full'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search name or email...'
                  className='pl-9 bg-muted/50 border-none h-9'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader className='bg-muted/30'>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead className='text-right'>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='h-32 text-center text-muted-foreground'
                    >
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : 'No attendance records yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance.map((record) => (
                    <TableRow
                      key={record._id}
                      className='hover:bg-muted/20 transition-colors'
                    >
                      <TableCell className='font-medium'>
                        <div className='flex flex-col'>
                          <span>{record.userId?.name}</span>
                          <span className='text-xs text-muted-foreground font-normal'>
                            {record.userId?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {record.checkIn
                          ? format(new Date(record.checkIn), 'hh:mm a')
                          : '—'}
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {record.checkOut
                          ? format(new Date(record.checkOut), 'hh:mm a')
                          : '—'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <StatusBadge status={record.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
