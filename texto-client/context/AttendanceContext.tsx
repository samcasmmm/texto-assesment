import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import api from '@/services/api';
import { Alert, Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { storageService } from '@/services/storage';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_CHANNEL_ID = 'texto-location-tracking';
export const WORKING_KEY = 'is_working';

interface AttendanceContextType {
  isCheckedIn: boolean;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  attendanceGroup: any[];
  isActionLoading: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined,
);

let todayLogCreated = false;
let trackedDate = '';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) return;
  if (!data) return;

  // Stop syncing if user has punched out
  const isWorking = storageService.get(WORKING_KEY);
  if (isWorking && isWorking !== 'true') {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (_) {}
    return;
  }

  const { locations } = data;
  const location = locations?.[0];
  if (!location) return;

  const coordinates = [location.coords.longitude, location.coords.latitude];
  const timestamp = new Date(location.timestamp);
  const currentDate = timestamp.toISOString().split('T')[0];

  // Reset flag on new day
  if (currentDate !== trackedDate) {
    todayLogCreated = false;
    trackedDate = currentDate;
  }

  try {
    if (!todayLogCreated) {
      const res = await api.post('/location-logs', { coordinates, timestamp });
      if (res.data?.success) {
        todayLogCreated = true;
      }
    } else {
      await api.patch('/location-logs', { coordinates, timestamp });
    }
  } catch (e: any) {
    if (e.message?.includes('already exists') || e.message?.includes('400')) {
      todayLogCreated = true;
      try {
        await api.patch('/location-logs', { coordinates, timestamp });
      } catch (patchErr) {
        console.error('Bkg Location PATCH Fail', patchErr);
      }
    } else {
      console.error('Bkg Location Sync Fail', e);
    }
  }
});

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, setUser } = useAuth();
  const [attendanceGroup, setAttendanceGroup] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isCheckedIn = Boolean(user?.working);

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

  const checkIn = async () => {
    setIsActionLoading(true);
    try {
      // Request notification permission (required on Android 13+)
      if (Platform.OS === 'android') {
        const { status: notifStatus } =
          await Notifications.requestPermissionsAsync();
        if (notifStatus !== 'granted') {
          Alert.alert(
            'Notification Permission',
            'Please allow notifications to receive location tracking alerts.',
          );
        }
      }

      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();

      if (fg !== 'granted' || bg !== 'granted') {
        Alert.alert('Permissions Required', 'Please enable location access.');
        return;
      }

      // Create notification channel on Android (required for foreground service)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(LOCATION_CHANNEL_ID, {
          name: 'Location Tracking',
          importance: Notifications.AndroidImportance.LOW,
          description: 'Used for background location tracking while on duty',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
          sound: null,
          vibrationPattern: null,
          enableLights: false,
          enableVibrate: false,
        });
      }

      const loc = await Location.getCurrentPositionAsync({});
      const res = await api.post('/attendance/check-in', {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });

      if (res.data?.success) {
        // Mark as working in storage so the background task can read it
        storageService.set(WORKING_KEY, 'true');
        setUser((prev: any) => ({ ...prev, working: true }));

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 3 * 60 * 1000,
          distanceInterval: 0,
          pausesUpdatesAutomatically: false,
          foregroundService: {
            notificationTitle: 'TextoHRMS — On Duty',
            notificationBody: 'Location is being tracked every 3 minutes',
            notificationChannelId: LOCATION_CHANNEL_ID,
            killServiceOnDestroy: false,
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

  const checkOut = async () => {
    setIsActionLoading(true);
    try {
      const res = await api.post('/attendance/check-out');
      if (res.data) {
        storageService.set(WORKING_KEY, 'false');
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
