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

const LOG_DATE_KEY = 'last_log_date';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('[Bkg Task] Task Error:', error);
    return;
  }
  if (!data) return;

  const { locations } = data;
  const location = locations?.[0];
  console.log(
    '[Bkg Task] Fired at:',
    new Date().toLocaleTimeString(),
    'Points:',
    locations?.length,
  );

  if (!location) return;

  // Stop syncing if user has punched out
  const isWorking = storageService.get(WORKING_KEY);
  if (isWorking && isWorking !== 'true') {
    console.log('[Bkg Task] User not working, stopping task...');
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (_) {}
    return;
  }

  const coordinates = [location.coords.longitude, location.coords.latitude];
  const timestamp = new Date(location.timestamp);
  const currentDate = timestamp.toISOString().split('T')[0];
  const lastLogDate = storageService.get(LOG_DATE_KEY);

  const needsPost = currentDate !== lastLogDate;

  try {
    if (needsPost) {
      console.log('[Bkg Task] New day or first log. Attempting POST...');
      const res = await api.post('/location-logs', { coordinates, timestamp });
      if (res.data?.success) {
        storageService.set(LOG_DATE_KEY, currentDate);
        console.log('[Bkg Task] POST Success');
      }
    } else {
      console.log('[Bkg Task] Log exists for today. Attempting PATCH...');
      const res = await api.patch('/location-logs', { coordinates, timestamp });
      console.log(
        '[Bkg Task] PATCH Result:',
        res.data?.updated ? 'Point Added' : 'Throttled',
      );
    }
  } catch (e: any) {
    const errorMsg = e.response?.data?.error || e.message || '';
    console.log('[Bkg Task] Sync Error Response:', errorMsg);

    if (errorMsg.includes('already exists') || e.response?.status === 400) {
      console.log('[Bkg Task] Log already exists on server, updating state');
      storageService.set(LOG_DATE_KEY, currentDate);
      // Optional: try PATCH immediately
      try {
        await api.patch('/location-logs', { coordinates, timestamp });
      } catch (_) {}
    } else if (
      errorMsg.includes('No log found') ||
      e.response?.status === 404
    ) {
      console.log(
        '[Bkg Task] Log not found on server, attempting POST recovery',
      );
      try {
        const res = await api.post('/location-logs', {
          coordinates,
          timestamp,
        });
        if (res.data?.success) {
          storageService.set(LOG_DATE_KEY, currentDate);
        }
      } catch (_) {}
    } else {
      console.error('[Bkg Task] Sync Fail:', errorMsg);
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
      console.log('[Check-in] Starting...');
      // Request notification permission (required on Android 13+)
      if (Platform.OS === 'android') {
        const { status: notifStatus } =
          await Notifications.requestPermissionsAsync();
        console.log('[Check-in] Notification status:', notifStatus);
        if (notifStatus !== 'granted') {
          Alert.alert(
            'Notification Permission',
            'Please allow notifications to receive location tracking alerts.',
          );
        }
      }

      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      console.log('[Check-in] Location permissions:', { fg, bg });

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
      console.log('[Check-in] Current position:', loc.coords);

      const res = await api.post('/attendance/check-in', {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
      console.log('[Check-in] API Response:', res.data);

      if (res.data?.success) {
        // Mark as working in storage so the background task can read it
        storageService.set(WORKING_KEY, 'true');
        setUser((prev: any) => ({ ...prev, working: true }));

        try {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
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
          console.log('[Check-in] Background task started');
        } catch (taskErr) {
          console.error('[Check-in] Background task failed to start:', taskErr);
          // We still keep the user checked in as the DB record was created
        }

        attendanceGroupBy();
      }
    } catch (e: any) {
      console.error('[Check-in] Error:', e);
      Alert.alert('Check-in Failed', e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const checkOut = async () => {
    setIsActionLoading(true);
    try {
      console.log('[Check-out] Starting...');
      const res = await api.post('/attendance/check-out');
      console.log('[Check-out] API Response:', res.data);

      if (res.data) {
        storageService.set(WORKING_KEY, 'false');
        setUser((prev: any) => ({ ...prev, working: false }));

        try {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log('[Check-out] Background task stopped');
        } catch (_) {}

        attendanceGroupBy();
      }
    } catch (e: any) {
      console.error('[Check-out] Error:', e);
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
