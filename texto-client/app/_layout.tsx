import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AttendanceProvider } from '@/context/AttendanceContext';
import { SplashScreen } from '@/screens/SplashScreen';

function NavigationGuard() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/login');
    } else if (token && inAuthGroup) {
      router.replace('/');
    }
  }, [token, loading, segments]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name='(auth)' options={{ headerShown: false }} />
      <Stack.Screen name='(app)' options={{ headerShown: false }} />
      <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <AttendanceProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <NavigationGuard />
          <StatusBar style='auto' />
        </ThemeProvider>
      </AttendanceProvider>
    </AuthProvider>
  );
}
