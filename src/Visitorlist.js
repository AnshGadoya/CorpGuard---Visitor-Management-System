// VisitorList.js
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { VISITOR_STATUS } from './Dummydata';

const STATUS_CONFIG = {
  [VISITOR_STATUS.PRE_REGISTERED]: {
    label: 'Pre-Registered',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  [VISITOR_STATUS.ON_PREMISES]: {
    label: 'On Premises',
    color: '#059669',
    bg: '#ECFDF5',
  },
  [VISITOR_STATUS.SIGNED_OFF]: {
    label: 'Signed Off',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  [VISITOR_STATUS.EXITED]: {
    label: 'Exited',
    color: '#6B7280',
    bg: '#F3F4F6',
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG[VISITOR_STATUS.PRE_REGISTERED];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
      <View style={[styles.badgeDot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const VisitorCard = ({ visitor, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(visitor)} activeOpacity={0.85}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{visitor.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cardHeaderInfo}>
        <Text style={styles.visitorName}>{visitor.name}</Text>
        <Text style={styles.visitorCompany}>{visitor.company}</Text>
      </View>
      <StatusBadge status={visitor.status} />
    </View>

    <View style={styles.divider} />

    <View style={styles.cardBody}>
      <InfoRow icon="🎯" label="Purpose" value={visitor.purpose} />
      <InfoRow icon="🏢" label="Department" value={visitor.department} />
      <InfoRow icon="👤" label="Host" value={visitor.host} />
      {visitor.gatepassNumber && (
        <InfoRow icon="🪪" label="Gatepass" value={visitor.gatepassNumber} />
      )}
    </View>

    <View style={styles.cardFooter}>
      <Text style={styles.visitorId}>{visitor.id}</Text>
      <Text style={styles.tapHint}>Tap for actions →</Text>
    </View>
  </TouchableOpacity>
);

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoLabel}>{label}: </Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const Visitorlist = ({ visitors, onSelectVisitor }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = ['ALL', 'PRE_REGISTERED', 'ON_PREMISES', 'SIGNED_OFF', 'EXITED'];

  const filtered = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.company.toLowerCase().includes(search.toLowerCase()) ||
      v.host.toLowerCase().includes(search.toLowerCase()) ||
      (v.gatepassNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'ALL' || v.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, company, host..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => {
          const cfg = f === 'ALL' ? null : STATUS_CONFIG[f];
          const isActive = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: cfg ? cfg.color : '#1D4ED8', borderColor: cfg ? cfg.color : '#1D4ED8' },
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f === 'ALL' ? 'All' : STATUS_CONFIG[f].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Count */}
      <Text style={styles.countText}>
        {filtered.length} visitor{filtered.length !== 1 ? 's' : ''} found
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VisitorCard visitor={item} onPress={onSelectVisitor} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No visitors found</Text>
            <Text style={styles.emptySubText}>Try adjusting your search or filter</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  clearBtn: { fontSize: 14, color: '#9CA3AF', paddingLeft: 8 },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginRight: 4,
    marginBottom: 4,
  },
  filterChipText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF' },

  countText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 18,
    marginBottom: 6,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  cardHeaderInfo: { flex: 1 },
  visitorName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  visitorCompany: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },

  cardBody: { gap: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 13, marginRight: 6 },
  infoLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#374151', flex: 1 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  visitorId: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },
  tapHint: { fontSize: 11, color: '#3B82F6' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySubText: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
});

export default Visitorlist;