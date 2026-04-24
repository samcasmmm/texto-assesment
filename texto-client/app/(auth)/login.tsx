'use client';

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import {
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import TextoHrmsLogo from '@/components/texto-hrms-logo';

export default function LoginScreen() {
  const [email, setEmail] = useState('amit.sharma@texto.in');
  const [password, setPassword] = useState('passwd');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert('Missing Info', 'Please enter your credentials.');
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      Alert.alert('Authentication Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle='dark-content' />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.headerSection}>
            <TextoHrmsLogo />
            <Text style={styles.tagline}>Enterprise Workforce Management</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.instructionText}>
              Sign in to access your dashboard
            </Text>

            {/* Email Input */}
            <View
              style={[
                styles.inputWrapper,
                isFocused === 'email' && styles.inputWrapperFocused,
              ]}
            >
              <Mail
                size={18}
                color={isFocused === 'email' ? '#2563eb' : '#94a3b8'}
              />
              <TextInput
                style={styles.input}
                placeholder='Corporate Email'
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocused('email')}
                onBlur={() => setIsFocused(null)}
                autoCapitalize='none'
                keyboardType='email-address'
                placeholderTextColor='#94a3b8'
              />
            </View>

            {/* Password Input */}
            <View
              style={[
                styles.inputWrapper,
                isFocused === 'password' && styles.inputWrapperFocused,
              ]}
            >
              <Lock
                size={18}
                color={isFocused === 'password' ? '#2563eb' : '#94a3b8'}
              />
              <TextInput
                style={styles.input}
                placeholder='Password'
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsFocused('password')}
                onBlur={() => setIsFocused(null)}
                secureTextEntry
                placeholderTextColor='#94a3b8'
              />
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.btnText}>Login to Workspace</Text>
                  <LogIn size={20} color='#fff' />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              Secured by Texto Systems by Sameer Bagwan
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -1,
  },
  brandAccent: {
    color: '#2563eb',
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 16,
  },
  inputWrapperFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#fff',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#0f172a',
    height: 58,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
});
