// CheckInScreen.js
import React, { useState, useRef } from 'react';
import {View,Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator,} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Print from 'expo-print';
import {generateGatepassHTML} from "./Gatepasstemplate";
import {generateGatepassNumber} from "./Dummydata";

const Checkinscreen = ({ visitor, onCheckInComplete, onCancel }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const pic = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      setPhoto(pic);
      setCameraOpen(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to capture photo.');
    }
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to capture visitor photo.');
        return;
      }
    }
    setCameraOpen(true);
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const gatepassNumber = generateGatepassNumber();
      const now = new Date().toISOString();

      const updatedVisitor = {
        ...visitor,
        status: 'ON_PREMISES',
        checkInAt: now,
        gatepassNumber,
        photo: photo ? `data:image/jpeg;base64,${photo.base64}` : null,
      };

      // Generate and print gatepass
      const html = generateGatepassHTML({
        visitor: updatedVisitor,
        photoDataUrl: updatedVisitor.photo,
        qrCodeDataUrl: null, // In production, use a QR library
      });

      const { uri } = await Print.printToFileAsync({ html });

      Alert.alert(
        'Gatepass Generated',
        `Gatepass ${gatepassNumber} is ready to print.`,
        [
          {
            text: 'Print Now',
            onPress: async () => {
              await Print.printAsync({ uri });
              onCheckInComplete(updatedVisitor);
            },
          },
          {
            text: 'Skip Print',
            onPress: () => onCheckInComplete(updatedVisitor),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Check-in failed. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (cameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front">
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraFrame} />
            <Text style={styles.cameraHint}>Position visitor's face within the frame</Text>
            <View style={styles.cameraActions}>
              <TouchableOpacity style={styles.cancelCameraBtn} onPress={() => setCameraOpen(false)}>
                <Text style={styles.cancelCameraBtnText}>✕ Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <View style={{ width: 80 }} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gatekeeper Check-In</Text>
        <Text style={styles.headerSubtitle}>Verify visitor and capture photo</Text>
      </View>

      {/* Visitor Summary */}
      <View style={styles.infoCard}>
        <View style={styles.cardRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{visitor.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.visitorName}>{visitor.name}</Text>
            <Text style={styles.visitorCompany}>{visitor.company}</Text>
            <Text style={styles.visitorPhone}>{visitor.phone}</Text>
          </View>
        </View>
        <InfoRow icon="🎯" label="Purpose" value={visitor.purpose} />
        <InfoRow icon="🏢" label="Department" value={visitor.department} />
        <InfoRow icon="👤" label="Host" value={visitor.host} />
      </View>

      {/* Photo Capture */}
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Visitor Photo</Text>
        {photo ? (
          <View style={styles.photoPreviewWrapper}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photoPreview}
            />
            <TouchableOpacity style={styles.retakeBtn} onPress={handleOpenCamera}>
              <Text style={styles.retakeBtnText}>🔄 Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraPrompt} onPress={handleOpenCamera}>
            <Text style={styles.cameraPromptIcon}>📷</Text>
            <Text style={styles.cameraPromptText}>Tap to Capture Photo</Text>
            <Text style={styles.cameraPromptHint}>Required for gatepass</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkInBtn, loading && styles.checkInBtnLoading]}
          onPress={handleCheckIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkInBtnText}>✅ Check In & Print Pass</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoLabel}>{label}: </Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 16, paddingBottom: 40 },

  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  visitorName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  visitorCompany: { fontSize: 13, color: '#6B7280' },
  visitorPhone: { fontSize: 13, color: '#3B82F6' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoIcon: { fontSize: 13, marginRight: 6 },
  infoLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#374151', flex: 1 },

  photoSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  cameraPrompt: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  cameraPromptIcon: { fontSize: 48, marginBottom: 8 },
  cameraPromptText: { fontSize: 15, fontWeight: '600', color: '#1D4ED8' },
  cameraPromptHint: { fontSize: 12, color: '#93C5FD', marginTop: 4 },

  photoPreviewWrapper: { alignItems: 'center', gap: 12 },
  photoPreview: {
    width: 200,
    height: 240,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#BFDBFE',
    resizeMode: 'cover',
  },
  retakeBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  retakeBtnText: { color: '#374151', fontWeight: '600', fontSize: 13 },

  actionsRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  checkInBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  checkInBtnLoading: { backgroundColor: '#93C5FD' },
  checkInBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  // Camera
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 40,
  },
  cameraFrame: {
    width: 220,
    height: 280,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    marginTop: 40,
  },
  cameraHint: { color: '#FFFFFF', fontSize: 14, textAlign: 'center', opacity: 0.9 },
  cameraActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  cancelCameraBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: 80,
    alignItems: 'center',
  },
  cancelCameraBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  captureBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
});

export default Checkinscreen;