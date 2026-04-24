'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  MapPin,
  Navigation,
  History,
  User,
  Activity,
  Calendar as CalendarIcon,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const containerStyle = { width: '100%', height: '100%' }; // Map fills its container
const center = { lat: 28.6139, lng: 77.209 };

const mapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
  ],
  center: { lat: 19.197508, lng: 73.051214 },
};

export default function MapViewPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [route, setRoute] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);

        const formattedDate = format(date, 'yyyy-MM-dd');

        const res = await fetch(`/api/location-logs?date=${formattedDate}`);
        const logs = await res.json();

        // 🔥 group by user (latest location)
        const grouped: any = {};

        logs.forEach((log: any) => {
          const user = log.userId;

          if (!grouped[user._id]) {
            grouped[user._id] = {
              _id: user._id,
              name: user.name,
              role: user.role,
              location: null,
              logs: [],
            };
          }

          // 👇 take LAST location of day
          const lastPoint = log.locations[log.locations.length - 1];

          grouped[user._id].location = {
            lat: lastPoint.coordinates.coordinates[1],
            lng: lastPoint.coordinates.coordinates[0],
          };

          grouped[user._id].logs = log.locations;
        });

        setEmployees(Object.values(grouped));
      } catch (err) {
        console.error('Map Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [date]);

  const fetchRoute = useCallback(async (empId: string, selectedDate: Date) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(
        `/api/location-logs?userId=${empId}&date=${formattedDate}`,
      );
      const logs = await res.json();
      const path = logs.map((log: any) => ({
        lat: log.coordinates.coordinates[1],
        lng: log.coordinates.coordinates[0],
      }));
      setRoute(path);
    } catch (e) {
      setRoute([]);
    }
  }, []);

  const handleSelectEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    if (mapRef.current) {
      mapRef.current.panTo(emp.location);
      mapRef.current.setZoom(18);
    }
    fetchRoute(emp._id, date);
  };

  if (!isLoaded || loading) {
    return (
      <div className='container mx-auto py-6 h-screen flex items-center justify-center'>
        <Skeleton className='h-[700px] w-full rounded-xl' />
      </div>
    );
  }

  return (
    // Parent container is locked to screen height
    <div className='container mx-auto py-6 space-y-6 max-w-7xl h-screen flex flex-col'>
      {/* Header (Shrink-0 prevents it from squishing) */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Geospatial Intelligence
          </h1>
          <p className='text-muted-foreground flex items-center gap-2'>
            <Activity className='h-4 w-4 text-emerald-500' /> Fleet History
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-[240px] justify-start shadow-sm'
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {date ? format(date, 'PPP') : 'Select Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='end'>
              <Calendar
                mode='single'
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className='grid gap-0 md:grid-cols-4 border rounded-xl overflow-hidden shadow-md bg-card flex-1 min-h-0'>
        {/* Sidebar Container */}
        <aside className='md:col-span-1 border-r flex flex-col h-full bg-slate-50/50 min-h-0'>
          <div className='p-4 border-b bg-white shrink-0'>
            <h3 className='font-semibold flex items-center gap-2 text-sm'>
              <User className='h-4 w-4 text-primary' /> Personnel Directory
            </h3>
          </div>

          {/* This is the scrolling area */}
          <ScrollArea className='flex-1 overflow-y-auto'>
            <div className='p-2 space-y-1 pb-10'>
              {employees.map((emp) => (
                <button
                  key={emp._id}
                  onClick={() => handleSelectEmployee(emp)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg transition-all border group',
                    selectedEmployee?._id === emp._id
                      ? 'bg-white border-primary/20 shadow-md ring-1 ring-primary/5'
                      : 'border-transparent hover:bg-white hover:shadow-sm',
                  )}
                >
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <p className='font-bold text-sm text-slate-900'>
                        {emp.name}
                      </p>
                      <p className='text-[10px] text-muted-foreground uppercase tracking-tighter'>
                        {emp.role}
                      </p>
                    </div>
                    {selectedEmployee?._id === emp._id && (
                      <ChevronRight className='h-4 w-4 text-primary' />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Map Container */}
        <main className='md:col-span-3 relative h-full'>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            options={mapOptions}
          >
            {employees.map((emp) => (
              <Marker
                key={emp._id}
                position={emp.location}
                onClick={() => handleSelectEmployee(emp)}
              />
            ))}
            {selectedEmployee && route.length > 0 && (
              <Polyline
                path={route}
                options={{ strokeColor: '#3b82f6', strokeWeight: 4 }}
              />
            )}
          </GoogleMap>
        </main>
      </div>
    </div>
  );
}
