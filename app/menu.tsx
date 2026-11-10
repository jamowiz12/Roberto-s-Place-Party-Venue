import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const menuItems = [
  { name: 'Pancit Canton', type: 'Signature Noodles', price: '₱520', accent: '#F5A623' },
  { name: 'Beef Caldereta', type: 'Main Course', price: '₱680', accent: '#8B5E3C' },
  { name: 'Chicken Inasal', type: 'Fried Favorite', price: '₱540', accent: '#C2794A' },
  { name: 'Fruit Platter', type: 'Dessert & Refreshment', price: '₱460', accent: '#304F47' },
];

export default function MenuScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Food menu</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {menuItems.map((item) => (
        <View key={item.name} style={styles.card}>
          <View style={[styles.badge, { backgroundColor: item.accent }]} />
          <View style={styles.cardContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemType}>{item.type}</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F1E7' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D2D2D' },
  backButton: { backgroundColor: '#2F3E36', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  backText: { color: '#FFF8F2', fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  badge: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  cardContent: { flex: 1 },
  itemName: { color: '#1A1A1A', fontSize: 18, fontWeight: '700' },
  itemType: { color: '#6B625E', fontSize: 13, marginTop: 4 },
  price: { color: '#A66A39', fontSize: 18, fontWeight: '700' },
});
