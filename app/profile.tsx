import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const profileDetails = [
  ['Member since', 'March 2025'],
  ['Favorite package', 'Gold Gathering'],
  ['Preferred venue', 'Garden room'],
  ['Contact', 'hello@robertosplace.com'],
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Customer profile</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.name}>Maria Dela Cruz</Text>
        <Text style={styles.role}>Event Planner</Text>
      </View>

      {profileDetails.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5EFE9' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D2D2D' },
  backButton: { backgroundColor: '#2F3E36', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  backText: { color: '#FFF8F2', fontWeight: '600' },
  profileCard: { backgroundColor: '#2F3E36', borderRadius: 18, padding: 22, marginBottom: 18 },
  name: { color: '#FFF7EE', fontSize: 26, fontWeight: '700' },
  role: { color: '#E5D8C9', fontSize: 14, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 10 },
  label: { color: '#5B544F', fontWeight: '600' },
  value: { color: '#1A1A1A', fontWeight: '700' },
});
