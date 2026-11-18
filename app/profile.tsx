import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PageShell from '../components/PageShell';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  return (
    <PageShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CUSTOMER ACCOUNT</Text>
        <Text style={styles.title}>Welcome, Maria</Text>
      </View>
      <View style={[styles.layout, wide && styles.layoutWide]}>
        <View style={styles.sidebar}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MD</Text>
          </View>
          <Text style={styles.name}>Maria Dela Cruz</Text>
          <Text style={styles.member}>Member since March 2025</Text>
          <View style={styles.menu}>
            <Text style={[styles.menuItem, styles.menuActive]}>Overview</Text>
            <Text style={styles.menuItem}>Reservations</Text>
            <Text style={styles.menuItem}>Account settings</Text>
          </View>
          <Pressable style={styles.logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
        <View style={styles.main}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Reservations</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>₱18.9k</Text>
              <Text style={styles.statLabel}>Latest booking</Text>
            </View>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reservation history</Text>
            <Pressable>
              <Text style={styles.viewText}>View all</Text>
            </Pressable>
          </View>
          <View style={styles.bookingCard}>
            <View>
              <View style={styles.status}>
                <Text style={styles.statusText}>CONFIRMED</Text>
              </View>
              <Text style={styles.eventName}>Birthday Celebration</Text>
              <Text style={styles.eventMeta}>December 14, 2026 • 80 guests</Text>
            </View>
            <View style={styles.bookingRight}>
              <Text style={styles.packageName}>Gold Gathering</Text>
              <Text style={styles.amount}>₱18,900</Text>
            </View>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal details</Text>
            <Pressable>
              <Text style={styles.viewText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.details}>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>hello@robertosplace.com</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Preferred venue</Text>
              <Text style={styles.detailValue}>Garden room</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Favorite package</Text>
              <Text style={styles.detailValue}>Gold Gathering</Text>
            </View>
          </View>
        </View>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  hero: { maxWidth: 1280, width: '100%', alignSelf: 'center', paddingHorizontal: 24, paddingTop: 58, paddingBottom: 24 },
  eyebrow: { color: '#B58A46', fontSize: 10, fontWeight: '900', letterSpacing: 2.4, marginBottom: 10 },
  title: { color: '#38251D', fontFamily: 'Georgia', fontSize: 42, lineHeight: 48 },
  layout: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 24, paddingBottom: 64 },
  layoutWide: { flexWrap: 'nowrap' },
  sidebar: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E8DECF', padding: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#38251D', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  name: { color: '#38251D', fontFamily: 'Georgia', fontSize: 20, marginTop: 12 },
  member: { color: '#887E74', fontSize: 12, marginTop: 4 },
  menu: { marginTop: 24, gap: 4 },
  menuItem: { height: 44, borderRadius: 8, paddingHorizontal: 12, textAlignVertical: 'center', color: '#887E74', fontWeight: '700', fontSize: 13 },
  menuActive: { backgroundColor: '#F3ECE2', color: '#38251D' },
  logout: { height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#D8CCBC', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  logoutText: { color: '#7E5546', fontWeight: '900' },
  main: { flexGrow: 1, minWidth: 280 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { flexGrow: 1, width: '30%', minWidth: 120, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8DECF', padding: 16 },
  statValue: { color: '#38251D', fontFamily: 'Georgia', fontSize: 24 },
  statLabel: { color: '#887E74', fontSize: 11, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: '#38251D', fontFamily: 'Georgia', fontSize: 22 },
  viewText: { color: '#A77D3D', fontWeight: '900', fontSize: 12 },
  bookingCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8DECF', padding: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 },
  status: { alignSelf: 'flex-start', backgroundColor: '#E5EEE8', borderRadius: 12, height: 24, paddingHorizontal: 8, justifyContent: 'center' },
  statusText: { color: '#466657', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  eventName: { color: '#38251D', fontFamily: 'Georgia', fontSize: 20, marginTop: 10 },
  eventMeta: { color: '#887E74', fontSize: 12, marginTop: 5 },
  bookingRight: { alignItems: 'flex-start' },
  packageName: { color: '#887E74', fontSize: 12 },
  amount: { color: '#38251D', fontSize: 18, fontWeight: '900', marginTop: 6 },
  details: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8DECF', paddingHorizontal: 18 },
  detail: { minHeight: 64, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ECE3D7' },
  detailLabel: { color: '#887E74', fontSize: 12 },
  detailValue: { color: '#38251D', fontWeight: '800', fontSize: 12 },
});
