// App.js - Visitor Management System
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DUMMY_VISITORS, generateOTP, VISITOR_STATUS } from './src/Dummydata';
import Checkinscreen from './src/Checkinscreen';
import SignatureScreen from './src/Signaturescreen';
import OTPVerify from './src/Otpverify';
import Visitorlist from './src/Visitorlist';
import Preregisterscreen from './src/Preregisterscreen';
import Dashboard from './src/Dashboard';

const STORAGE_KEY = '@vms_visitors';

const SCREEN = {
  DASHBOARD: 'DASHBOARD',
  CHECK_IN: 'CHECK_IN',
  SIGNATURE: 'SIGNATURE',
  OTP: 'OTP',
  PRE_REGISTER: 'PRE_REGISTER',
};

const TAB = {
  HOME: 'HOME',
  VISITORS: 'VISITORS',
};

// ── Action Modal ──────────────────────────────────────────────────────────────
const ActionModal = ({ visible, visitor, onClose, onAction }) => {
  if (!visitor) return null;

  const actions = [];
  if (visitor.status === VISITOR_STATUS.PRE_REGISTERED)
    actions.push({ label: '✅ Check In Visitor', color: '#1D4ED8', action: 'CHECK_IN' });
  if (visitor.status === VISITOR_STATUS.ON_PREMISES)
    actions.push({ label: '✍️ Host Signature', color: '#059669', action: 'SIGNATURE' });
  if (visitor.status === VISITOR_STATUS.SIGNED_OFF)
    actions.push({ label: '🚪 Exit Verification (OTP)', color: '#DC2626', action: 'OTP' });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.visitorHeader}>
            <View style={modalStyles.avatarCircle}>
              <Text style={modalStyles.avatarText}>{visitor.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={modalStyles.visitorName}>{visitor.name}</Text>
              <Text style={modalStyles.visitorCompany}>{visitor.company}</Text>
            </View>
          </View>
          <View style={modalStyles.divider} />
          {actions.length > 0 ? (
            actions.map((a) => (
              <TouchableOpacity
                key={a.action}
                style={[modalStyles.actionBtn, { backgroundColor: a.color }]}
                onPress={() => { onClose(); onAction(visitor, a.action); }}
              >
                <Text style={modalStyles.actionBtnText}>{a.label}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={modalStyles.noActions}>
              {visitor.status === VISITOR_STATUS.EXITED
                ? '✓ This visitor has already exited.'
                : 'No actions available for this status.'}
            </Text>
          )}
          <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
            <Text style={modalStyles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [visitors, setVisitors] = useState([]);
  const [screen, setScreen] = useState(SCREEN.DASHBOARD);
  const [activeTab, setActiveTab] = useState(TAB.HOME);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeOTP, setActiveOTP] = useState(null);

  useEffect(() => { loadVisitors(); }, []);

  const loadVisitors = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVisitors(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_VISITORS));
        setVisitors(DUMMY_VISITORS);
      }
    } catch (e) {
      setVisitors(DUMMY_VISITORS);
    }
  };

  const saveVisitors = async (updated) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVisitors(updated);
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const updateVisitor = useCallback((updatedVisitor) => {
    setVisitors((prev) => {
      const updated = prev.map((v) => v.id === updatedVisitor.id ? updatedVisitor : v);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const handleSelectVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setModalVisible(true);
  };

  const handleAction = (visitor, action) => {
    setSelectedVisitor(visitor);
    if (action === 'CHECK_IN') setScreen(SCREEN.CHECK_IN);
    if (action === 'SIGNATURE') setScreen(SCREEN.SIGNATURE);
    if (action === 'OTP') {
      const otp = generateOTP();
      const updatedVisitor = { ...visitor, otp };
      updateVisitor(updatedVisitor);
      setSelectedVisitor(updatedVisitor);
      setActiveOTP(otp);
      setScreen(SCREEN.OTP);
    }
  };

  const goToDashboard = () => {
    setScreen(SCREEN.DASHBOARD);
    setSelectedVisitor(null);
    setActiveOTP(null);
  };

  const handleResetData = () => {
    Alert.alert('Reset Demo Data', 'Restore all visitors to original demo state?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_VISITORS));
          setVisitors(DUMMY_VISITORS);
        },
      },
    ]);
  };

  const stats = {
    preRegistered: visitors.filter(v => v.status === VISITOR_STATUS.PRE_REGISTERED).length,
    onPremises:    visitors.filter(v => v.status === VISITOR_STATUS.ON_PREMISES).length,
    signedOff:     visitors.filter(v => v.status === VISITOR_STATUS.SIGNED_OFF).length,
    exited:        visitors.filter(v => v.status === VISITOR_STATUS.EXITED).length,
  };

  // ── Full-screen sub-screens ───────────────────────────────────────────────
  if (screen === SCREEN.CHECK_IN && selectedVisitor) {
    return (
      <SafeAreaView style={appStyles.safeArea}>
        <Header title="Check-In" onBack={goToDashboard} />
        <Checkinscreen
          visitor={selectedVisitor}
          onCheckInComplete={(updated) => { updateVisitor(updated); goToDashboard(); }}
          onCancel={goToDashboard}
        />
      </SafeAreaView>
    );
  }

  if (screen === SCREEN.SIGNATURE && selectedVisitor) {
    return (
      <SafeAreaView style={appStyles.safeArea}>
        <Header title="Host Signature" onBack={goToDashboard} />
        <SignatureScreen
          visitor={selectedVisitor}
          onSignatureComplete={(sig) => {
            updateVisitor({
              ...selectedVisitor,
              status: VISITOR_STATUS.SIGNED_OFF,
              signedOffAt: new Date().toISOString(),
              signature: sig,
            });
            Alert.alert('Visit Approved', `${selectedVisitor.name}'s visit has been signed off.`);
            goToDashboard();
          }}
          onCancel={goToDashboard}
        />
      </SafeAreaView>
    );
  }

  if (screen === SCREEN.OTP && selectedVisitor) {
    return (
      <SafeAreaView style={appStyles.safeArea}>
        <Header title="Exit Verification" onBack={goToDashboard} />
        <OTPVerify
          visitor={selectedVisitor}
          otp={activeOTP}
          onSuccess={() => {
            updateVisitor({
              ...selectedVisitor,
              status: VISITOR_STATUS.EXITED,
              exitedAt: new Date().toISOString(),
              otp: null,
            });
            setTimeout(() => {
              Alert.alert('Exit Authorized', `${selectedVisitor.name} has successfully exited.`);
              goToDashboard();
            }, 500);
          }}
          onCancel={goToDashboard}
        />
      </SafeAreaView>
    );
  }

  if (screen === SCREEN.PRE_REGISTER) {
    return (
      <SafeAreaView style={appStyles.safeArea}>
        <Header title="Pre-Book Visitor" onBack={goToDashboard} />
        <Preregisterscreen
          onCancel={goToDashboard}
          onSave={(newVisitor) => {
            saveVisitors([newVisitor, ...visitors]);
            goToDashboard();
            Alert.alert('Success', 'Visitor Pre-Registered Successfully');
          }}
        />
      </SafeAreaView>
    );
  }

  // ── Main Shell with Tab Bar ───────────────────────────────────────────────
  return (
    <SafeAreaView style={appStyles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* Top Bar */}
      <View style={appStyles.topBar}>
        <View>
          <Text style={appStyles.appName}>CorpGuard VMS</Text>
          <Text style={appStyles.appSubtitle}>Visitor Management System</Text>
        </View>
        <TouchableOpacity style={appStyles.resetBtn} onPress={handleResetData}>
          <Text style={appStyles.resetBtnText}>↺ Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Strip */}
      <View style={appStyles.statsStrip}>
        <StatChip label="Pending" count={stats.preRegistered} color="#3B82F6" />
        <StatChip label="Inside"  count={stats.onPremises}    color="#059669" />
        <StatChip label="Signed"  count={stats.signedOff}     color="#D97706" />
        <StatChip label="Exited"  count={stats.exited}        color="#6B7280" />
      </View>

      {/* Tab Content */}
      <View style={appStyles.tabContent}>
        {activeTab === TAB.HOME ? (
          <Dashboard visitors={visitors} />
        ) : (
          <Visitorlist visitors={visitors} onSelectVisitor={handleSelectVisitor} />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <SafeAreaView edges={['bottom']} style={appStyles.tabBarSafe}>
        <View style={appStyles.tabBar}>
          {/* Dashboard Tab */}
          <TouchableOpacity
            style={[appStyles.tabItem, activeTab === TAB.HOME && appStyles.tabItemActive]}
            onPress={() => setActiveTab(TAB.HOME)}
          >
            <Text style={appStyles.tabIcon}>📊</Text>
            <Text style={[appStyles.tabLabel, activeTab === TAB.HOME && appStyles.tabLabelActive]}>
              Dashboard
            </Text>
            {activeTab === TAB.HOME && <View style={appStyles.tabIndicator} />}
          </TouchableOpacity>

          {/* FAB Centre Button */}
          <TouchableOpacity
            style={appStyles.fabTab}
            onPress={() => setScreen(SCREEN.PRE_REGISTER)}
          >
            <Text style={appStyles.fabTabIcon}>+</Text>
          </TouchableOpacity>

          {/* Visitors Tab */}
          <TouchableOpacity
            style={[appStyles.tabItem, activeTab === TAB.VISITORS && appStyles.tabItemActive]}
            onPress={() => setActiveTab(TAB.VISITORS)}
          >
            <Text style={appStyles.tabIcon}>👥</Text>
            <Text style={[appStyles.tabLabel, activeTab === TAB.VISITORS && appStyles.tabLabelActive]}>
              Visitors
            </Text>
            {activeTab === TAB.VISITORS && <View style={appStyles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Action Modal */}
      <ActionModal
        visible={modalVisible}
        visitor={selectedVisitor}
        onClose={() => setModalVisible(false)}
        onAction={handleAction}
      />
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
const Header = ({ title, onBack }) => (
  <View style={appStyles.screenHeader}>
    <TouchableOpacity style={appStyles.backBtn} onPress={onBack}>
      <Text style={appStyles.backBtnText}>← Back</Text>
    </TouchableOpacity>
    <Text style={appStyles.screenTitle}>{title}</Text>
    <View style={{ width: 60 }} />
  </View>
);

const StatChip = ({ label, count, color }) => (
  <View style={[appStyles.statChip, { borderColor: color }]}>
    <Text style={[appStyles.statCount, { color }]}>{count}</Text>
    <Text style={appStyles.statLabel}>{label}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const appStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1D4ED8' },

  topBar: {
    backgroundColor: '#1D4ED8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  appName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 11, color: '#BFDBFE', marginTop: 2, letterSpacing: 1 },
  resetBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  resetBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  statChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 2,
  },
  statCount: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#6B7280', fontWeight: '500', marginTop: 1 },

  tabContent: { flex: 1, backgroundColor: '#F1F5F9' },

  tabBarSafe: { backgroundColor: '#FFFFFF' },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    position: 'relative',
  },
  tabItemActive: { backgroundColor: '#EFF6FF' },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  tabLabelActive: { color: '#1D4ED8' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    backgroundColor: '#1D4ED8',
    borderRadius: 2,
  },

  fabTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTabIcon: { color: '#FFFFFF', fontSize: 30, fontWeight: '300', lineHeight: 34 },

  screenHeader: {
    backgroundColor: '#1D4ED8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 80,
  },
  backBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  screenTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  handle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  visitorHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  visitorName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  visitorCompany: { fontSize: 13, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  actionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  noActions: { textAlign: 'center', color: '#6B7280', fontSize: 14, paddingVertical: 16 },
  closeBtn: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', marginTop: 4 },
  closeBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },
});