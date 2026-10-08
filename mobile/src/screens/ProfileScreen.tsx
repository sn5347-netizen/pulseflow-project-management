import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  const handleTestConnection = async () => {
    try {
      setPingStatus('Testing connection...');
      const host = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
      const res = await fetch(`${host}/health`, { method: 'GET' });
      const data = await res.json();
      if (data.status === 'UP') {
        setPingStatus('✅ Connected to PulseFlow API Server!');
        setApiBaseUrl(host);
      } else {
        setPingStatus('⚠️ Unexpected response from server');
      }
    } catch (e: any) {
      setPingStatus(`❌ Connection failed: ${e.message}`);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@pulseflow.io'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Hardware Keystore Protected</Text>
        </View>
      </View>

      {/* Backend & Network Config Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 Backend API Connection</Text>
        <Text style={styles.cardDesc}>
          To test on a physical Android phone via Wi-Fi or Expo, configure your machine's LAN IP (e.g. http://192.168.1.50:5000/api):
        </Text>

        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.testBtn} onPress={handleTestConnection}>
          <Text style={styles.testBtnText}>Test Server Connection</Text>
        </TouchableOpacity>

        {pingStatus && (
          <Text
            style={[
              styles.statusMsg,
              pingStatus.startsWith('✅') ? styles.statusSuccess : styles.statusError,
            ]}
          >
            {pingStatus}
          </Text>
        )}
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Sign Out of PulseFlow</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
  },
  testBtn: {
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  testBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  statusMsg: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  statusSuccess: {
    color: '#34d399',
  },
  statusError: {
    color: '#f87171',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '700',
  },
});

