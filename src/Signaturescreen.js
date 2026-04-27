// SignatureScreen.js
import React, { useRef, useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';

const SignatureScreen = ({visitor, onSignatureComplete, onCancel}) => {
    const sigRef = useRef(null);
    const [signed, setSigned] = useState(false);
    const [signatureData, setSignatureData] = useState(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const handleOK = (sig) => {
        if (sig && sig.length > 1000) {
            setSignatureData(sig);
            setSigned(true);
        } else {
            Alert.alert('Empty Signature', 'Please draw your signature before confirming.');
        }
    };

    const handleClear = () => {
        sigRef.current?.clearSignature();
        setSigned(false);
        setSignatureData(null);
    };

    const handleConfirm = () => {
        if (!signed || !signatureData) {
            Alert.alert('No Signature', 'Please sign before confirming.');
            return;
        }
        Alert.alert(
            'Confirm Approval',
            `You are approving the visit of ${visitor.name} from ${visitor.company}. This action cannot be undone.`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Approve Visit',
                    onPress: () => onSignatureComplete(signatureData),
                },
            ]
        );
    };

    const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      background: transparent;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer { display: none; }
    body { background: transparent; margin: 0; padding: 0; }
    canvas { border-radius: 10px; }
  `;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} scrollEnabled={scrollEnabled}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Host Approval</Text>
                <Text style={styles.headerSubtitle}>Review visitor details and sign to approve</Text>
            </View>

            {/* Visitor Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{visitor.name.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text style={styles.visitorName}>{visitor.name}</Text>
                        <Text style={styles.visitorCompany}>{visitor.company}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>🎯</Text>
                    <Text style={styles.infoLabel}>Purpose: </Text>
                    <Text style={styles.infoValue}>{visitor.purpose}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>🏢</Text>
                    <Text style={styles.infoLabel}>Department: </Text>
                    <Text style={styles.infoValue}>{visitor.department}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📞</Text>
                    <Text style={styles.infoLabel}>Phone: </Text>
                    <Text style={styles.infoValue}>{visitor.phone}</Text>
                </View>
                {visitor.gatepassNumber && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🪪</Text>
                        <Text style={styles.infoLabel}>Gatepass: </Text>
                        <Text style={styles.infoValue}>{visitor.gatepassNumber}</Text>
                    </View>
                )}
            </View>

            {/* Signature Pad */}
            <View style={styles.signatureSection}>
                <Text style={styles.sectionTitle}>Host Signature</Text>
                <Text style={styles.sectionHint}>
                    {visitor.host}, please sign below to verify and approve this visit
                </Text>

                <View style={styles.signaturePadWrapper}>
                    <SignatureCanvas
                        ref={sigRef}
                        onOK={handleOK}
                        onBegin={() => setScrollEnabled(false)}
                        onEnd={() => {
                            sigRef.current.readSignature();
                            setScrollEnabled(true); // Re-enable scroll
                        }}
                        onEmpty={() => setSigned(false)}
                        descriptionText=""
                        clearText="Clear"
                        confirmText="Save"
                        webStyle={webStyle}
                        style={styles.signaturePad}
                        backgroundColor="rgba(0,0,0,0)"
                        penColor="#1D4ED8"
                        dotSize={2}
                        minWidth={1.5}
                        maxWidth={3}
                    />
                    {!signed && (
                        <View style={styles.signaturePrompt} pointerEvents="none">
                            <Text style={styles.signaturePromptText}>✍️ Sign here</Text>
                        </View>
                    )}
                </View>

                {signed && (
                    <View style={styles.signedBadge}>
                        <Text style={styles.signedBadgeText}>✓ Signature captured</Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                    <Text style={styles.clearBtnText}>🔄 Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.confirmBtn, !signed && styles.confirmBtnDisabled]}
                    onPress={handleConfirm}
                    disabled={!signed}
                >
                    <Text style={styles.confirmBtnText}>✅ Approve Visit</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.legalNote}>
                By signing, {visitor.host} acknowledges responsibility for this visitor during their time on premises.
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#F8FAFC'},
    contentContainer: {padding: 16, paddingBottom: 40},

    header: {marginBottom: 16},
    headerTitle: {fontSize: 22, fontWeight: '800', color: '#111827'},
    headerSubtitle: {fontSize: 14, color: '#6B7280', marginTop: 4},

    infoCard: {backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB',},
    infoCardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12,},
    avatarCircle: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center',},
    avatarText: {color: '#fff', fontSize: 22, fontWeight: '700'},
    visitorName: {fontSize: 18, fontWeight: '700', color: '#111827'},
    visitorCompany: {fontSize: 13, color: '#6B7280'},
    infoRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
    infoIcon: {fontSize: 13, marginRight: 6},
    infoLabel: {fontSize: 13, color: '#9CA3AF', fontWeight: '500'},
    infoValue: {fontSize: 13, color: '#374151', flex: 1},

    signatureSection: {marginBottom: 20},
    sectionTitle: {fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4},
    sectionHint: {fontSize: 13, color: '#6B7280', marginBottom: 12},

    signaturePadWrapper: {height: 220, borderRadius: 14, borderWidth: 2, borderColor: '#BFDBFE', borderStyle: 'dashed', backgroundColor: '#FFFFFF', overflow: 'hidden', position: 'relative', shadowColor: '#1D4ED8', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,},
    signaturePad: {flex: 1},
    signaturePrompt: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center',},
    signaturePromptText: {fontSize: 18, color: '#93C5FD', fontWeight: '500'},

    signedBadge: {marginTop: 8, backgroundColor: '#D1FAE5', borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#6EE7B7',},
    signedBadgeText: {color: '#065F46', fontWeight: '700', fontSize: 13},

    actionsRow: {flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'center',},
    clearBtn: {paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB',},
    clearBtnText: {color: '#374151', fontWeight: '600', fontSize: 13},

    cancelBtn: {paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',},
    cancelBtnText: {color: '#DC2626', fontWeight: '600', fontSize: 13},

    confirmBtn: {flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#059669', alignItems: 'center', shadowColor: '#059669', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,},
    confirmBtnDisabled: {backgroundColor: '#9CA3AF', shadowOpacity: 0},
    confirmBtnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 14},

    legalNote: {fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 16, fontStyle: 'italic',},
});

export default SignatureScreen;