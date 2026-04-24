import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const TextoHrmsLogo = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <Text style={styles.text}>
        texto
        <Text style={styles.lightText}>HRMS</Text>
      </Text>
    </View>
  );
};

export default TextoHrmsLogo;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#3f3f46',
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    fontSize: 26,
    fontWeight: '500',
    color: '#3f3f46',
    letterSpacing: -0.5,
  },
  lightText: {
    color: '#27272a', // zinc-800
    fontWeight: '300',
  },
});
