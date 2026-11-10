import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const galleryItems = [
  { label: 'Garden Setup', color: '#304F47' },
  { label: 'Main Hall', color: '#B98357' },
  { label: 'Reception', color: '#F5A623' },
  { label: 'Wedding Stage', color: '#8B5E3C' },
];

export default function GalleryScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Venue gallery</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.grid}>
        {galleryItems.map((item) => (
          <View key={item.label} style={[styles.tile, { backgroundColor: item.color }]}>
            <Text style={styles.tileText}>{item.label}</Text>
          </View>
        ))}
      </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '48%', height: 170, borderRadius: 20, justifyContent: 'flex-end', padding: 16, marginBottom: 16 },
  tileText: { color: '#FFFDF9', fontWeight: '700', fontSize: 18 },
});
