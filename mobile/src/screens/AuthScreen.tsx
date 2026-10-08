import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

export const AuthScreen: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);

  const { login, register, sessionExpiredMsg, clearSessionExpiredMsg } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    if (isRegister && !fullName.trim()) {
      Alert.alert('Required Fields', 'Please enter your full name.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        await register({ fullName: fullName.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
    } catch (err: any) {
      Alert.alert(isRegister ? 'Registration Failed' : 'Login Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@pulseflow.io');
    setPassword('password123');
    setIsRegister(false);
    clearSessionExpiredMsg();
  };

  const handleSaveServerUrl = () => {
    setApiBaseUrl(serverUrl.trim());
    Alert.alert('Server Updated', `API endpoint set to:\n${serverUrl.trim()}`);
    setShowServerConfig(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>
            Pulse<Text style={styles.brandAccent}>Flow</Text>
          </Text>
          <Text style={styles.brandSubtitle}>
            {isRegister ? 'Create your mobile workspace' : 'Sign in to access your projects'}
          </Text>
        </View>

        {/* Expired Session Notice */}
        {sessionExpiredMsg && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertBannerText}>⚠️ {sessionExpiredMsg}</Text>
          </View>
        )}

        {/* Auth Form Card */}
        <View style={styles.card}>
          {isRegister && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Alex Vance"
                placeholderTextColor="#64748b"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="alex@pulseflow.io"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isRegister ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Autofill */}
          <TouchableOpacity style={styles.demoButton} onPress={handleFillDemo}>
            <Text style={styles.demoButtonText}>⚡ Autofill Demo Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsRegister(!isRegister);
              clearSessionExpiredMsg();
            }}
          >
            <Text style={styles.switchButtonText}>
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server Config Accordion for Local Testing */}
        <TouchableOpacity
          style={styles.serverConfigToggle}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Text style={styles.serverConfigToggleText}>
            ⚙️ Backend Server Host ({showServerConfig ? 'Hide' : 'Configure'})
          </Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverCard}>
            <Text style={styles.label}>API Base URL (e.g. LAN IP or Cloud URL):</Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.serverSaveButton} onPress={handleSaveServerUrl}>
              <Text style={styles.serverSaveButtonText}>Save Endpoint</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoBadgeText: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  brandAccent: {
    color: '#818cf8',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  alertBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  alertBannerText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '500',
  },
  serverConfigToggle: {
    marginTop: 24,
    alignItems: 'center',
  },
  serverConfigToggleText: {
    color: '#64748b',
    fontSize: 12,
  },
  serverCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  serverSaveButton: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  serverSaveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

