'use client';

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  LogOut,
  MapPin,
  User as UserIcon,
  Activity,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useAttendance } from '@/context/AttendanceContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { isCheckedIn, checkIn, checkOut, attendanceGroup, isActionLoading } =
    useAttendance();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-- -- --';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />

      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.welcomeText}>
            Hello, {user?.name || 'Sameer'}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileCircle} activeOpacity={0.7}>
          <UserIcon size={24} color='#2563eb' />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.statusBanner,
            isCheckedIn ? styles.bannerActive : styles.bannerInactive,
          ]}
        >
          <View style={styles.statusInfo}>
            <View
              style={[
                styles.pulseDot,
                isCheckedIn ? styles.dotGreen : styles.dotRed,
              ]}
            />
            <Text style={styles.statusTitle}>
              {isCheckedIn ? 'Currently on Duty' : 'Shift not started'}
            </Text>
          </View>
          <Text style={styles.locationText}>
            <MapPin size={12} color='#64748b' />{' '}
            {isCheckedIn ? 'Office HQ' : 'Remote'}
          </Text>
        </View>

        <View style={styles.mainActionCard}>
          <TouchableOpacity
            onPress={
              isCheckedIn
                ? () => checkOut(refreshUser)
                : () => checkIn(refreshUser)
            }
            activeOpacity={0.9}
            disabled={isActionLoading}
            style={[
              styles.attendanceBtn,
              isCheckedIn ? styles.btnCheckOut : styles.btnCheckIn,
              isActionLoading && { opacity: 0.8 },
            ]}
          >
            {isActionLoading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <>
                <Text style={styles.attendanceBtnText}>
                  {isCheckedIn ? 'End Day' : 'Punch In'}
                </Text>
                <Activity size={20} color='#fff' />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Logs</Text>

        <FlatList
          data={attendanceGroup}
          keyExtractor={(item) => item.date}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                <View style={styles.logBadge}>
                  <Text style={styles.logBadgeText}>
                    {item.sessions.length} sessions
                  </Text>
                </View>
              </View>

              {item.sessions.map((s: any, i: number) => (
                <View key={i} style={styles.sessionRow}>
                  <View style={styles.sessionLeft}>
                    <Text style={styles.sessionLabel}>IN</Text>
                    <Text style={styles.sessionValue}>
                      {formatTime(s.in) || '--:--'}
                    </Text>
                  </View>
                  <View style={styles.sessionDivider} />
                  <View style={styles.sessionRight}>
                    <Text style={styles.sessionLabel}>OUT</Text>
                    <Text
                      style={[
                        styles.sessionValue,
                        !s.out && { color: '#2563eb' },
                      ]}
                    >
                      {formatTime(s.out) || 'ACTIVE'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={18} color='#ef4444' />
          <Text style={styles.logoutText}>Sign Out from Workspace</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  dateText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  profileCircle: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  bannerInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: { backgroundColor: '#22c55e' },
  dotRed: { backgroundColor: '#ef4444' },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  mainActionCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  timeValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1,
  },
  attendanceBtn: {
    width: '100%',
    height: 64,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  btnCheckIn: {
    backgroundColor: '#16a34a',
  },
  btnCheckOut: {
    backgroundColor: '#0f172a',
  },
  attendanceBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // --- FlatList Card Redesign ---
  historyCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  logBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  logBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sessionLeft: { flex: 1 },
  sessionRight: { flex: 1, alignItems: 'flex-end' },
  sessionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 15,
  },
  sessionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  sessionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 4,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
