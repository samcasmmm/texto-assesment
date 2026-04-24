import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TextoHRMS</Text>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.loading}>Checking session...</Text>
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
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 20,
  },
  loading: {
    marginTop: 10,
    color: '#95a5a6',
  },
});
