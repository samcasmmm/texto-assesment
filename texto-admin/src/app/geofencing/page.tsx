'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
} from '@react-google-maps/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Trash2, Crosshair, Map as MapIcon, Globe } from 'lucide-react';

const containerStyle = { width: '100%', height: '600px' };
const defaultCenter = { lat: 28.6139, lng: 77.209 };

export default function GeoFencingPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'], // Useful for future address searching
  });

  const [geofences, setGeofences] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    latitude: 28.6139,
    longitude: 77.209,
    radius: 500,
  });
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  const fetchGeofences = async () => {
    try {
      const res = await fetch('/api/geofences');
      const data = await res.json();
      setGeofences(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating boundary...');
    try {
      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Geo-fence established', { id: loadingToast });
        fetchGeofences();
        setFormData({ ...formData, name: '' });
      }
    } catch (error) {
      toast.error('Sync failed', { id: loadingToast });
    }
  };

  const deleteFence = async (id: string) => {
    try {
      await fetch(`/api/geofences/${id}`, { method: 'DELETE' });
      setGeofences(geofences.filter((f) => f._id !== id));
      toast.info('Boundary removed');
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  // Move camera to a specific fence
  const focusFence = (gf: any) => {
    mapRef.current?.panTo({ lat: gf.latitude, lng: gf.longitude });
    setFormData({ ...gf });
  };

  if (!isLoaded || loading) {
    return (
      <div className='p-8 space-y-4'>
        <Skeleton className='h-[600px] w-full rounded-xl' />
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-8 max-w-7xl'>
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Geo-Spatial Boundaries
          </h1>
          <p className='text-muted-foreground flex items-center gap-2'>
            <Globe className='h-4 w-4 text-primary' /> Define site perimeters
            for automated check-ins.
          </p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-4 items-start'>
        <div className='space-y-6 md:col-span-1'>
          {/* Create Form */}
          <Card className='border-none shadow-md'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg'>New Perimeter</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                    Site Name
                  </label>
                  <Input
                    placeholder='Headquarters'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                      Latitude
                    </label>
                    <Input
                      type='number'
                      step='any'
                      value={formData.latitude.toFixed(6)}
                      readOnly
                      className='bg-muted/50'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                      Longitude
                    </label>
                    <Input
                      type='number'
                      step='any'
                      value={formData.longitude.toFixed(6)}
                      readOnly
                      className='bg-muted/50'
                    />
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <div className='flex justify-between'>
                    <label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                      Radius (Meters)
                    </label>
                    <span className='text-[10px] font-bold text-primary'>
                      {formData.radius}m
                    </span>
                  </div>
                  <Input
                    type='range'
                    min='50'
                    max='2000'
                    step='50'
                    value={formData.radius}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        radius: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <Button type='submit' className='w-full'>
                  Save Geo-fence
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List of active fences */}
          <Card className='border-none shadow-md'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm'>Configured Fences</CardTitle>
            </CardHeader>
            <ScrollArea className='h-[250px]'>
              <CardContent className='p-2 space-y-1'>
                {geofences.map((gf) => (
                  <div
                    key={gf._id}
                    className='group flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors'
                  >
                    <div
                      className='cursor-pointer'
                      onClick={() => focusFence(gf)}
                    >
                      <p className='text-sm font-semibold'>{gf.name}</p>
                      <p className='text-[10px] text-muted-foreground'>
                        {gf.radius}m perimeter
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 opacity-0 group-hover:opacity-100'
                      onClick={() => deleteFence(gf._id)}
                    >
                      <Trash2 className='h-3.5 w-3.5 text-rose-500' />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Map Section */}
        <Card className='md:col-span-3 overflow-hidden border-none shadow-xl'>
          <div className='bg-muted/50 p-3 flex items-center justify-between border-b'>
            <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
              <Crosshair className='h-3.5 w-3.5' /> Click anywhere to position
              the new center
            </div>
            <Badge variant='outline' className='bg-background'>
              Live Editor
            </Badge>
          </div>
          <CardContent className='p-0 relative'>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{ lat: formData.latitude, lng: formData.longitude }}
              zoom={15}
              onLoad={(map) => {
                mapRef.current = map;
              }}
              onClick={(e) => {
                if (e.latLng) {
                  setFormData({
                    ...formData,
                    latitude: e.latLng.lat(),
                    longitude: e.latLng.lng(),
                  });
                }
              }}
              options={{
                disableDefaultUI: false,
                mapTypeControl: false,
                streetViewControl: false,
              }}
            >
              {/* New Fence Preview (Orange) */}
              <Marker
                position={{ lat: formData.latitude, lng: formData.longitude }}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  scale: 5,
                  fillColor: '#f97316',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                }}
              />
              <Circle
                center={{ lat: formData.latitude, lng: formData.longitude }}
                radius={formData.radius}
                options={{
                  fillColor: '#f97316',
                  fillOpacity: 0.2,
                  strokeColor: '#f97316',
                  strokeWeight: 2,
                }}
              />

              {/* Existing Fences (Green) */}
              {geofences.map((gf) => (
                <Circle
                  key={gf._id}
                  center={{ lat: gf.latitude, lng: gf.longitude }}
                  radius={gf.radius}
                  options={{
                    fillColor: '#10b981',
                    fillOpacity: 0.15,
                    strokeColor: '#10b981',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              ))}
            </GoogleMap>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
