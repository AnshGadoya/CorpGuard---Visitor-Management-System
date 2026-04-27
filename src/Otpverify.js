// OTPVerify.js
import React, { useState, useRef, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Alert,} from 'react-native';

const OTPVerify = ({ visitor, otp, onSuccess, onCancel }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const enteredOTP = digits.join('');

  useEffect(() => {
    // Auto focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  const handleDigitChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setStatus('idle');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 filled
    if (digit && index === 5) {
      const full = newDigits.join('');
      if (full.length === 6) {
        verifyOTP(full);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const triggerSuccess = () => {
    Animated.spring(successAnim, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const verifyOTP = (code) => {
    if (code === otp) {
      setStatus('success');
      triggerSuccess();
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setStatus('error');
      triggerShake();

      if (newAttempts >= 3) {
        setTimeout(() => {
          Alert.alert(
            'Too Many Attempts',
            'Maximum attempts reached. Please contact security.',
            [{ text: 'OK', onPress: onCancel }]
          );
        }, 500);
        return;
      }

      // Clear digits for retry
      setTimeout(() => {
        setDigits(['', '', '', '', '', '']);
        setStatus('idle');
        inputRefs.current[0]?.focus();
      }, 1000);
    }
  };

  const handleVerifyPress = () => {
    if (enteredOTP.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }
    verifyOTP(enteredOTP);
  };

  const getBorderColor = () => {
    if (status === 'success') return '#059669';
    if (status === 'error') return '#DC2626';
    return '#BFDBFE';
  };

  const successScale = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Secure Exit Verification</Text>
        <Text style={styles.headerSubtitle}>OTP required to authorize exit</Text>
      </View>

      {/* Visitor Info */}
      <View style={styles.visitorCard}>
        <View style={styles.visitorRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{visitor.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.visitorName}>{visitor.name}</Text>
            <Text style={styles.visitorCompany}>{visitor.company}</Text>
          </View>
          <View style={styles.exitBadge}>
            <Text style={styles.exitBadgeText}>🚪 Exit</Text>
          </View>
        </View>
        <View style={styles.passRow}>
          <Text style={styles.passLabel}>Gatepass: </Text>
          <Text style={styles.passValue}>{visitor.gatepassNumber}</Text>
        </View>
      </View>

      {/* OTP Display (for demo/gatekeeper) */}
      <View style={styles.otpHintBox}>
        <Text style={styles.otpHintLabel}>📱 OTP sent to host's registered mobile</Text>
        <Text style={styles.otpHintDemo}>Demo OTP: {otp}</Text>
      </View>

      {/* Success overlay */}
      {status === 'success' && (
        <Animated.View
          style={[
            styles.successOverlay,
            { transform: [{ scale: successScale }], opacity: successAnim },
          ]}
        >
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Exit Authorized!</Text>
          <Text style={styles.successSubtitle}>{visitor.name} has been cleared to exit</Text>
        </Animated.View>
      )}

      {/* OTP Input */}
      <View style={styles.otpSection}>
        <Text style={styles.otpLabel}>Enter 6-digit OTP</Text>

        <Animated.View
          style={[
            styles.otpInputRow,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => (inputRefs.current[i] = r)}
              style={[
                styles.digitInput,
                { borderColor: getBorderColor() },
                status === 'success' && styles.digitSuccess,
                status === 'error' && styles.digitError,
                d.length > 0 && styles.digitFilled,
              ]}
              value={d}
              onChangeText={(text) => handleDigitChange(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              editable={status !== 'success'}
            />
          ))}
        </Animated.View>

        {status === 'error' && (
          <Text style={styles.errorMsg}>
            ❌ Incorrect OTP. {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining.
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            enteredOTP.length < 6 && styles.verifyBtnDisabled,
            status === 'success' && styles.verifyBtnSuccess,
          ]}
          onPress={handleVerifyPress}
          disabled={status === 'success'}
        >
          <Text style={styles.verifyBtnText}>
            {status === 'success' ? '✓ Authorized' : '🔓 Verify & Exit'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.securityNote}>
        🔒 This OTP expires in 5 minutes. Do not share with anyone.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },

  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  visitorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  visitorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  visitorName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  visitorCompany: { fontSize: 13, color: '#6B7280' },
  exitBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  exitBadgeText: { fontSize: 12, fontWeight: '600', color: '#DC2626' },
  passRow: { flexDirection: 'row' },
  passLabel: { fontSize: 12, color: '#9CA3AF' },
  passValue: { fontSize: 12, color: '#374151', fontWeight: '600', fontFamily: 'monospace' },

  otpHintBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  otpHintLabel: { fontSize: 12, color: '#92400E', marginBottom: 4 },
  otpHintDemo: { fontSize: 20, fontWeight: '800', color: '#D97706', letterSpacing: 4 },

  successOverlay: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6EE7B7',
  },
  successIcon: { fontSize: 48, marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#065F46' },
  successSubtitle: { fontSize: 13, color: '#059669', marginTop: 4 },

  otpSection: { marginBottom: 28, alignItems: 'center' },
  otpLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 16 },
  otpInputRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  digitInput: {
    width: 48,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  digitFilled: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1D4ED8',
  },
  digitSuccess: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
    color: '#065F46',
  },
  digitError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
    color: '#DC2626',
  },
  errorMsg: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },

  verifyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  verifyBtnSuccess: { backgroundColor: '#059669' },
  verifyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  securityNote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default OTPVerify;