'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import ReportsSkeleton from '@/components/skeleton/reports-skeleton';
import StatusBadge from '@/components/status-badge';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { TrendingUp, Users, Clock, AlertCircle, FileText } from 'lucide-react';

// --- Types ---
interface DailySummary {
  totalEmployees: number;
  checkedIn: number;
  checkedOut: number;
  late: number;
}

interface DailyReport {
  summary: DailySummary;
  records: any[];
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Record<string, DailyReport>>({});
  const [loading, setLoading] = useState(true);

  const dates = useMemo(
    () => [
      format(new Date(), 'yyyy-MM-dd'),
      format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    ],
    [],
  );

  useEffect(() => {
    async function fetchReports() {
      try {
        const results: Record<string, DailyReport> = {};
        await Promise.all(
          dates.map(async (date) => {
            const res = await fetch(`/api/reports?date=${date}`);
            if (res.ok) {
              results[date] = await res.json();
            }
          }),
        );
        setReports(results);
      } catch (e) {
        console.error('Report Fetching Error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [dates]);

  if (loading) return <ReportsSkeleton />;

  return (
    <div className='container mx-auto py-8 space-y-8 max-w-7xl'>
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Performance Analytics
          </h1>
          <p className='text-muted-foreground flex items-center gap-2 mt-1'>
            <TrendingUp className='h-4 w-4 text-emerald-500' />
            Insight into workforce efficiency and historical trends.
          </p>
        </div>
      </div>

      <Tabs defaultValue={dates[0]} className='w-full'>
        <TabsList className='bg-muted/50 p-1 mb-6'>
          {dates.map((date) => (
            <TabsTrigger key={date} value={date} className='px-8'>
              {format(new Date(date), 'EEEE, MMM d')}
            </TabsTrigger>
          ))}
        </TabsList>

        {dates.map((date) => {
          const data = reports[date];
          const checkedIn = data?.summary?.checkedIn ?? 0;
          const totalEmployees = data?.summary?.totalEmployees ?? 0;

          const attendanceRate =
            totalEmployees > 0
              ? Math.round((checkedIn / totalEmployees) * 100)
              : 0;

          return (
            <TabsContent
              key={date}
              value={date}
              className='space-y-6 outline-none'
            >
              {/* Summary KPIs */}
              <div className='grid gap-4 md:grid-cols-3'>
                <Card className='border-none shadow-sm bg-linear-to-br from-white to-slate-50'>
                  <CardHeader className='pb-3'>
                    <CardDescription className='flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest'>
                      <Users className='h-3 w-3' /> Attendance Rate
                    </CardDescription>
                    <CardTitle className='text-3xl font-black'>
                      {attendanceRate}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={attendanceRate} className='h-1.5' />
                  </CardContent>
                </Card>

                <Card className='border-none shadow-sm'>
                  <CardHeader className='pb-3'>
                    <CardDescription className='flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest'>
                      <Clock className='h-3 w-3 text-rose-500' /> Tardy
                      Employees
                    </CardDescription>
                    <CardTitle className='text-3xl font-black text-rose-600'>
                      {data?.summary?.late || 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='text-xs text-muted-foreground'>
                    Action required for persistent lates.
                  </CardContent>
                </Card>

                <Card className='border-none shadow-sm'>
                  <CardHeader className='pb-3'>
                    <CardDescription className='flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest'>
                      <FileText className='h-3 w-3 text-blue-500' /> Capacity
                    </CardDescription>
                    <CardTitle className='text-3xl font-black'>
                      {data?.summary?.checkedIn || 0} /{' '}
                      {data?.summary?.totalEmployees || 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='text-xs text-muted-foreground'>
                    Total active workforce on premises.
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Table */}
              <Card className='border-none shadow-md overflow-hidden'>
                <CardHeader className='bg-slate-50/50 border-b'>
                  <CardTitle className='text-lg'>
                    Detailed Activity Log
                  </CardTitle>
                  <CardDescription>
                    Verified records for {format(new Date(date), 'EEEE, MMM d')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='p-0'>
                  <Table>
                    <TableHeader className='bg-muted/30'>
                      <TableRow>
                        <TableHead className='pl-6'>Employee</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Performance Note</TableHead>
                        <TableHead className='text-right pr-6'>
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!data || !Array.isArray(data.records) || data.records.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className='text-center py-20'>
                            <div className='flex flex-col items-center text-muted-foreground gap-2'>
                              <AlertCircle className='h-8 w-8 opacity-20' />
                              <p>Archive unavailable for this period.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.records.map((record) => (
                          <TableRow
                            key={record._id}
                            className='hover:bg-muted/10 transition-colors'
                          >
                            <TableCell className='pl-6 py-4'>
                              <div className='font-semibold text-sm'>
                                {record.userId?.name}
                              </div>
                              <div className='text-[10px] text-muted-foreground'>
                                {record.userId?.email}
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
                            <TableCell>
                              {record.lateByMinutes > 0 ? (
                                <span className='text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded'>
                                  Delayed {record.lateByMinutes} min
                                </span>
                              ) : record.checkIn ? (
                                <span className='text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'>
                                  Perfect attendance
                                </span>
                              ) : (
                                <span className='text-xs text-zinc-400 italic'>
                                  No entry
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-right pr-6'>
                              <StatusBadge status={record.status} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
