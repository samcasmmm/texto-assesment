export interface AttendanceRecord {
  _id: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'on-time' | 'late' | 'absent' | 'excused' | 'checked-out';
  lateByMinutes: number;
  userId: {
    name: string;
    email: string;
  };
}

export interface SummaryStats {
  totalEmployees: number;
  checkedIn: number;
  checkedOut: number;
  late: number;
}
