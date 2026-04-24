import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import api from '@/services/api';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

const LOCATION_TASK_NAME = 'background-location-task';

interface AttendanceContextType {
  isCheckedIn: boolean;
  checkIn: (fn: () => Promise<void>) => Promise<void>;
  checkOut: (fn: () => Promise<void>) => Promise<void>;
  attendanceGroup: any[];
  isActionLoading: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined,
);

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) return;
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      try {
        await api.post('/location-logs', {
          coordinates: [location.coords.longitude, location.coords.latitude],
          timestamp: new Date(location.timestamp),
        });
      } catch (e) {
        console.error('Bkg Location Sync Fail', e);
      }
    }
  }
});

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, setUser } = useAuth();
  const [attendanceGroup, setAttendanceGroup] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // isCheckedIn is derived purely from user.working
  const isCheckedIn = Boolean(user?.working);

  // Fetch logs whenever user logs in
  useEffect(() => {
    if (user?.email) {
      attendanceGroupBy();
    } else {
      setAttendanceGroup(null);
    }
  }, [user?.email]);

  const attendanceGroupBy = async () => {
    try {
      const res = await api.get('/attendance/mine');
      if (res.data?.data) {
        setAttendanceGroup(res.data.data);
      }
    } catch (e: any) {
      console.error('Fetch attendance logs failed', e);
    }
  };

  const checkIn = async (refreshUser: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();

      if (fg !== 'granted' || bg !== 'granted') {
        Alert.alert('Permissions Required', 'Please enable location access.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const res = await api.post('/attendance/check-in', {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });

      if (res.data?.success) {
        // Update working status optimistically
        setUser((prev: any) => ({ ...prev, working: true }));

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 120000,
          distanceInterval: 10,
          foregroundService: {
            notificationTitle: 'TextoHRMS',
            notificationBody: 'Location tracking active',
          },
        });

        attendanceGroupBy();
      }
    } catch (e: any) {
      Alert.alert('Check-in Failed', e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const checkOut = async (refreshUser: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      const res = await api.post('/attendance/check-out');
      if (res.data) {
        setUser((prev: any) => ({ ...prev, working: false }));

        try {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        } catch (_) {}

        attendanceGroupBy();
      }
    } catch (e: any) {
      Alert.alert('Check-out Failed', e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        isCheckedIn,
        checkIn,
        checkOut,
        attendanceGroup,
        isActionLoading,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context)
    throw new Error('useAttendance must be used within AttendanceProvider');
  return context;
};
