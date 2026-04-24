import TextoHrmsLogo from '@/components/texto-hrms-logo';
import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' />

      <View style={styles.brandWrapper}>
        <TextoHrmsLogo />
        <View style={styles.separator} />
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size='small' color='#0f172a' />
        <Text style={styles.loading}>INITIALIZING SECURE SESSION...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  brandWrapper: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1.5,
  },
  brandAccent: {
    color: '#2563eb', // Minimal blue usage
  },
  separator: {
    width: 40,
    height: 3,
    backgroundColor: '#0f172a',
    marginVertical: 12,
  },
  version: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 12,
  },
  loading: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
  },
});
