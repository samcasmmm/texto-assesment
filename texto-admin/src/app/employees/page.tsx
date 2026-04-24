'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  User,
  MoreHorizontal,
  Search,
  Mail,
  UserPlus,
  FileEdit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import EmployeeSkeleton from '@/components/skeleton/employee-skeleton';

// Define a strict interface for better DX and type safety
interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status?: 'Active' | 'On Leave' | 'Terminated';
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  // Staff Tip: Handle filtering on the client for small-medium lists (under 200 items)
  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [employees, searchQuery]);

  return (
    <div className='container mx-auto py-8 space-y-8 max-w-7xl'>
      {/* Header with Search Integration */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Workforce</h1>
          <p className='text-muted-foreground text-sm'>
            Total {employees.length} registered employees in the organization.
          </p>
        </div>
        <div className='flex items-center gap-3 w-full md:w-auto'>
          <div className='relative w-full md:w-64'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Filter by name...'
              className='pl-9 bg-background'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className='shrink-0 bg-primary shadow-sm'>
            <Plus className='mr-2 h-4 w-4' /> Add Member
          </Button>
        </div>
      </div>

      <Card className='border-none shadow-sm bg-card/50 backdrop-blur-sm'>
        <CardContent className='p-0'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead className='pl-6 py-4'>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className='w-[80px] pr-6'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <EmployeeSkeleton />
              ) : filteredEmployees.length === 0 ? (
                <EmptyState query={searchQuery} />
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow
                    key={emp._id}
                    className='group hover:bg-muted/30 transition-colors'
                  >
                    <TableCell className='pl-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-200/50'>
                          <User className='h-5 w-5 text-blue-600' />
                        </div>
                        <div className='flex flex-col'>
                          <span className='font-semibold text-sm leading-tight'>
                            {emp.name}
                          </span>
                          <span className='text-xs text-muted-foreground flex items-center gap-1'>
                            <Mail className='h-3 w-3' /> {emp.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm font-medium px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200'>
                        {emp.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className='bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none'
                      >
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-zinc-500'>
                      {new Date(emp.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className='pr-6 text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-40'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className='cursor-pointer'>
                            <FileEdit className='mr-2 h-4 w-4' /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className='cursor-pointer'>
                            <Mail className='mr-2 h-4 w-4' /> Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer'>
                            <Trash2 className='mr-2 h-4 w-4' /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

// --- Subcomponents for Clean Code ---

function EmptyState({ query }: { query: string }) {
  return (
    <TableRow>
      <TableCell colSpan={5} className='text-center py-20'>
        <div className='flex flex-col items-center gap-3'>
          <div className='bg-muted p-4 rounded-full'>
            <UserPlus className='h-8 w-8 text-muted-foreground' />
          </div>
          <h3 className='font-semibold text-lg'>
            {query ? `No results for "${query}"` : 'No employees found'}
          </h3>
          <p className='text-muted-foreground max-w-[250px] mx-auto text-sm'>
            {query
              ? 'Try adjusting your search terms or filters.'
              : 'Start by adding your first organization member to the system.'}
          </p>
          {!query && (
            <Button variant='outline' className='mt-2'>
              Add Employee
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
