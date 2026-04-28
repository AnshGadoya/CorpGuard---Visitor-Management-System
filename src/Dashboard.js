// Dashboard.js
// Pure React Native dashboard with custom-drawn charts (no external chart libraries)
// Uses only StyleSheet, View, Text, Animated — fully compatible with Expo

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { VISITOR_STATUS } from './Dummydata';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  [VISITOR_STATUS.PRE_REGISTERED]: { label: 'Pre-Registered', color: '#3B82F6', emoji: '📋' },
  [VISITOR_STATUS.ON_PREMISES]:    { label: 'On Premises',    color: '#059669', emoji: '🏢' },
  [VISITOR_STATUS.SIGNED_OFF]:     { label: 'Signed Off',     color: '#D97706', emoji: '✍️' },
  [VISITOR_STATUS.EXITED]:         { label: 'Exited',         color: '#6B7280', emoji: '🚪' },
};

const getDepartmentStats = (visitors) => {
  const map = {};
  visitors.forEach((v) => {
    const dept = v.department || 'Unknown';
    map[dept] = (map[dept] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};

const getHourlyData = (visitors) => {
  const hours = Array(12).fill(0); // 8am–7pm
  visitors.forEach((v) => {
    if (v.checkInAt) {
      const h = new Date(v.checkInAt).getHours();
      const idx = Math.min(Math.max(h - 8, 0), 11);
      hours[idx]++;
    }
  });
  return hours;
};

const getPurposeStats = (visitors) => {
  const map = {};
  visitors.forEach((v) => {
    const key = (v.purpose || 'General').split(' ').slice(0, 2).join(' ');
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const DONUT_COLORS = ['#3B82F6', '#059669', '#D97706', '#6B7280', '#EC4899', '#8B5CF6'];

// ─── Animated Bar ─────────────────────────────────────────────────────────────

const AnimatedBar = ({ value, max, color, delay = 0, height = 120 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = max > 0 ? value / max : 0;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [value, max]);

  const barHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  return (
    <View style={{ height, justifyContent: 'flex-end' }}>
      <Animated.View
        style={{
          height: barHeight,
          backgroundColor: color,
          borderRadius: 6,
          width: '100%',
        }}
      />
    </View>
  );
};

// ─── Animated Ring (Donut) ────────────────────────────────────────────────────

const DonutSegment = ({ percent, color, index, total }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percent,
      duration: 600,
      delay: index * 80,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[donutStyles.track, { backgroundColor: color + '22' }]}>
      <Animated.View style={[donutStyles.fill, { width, backgroundColor: color }]} />
    </View>
  );
};

const donutStyles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, color, emoji, subtitle }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.kpiCard, { borderLeftColor: color, transform: [{ scale: anim }] }]}>
      <Text style={styles.kpiEmoji}>{emoji}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {subtitle ? <Text style={styles.kpiSubtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = ({ visitors = [] }) => {
  const total = visitors.length;
  const statusCounts = {
    [VISITOR_STATUS.PRE_REGISTERED]: visitors.filter(v => v.status === VISITOR_STATUS.PRE_REGISTERED).length,
    [VISITOR_STATUS.ON_PREMISES]:    visitors.filter(v => v.status === VISITOR_STATUS.ON_PREMISES).length,
    [VISITOR_STATUS.SIGNED_OFF]:     visitors.filter(v => v.status === VISITOR_STATUS.SIGNED_OFF).length,
    [VISITOR_STATUS.EXITED]:         visitors.filter(v => v.status === VISITOR_STATUS.EXITED).length,
  };

  const deptStats    = getDepartmentStats(visitors);
  const hourlyData   = getHourlyData(visitors);
  const purposeStats = getPurposeStats(visitors);
  const maxHourly    = Math.max(...hourlyData, 1);
  const maxDept      = Math.max(...deptStats.map(d => d.count), 1);
  const today        = visitors.filter(v => {
    const d = v.checkInAt || v.preRegisteredAt;
    return d && new Date(d).toDateString() === new Date().toDateString();
  }).length;
  const exitRate = total > 0
    ? Math.round((statusCounts[VISITOR_STATUS.EXITED] / total) * 100)
    : 0;

  const HOUR_LABELS = ['8','9','10','11','12','1','2','3','4','5','6','7'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Banner ── */}
      <View style={styles.heroBanner}>
        <View>
          <Text style={styles.heroTitle}>Analytics Overview</Text>
          <Text style={styles.heroDate}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.totalBubble}>
          <Text style={styles.totalBubbleNum}>{total}</Text>
          <Text style={styles.totalBubbleLabel}>Total</Text>
        </View>
      </View>

      {/* ── KPI Row ── */}
      <View style={styles.kpiGrid}>
        <KpiCard label="Today" value={today}  color="#1D4ED8" emoji="📅" />
        <KpiCard label="Inside"  value={statusCounts[VISITOR_STATUS.ON_PREMISES]} color="#059669" emoji="🏢" />
        <KpiCard label="Pending" value={statusCounts[VISITOR_STATUS.PRE_REGISTERED]} color="#3B82F6" emoji="📋" />
        <KpiCard label="Exit Rate" value={`${exitRate}%`} color="#6B7280" emoji="🚪" />
      </View>

      {/* ── Status Distribution ── */}
      <View style={styles.card}>
        <SectionHeader title="Visitor Status Distribution" subtitle="Current lifecycle breakdown" />
        <View style={styles.statusBarsRow}>
          {Object.entries(statusCounts).map(([status, count], i) => {
            const meta = STATUS_META[status];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <View key={status} style={styles.statusBarCol}>
                <Text style={styles.statusBarValue}>{count}</Text>
                <AnimatedBar
                  value={count}
                  max={Math.max(...Object.values(statusCounts), 1)}
                  color={meta.color}
                  delay={i * 100}
                  height={100}
                />
                <Text style={styles.statusBarPct}>{pct}%</Text>
                <Text style={[styles.statusBarLabel, { color: meta.color }]} numberOfLines={1}>
                  {meta.emoji} {meta.label.split(' ')[0]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Status Progress Bars ── */}
      <View style={styles.card}>
        <SectionHeader title="Status Share" subtitle="Proportional breakdown" />
        {Object.entries(statusCounts).map(([status, count], i) => {
          const meta = STATUS_META[status];
          const pct = total > 0 ? count / total : 0;
          return (
            <View key={status} style={styles.progressRow}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressEmoji}>{meta.emoji}</Text>
                <Text style={styles.progressLabel}>{meta.label}</Text>
                <Text style={[styles.progressCount, { color: meta.color }]}>{count}</Text>
              </View>
              <DonutSegment percent={pct} color={meta.color} index={i} total={total} />
            </View>
          );
        })}
      </View>

      {/* ── Hourly Check-In Chart ── */}
      <View style={styles.card}>
        <SectionHeader title="Check-In Activity by Hour" subtitle="Visitors arriving per hour (8am – 7pm)" />
        <View style={styles.hourlyChart}>
          {hourlyData.map((val, i) => (
            <View key={i} style={styles.hourlyCol}>
              <Text style={styles.hourlyVal}>{val > 0 ? val : ''}</Text>
              <AnimatedBar
                value={val}
                max={maxHourly}
                color={val === Math.max(...hourlyData) ? '#1D4ED8' : '#93C5FD'}
                delay={i * 50}
                height={80}
              />
              <Text style={styles.hourlyLabel}>{HOUR_LABELS[i]}</Text>
            </View>
          ))}
        </View>
        {visitors.filter(v => v.checkInAt).length === 0 && (
          <Text style={styles.noDataHint}>No check-ins recorded yet</Text>
        )}
      </View>

      {/* ── Department Breakdown ── */}
      {deptStats.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="Visits by Department" subtitle="Top departments receiving visitors" />
          {deptStats.map((dept, i) => {
            const color = DONUT_COLORS[i % DONUT_COLORS.length];
            const pct = maxDept > 0 ? dept.count / maxDept : 0;
            return (
              <View key={dept.name} style={styles.deptRow}>
                <View style={styles.deptLabelRow}>
                  <View style={[styles.deptDot, { backgroundColor: color }]} />
                  <Text style={styles.deptName} numberOfLines={1}>{dept.name}</Text>
                  <Text style={[styles.deptCount, { color }]}>{dept.count}</Text>
                </View>
                <DonutSegment percent={pct} color={color} index={i} total={maxDept} />
              </View>
            );
          })}
        </View>
      )}

      {/* ── Purpose Breakdown ── */}
      {purposeStats.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="Purpose of Visit" subtitle="What brings visitors here" />
          <View style={styles.purposeGrid}>
            {purposeStats.map((p, i) => {
              const color = DONUT_COLORS[i % DONUT_COLORS.length];
              const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
              return (
                <View key={p.name} style={[styles.purposeChip, { borderColor: color, backgroundColor: color + '15' }]}>
                  <Text style={[styles.purposePct, { color }]}>{pct}%</Text>
                  <Text style={styles.purposeName} numberOfLines={2}>{p.name}</Text>
                  <Text style={[styles.purposeCount, { color }]}>{p.count} visit{p.count !== 1 ? 's' : ''}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Quick Insights ── */}
      <View style={styles.card}>
        <SectionHeader title="Quick Insights" />
        <InsightRow
          icon="🔥"
          text={
            statusCounts[VISITOR_STATUS.ON_PREMISES] > 0
              ? `${statusCounts[VISITOR_STATUS.ON_PREMISES]} visitor${statusCounts[VISITOR_STATUS.ON_PREMISES] !== 1 ? 's' : ''} currently on premises`
              : 'No visitors currently on premises'
          }
          color="#059669"
        />
        <InsightRow
          icon="⏳"
          text={
            statusCounts[VISITOR_STATUS.SIGNED_OFF] > 0
              ? `${statusCounts[VISITOR_STATUS.SIGNED_OFF]} visitor${statusCounts[VISITOR_STATUS.SIGNED_OFF] !== 1 ? 's' : ''} awaiting exit clearance`
              : 'No pending exits'
          }
          color="#D97706"
        />
        <InsightRow
          icon="📊"
          text={`Overall exit completion rate: ${exitRate}%`}
          color="#1D4ED8"
        />
        <InsightRow
          icon="🏆"
          text={
            deptStats.length > 0
              ? `Most visited dept: ${deptStats[0].name} (${deptStats[0].count} visit${deptStats[0].count !== 1 ? 's' : ''})`
              : 'No department data available yet'
          }
          color="#8B5CF6"
        />
      </View>

      <Text style={styles.footerNote}>
        Data refreshes in real-time from AsyncStorage • CorpGuard VMS v1.0
      </Text>
    </ScrollView>
  );
};

const InsightRow = ({ icon, text, color }) => (
  <View style={[styles.insightRow, { borderLeftColor: color }]}>
    <Text style={styles.insightIcon}>{icon}</Text>
    <Text style={styles.insightText}>{text}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  contentContainer: { padding: 16, paddingBottom: 40 },

  // Hero
  heroBanner: {
    backgroundColor: '#1D4ED8',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  heroDate: { fontSize: 12, color: '#BFDBFE', marginTop: 4 },
  totalBubble: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  totalBubbleNum: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },
  totalBubbleLabel: { fontSize: 10, color: '#BFDBFE', marginTop: -2 },

  // KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderLeftWidth: 4,
    flex: 1,
    minWidth: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiEmoji: { fontSize: 22, marginBottom: 6 },
  kpiValue: { fontSize: 26, fontWeight: '900' },
  kpiLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiSubtitle: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Section Header
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  sectionSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  // Status Bars
  statusBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: 8,
  },
  statusBarCol: { flex: 1, alignItems: 'center', gap: 4 },
  statusBarValue: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  statusBarPct: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  statusBarLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  // Progress Bars
  progressRow: { marginBottom: 12 },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  progressEmoji: { fontSize: 14, marginRight: 6 },
  progressLabel: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '600' },
  progressCount: { fontSize: 14, fontWeight: '800' },

  // Hourly
  hourlyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 3,
  },
  hourlyCol: { flex: 1, alignItems: 'center', gap: 4 },
  hourlyVal: { fontSize: 9, fontWeight: '700', color: '#1D4ED8' },
  hourlyLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '500' },
  noDataHint: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 12, fontStyle: 'italic' },

  // Dept
  deptRow: { marginBottom: 12 },
  deptLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  deptDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  deptName: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '600' },
  deptCount: { fontSize: 14, fontWeight: '800' },

  // Purpose
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  purposeChip: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    minWidth: '43%',
    flex: 1,
    alignItems: 'center',
  },
  purposePct: { fontSize: 22, fontWeight: '900' },
  purposeName: { fontSize: 11, color: '#374151', textAlign: 'center', marginTop: 2, fontWeight: '600' },
  purposeCount: { fontSize: 10, marginTop: 4, fontWeight: '700' },

  // Insight
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  insightIcon: { fontSize: 18, marginRight: 10 },
  insightText: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },

  // Footer
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default Dashboard;