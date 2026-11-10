import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const packages = [
  { name: 'Silver Celebration', price: '₱12,500', details: '50 guests • buffet setup • 3-hour event', accent: '#C2794A' },
  { name: 'Gold Gathering', price: '₱18,900', details: '80 guests • full catering • photo corner', accent: '#F5A623' },
  { name: 'Premium Event', price: '₱26,400', details: '150 guests • premium menu • event styling', accent: '#304F47' },
];

export default function PackagesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Catering packages</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {packages.map((item) => (
        <View key={item.name} style={[styles.card, { borderColor: item.accent }]}>
          <Text style={[styles.packageName, { color: item.accent }]}>{item.name}</Text>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.details}>{item.details}</Text>
        </View>
      ))}
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
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, borderWidth: 2, marginBottom: 16 },
  packageName: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 26, color: '#1E1E1E', fontWeight: '800', marginBottom: 6 },
  details: { color: '#5B544F', fontSize: 14, lineHeight: 20 },
});
