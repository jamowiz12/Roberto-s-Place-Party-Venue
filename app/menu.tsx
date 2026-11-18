import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PageShell from '../components/PageShell';

const categories = ['All dishes', 'Mains', 'Noodles', 'Sides', 'Desserts'];
const items = [
  { name: 'Beef Caldereta', category: 'Mains', description: 'Tender beef in a rich tomato and pepper sauce.', price: '₱680', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80' },
  { name: 'Chicken Inasal', category: 'Mains', description: 'Char-grilled chicken with citrus and annatto aromatics.', price: '₱540', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=80' },
  { name: 'Pancit Canton', category: 'Noodles', description: 'Classic noodles with vegetables and savory toppings.', price: '₱520', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80' },
  { name: 'Garden Vegetables', category: 'Sides', description: 'Seasonal vegetables prepared with a light garlic finish.', price: '₱420', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80' },
  { name: 'Fruit Platter', category: 'Desserts', description: 'A fresh selection of colorful seasonal fruit.', price: '₱460', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=700&q=80' },
];

export default function MenuScreen() {
  const [category, setCategory] = useState('All dishes');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const visible = category === 'All dishes' ? items : items.filter((item) => item.category === category);
  const selectedCount = Object.values(quantities).reduce((sum, value) => sum + value, 0);

  const change = (name: string, amount: number) => setQuantities((current) => ({ ...current, [name]: Math.max(0, (current[name] || 0) + amount) }));

  return (
    <PageShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>THE CELEBRATION TABLE</Text>
        <Text style={styles.title}>Food made for sharing</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]}>
            <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={[styles.grid, wide && styles.gridWide]}>
        {visible.map((item) => (
          <View key={item.name} style={styles.card}>
            <View style={styles.imageWrap} />
            <View style={styles.cardBody}>
              <Text style={styles.categoryLabel}>{item.category}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.quantity}>
                  <Pressable onPress={() => change(item.name, -1)} style={styles.quantityButton}>
                    <Text style={styles.quantityText}>−</Text>
                  </Pressable>
                  <Text style={styles.quantityValue}>{quantities[item.name] || 0}</Text>
                  <Pressable onPress={() => change(item.name, 1)} style={styles.quantityButton}>
                    <Text style={styles.quantityText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
      {selectedCount > 0 ? (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>{selectedCount} selection{selectedCount === 1 ? '' : 's'} ready</Text>
          <Pressable style={styles.summaryButton}>
            <Text style={styles.summaryButtonText}>Add to reservation</Text>
          </Pressable>
        </View>
      ) : null}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  hero: { maxWidth: 1280, width: '100%', alignSelf: 'center', paddingHorizontal: 24, paddingTop: 58, paddingBottom: 24 },
  eyebrow: { color: '#B58A46', fontSize: 10, fontWeight: '900', letterSpacing: 2.4, marginBottom: 10 },
  title: { color: '#38251D', fontFamily: 'Georgia', fontSize: 42, lineHeight: 48 },
  categories: { maxWidth: 1280, width: '100%', alignSelf: 'center', gap: 8, paddingHorizontal: 24, paddingBottom: 24 },
  category: { height: 42, borderRadius: 22, borderWidth: 1, borderColor: '#D9CCBC', paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#FFFFFF' },
  categoryActive: { backgroundColor: '#38251D', borderColor: '#38251D' },
  categoryText: { color: '#5E554F', fontSize: 12, fontWeight: '800' },
  categoryTextActive: { color: '#FFFFFF' },
  grid: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 24, paddingBottom: 64 },
  gridWide: { gap: 16 },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E8DECF' },
  imageWrap: { height: 170, backgroundColor: '#D8C9B4' },
  cardBody: { padding: 18 },
  categoryLabel: { color: '#B58A46', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  itemName: { color: '#38251D', fontFamily: 'Georgia', fontSize: 21, marginTop: 7 },
  description: { color: '#887E74', fontSize: 13, lineHeight: 20, marginTop: 8, minHeight: 40 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  price: { color: '#38251D', fontSize: 17, fontWeight: '900' },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quantityButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#D8CCBC', alignItems: 'center', justifyContent: 'center' },
  quantityText: { color: '#38251D', fontSize: 18, fontWeight: '800' },
  quantityValue: { minWidth: 18, textAlign: 'center', color: '#38251D', fontWeight: '900' },
  summary: { position: 'absolute', left: 14, right: 14, bottom: 14, height: 64, borderRadius: 10, backgroundColor: '#38251D', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  summaryText: { color: '#FFFFFF', fontWeight: '800' },
  summaryButton: { height: 40, borderRadius: 7, backgroundColor: '#C49A55', paddingHorizontal: 12, justifyContent: 'center' },
  summaryButtonText: { color: '#38251D', fontWeight: '900', fontSize: 12 },
});
