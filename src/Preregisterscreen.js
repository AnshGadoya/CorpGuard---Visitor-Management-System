import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const Preregisterscreen = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    company: '',
    purpose: '',
    department: '',
    host: '',
    expectedDate: new Date().toLocaleDateString(), // Basic date string
  });

  const handleSubmit = () => {
    // Basic Validation
    if (!form.name || !form.phone || !form.host) {
      Alert.alert("Missing Info", "Please fill Name, Phone, and Host name.");
      return;
    }

    const newVisitor = {
      ...form,
      id: `VIS-${Date.now()}`, // Generate unique ID
      status: 'PRE_REGISTERED',
      preRegisteredAt: new Date().toISOString(),
      checkInAt: null,
      photo: null,
      gatepassNumber: null,
    };

    onSave(newVisitor);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Visitor Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        onChangeText={(t) => setForm({...form, name: t})}
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="+91..."
        keyboardType="phone-pad"
        onChangeText={(t) => setForm({...form, phone: t})}
      />

      <View style={styles.row}>
        <View style={{flex: 1, marginRight: 10}}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            onChangeText={(t) => setForm({...form, company: t})}
          />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. IT, HR"
            onChangeText={(t) => setForm({...form, department: t})}
          />
        </View>
      </View>

      <Text style={styles.label}>Meeting Host (Whom to meet?) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Employee Name"
        onChangeText={(t) => setForm({...form, host: t})}
      />

      <Text style={styles.label}>Purpose of Visit</Text>
      <TextInput
        style={[styles.input, {height: 80}]}
        placeholder="Reason for visit..."
        multiline
        onChangeText={(t) => setForm({...form, purpose: t})}
      />

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Register Visitor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20, paddingBottom: 40 },
  saveBtn: { flex: 2, backgroundColor: '#1D4ED8', padding: 15, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { flex: 1, backgroundColor: '#F3F4F6', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' }
});

export default Preregisterscreen;