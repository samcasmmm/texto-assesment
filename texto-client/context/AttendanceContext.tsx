import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import api from '@/services/api';
import { Alert } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

interface AttendanceContextType {
  isCheckedIn: boolean;
  attendanceId: string | null;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  attendanceGroup: any[];
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
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [attendanceGroup, setAttendanceGroup] = useState<any>(null);

  const checkIn = async () => {
    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();

      if (fg !== 'granted' || bg !== 'granted') {
        Alert.alert('Permissions Required', 'Please enable location access.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const res = await api.post('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        }),
      });

      if (res.data) {
        setAttendanceId(res.data.attendanceId);
        setIsCheckedIn(true);
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 120000,
          distanceInterval: 10,
          foregroundService: {
            notificationTitle: 'TextoHRMS',
            notificationBody: 'Location tracking active',
          },
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };
  const attendanceGroupBy = async () => {
    try {
      const res = await api.get('/attendance/mine');
      if (res.data?.data) {
        setAttendanceGroup(res.data?.data);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const checkOut = async () => {
    try {
      const res = await api.post('/attendance/check-out');
      if (res.data) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        setIsCheckedIn(false);
        setAttendanceId(null);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => {
    attendanceGroupBy();
  }, [isCheckedIn]);

  return (
    <AttendanceContext.Provider
      value={{
        isCheckedIn,
        attendanceId,
        checkIn,
        checkOut,
        attendanceGroup,
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
