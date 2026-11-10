import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookingScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Booking status</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.card}>
        <Text style={styles.status}>Confirmed</Text>
        <Text style={styles.event}>Birthday Celebration</Text>
        <Text style={styles.info}>Date: 14 December 2026</Text>
        <Text style={styles.info}>Venue: Garden Pavilion</Text>
        <Text style={styles.info}>Guest Count: 80</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F0E8' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D2D2D' },
  backButton: { backgroundColor: '#2F3E36', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  backText: { color: '#FFF8F2', fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 22 },
  status: { fontSize: 26, fontWeight: '800', color: '#304F47', marginBottom: 8 },
  event: { fontSize: 20, fontWeight: '700', color: '#1F1F1F', marginBottom: 12 },
  info: { color: '#5B544F', fontSize: 15, marginBottom: 8 },
});
