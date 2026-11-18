import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import PageShell from '../components/PageShell';

const packages = [
  { name: 'Silver Celebration', price: '₱12,500', guests: 'Up to 50 guests', description: 'A polished buffet, essential service setup, and a complete dining experience.', inclusions: ['Buffet setup', '3 entrée selections', 'Standard service'] },
  { name: 'Gold Gathering', price: '₱18,900', guests: 'Up to 80 guests', description: 'A fuller celebration package with expanded choices and a welcoming event layout.', inclusions: ['Expanded buffet', '5 entrée selections', 'Photo corner'] },
  { name: 'Premium Event', price: '₱26,400', guests: 'Up to 150 guests', description: 'Our most complete hosting package for memorable, beautifully styled occasions.', inclusions: ['Premium menu', 'Dessert station', 'Event styling'] },
];

export default function PackagesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;

  return (
    <PageShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CELEBRATION PACKAGES</Text>
        <Text style={styles.title}>Choose the perfect table</Text>
        <Text style={styles.subtitle}>Thoughtfully prepared package options for intimate gatherings and grand celebrations.</Text>
      </View>
      <View style={[styles.grid, wide && styles.gridWide]}>
        {packages.map((item, index) => (
          <View key={item.name} style={[styles.card, index === 1 && styles.featured]}>
            {index === 1 ? <View style={styles.badge}><Text style={styles.badgeText}>MOST POPULAR</Text></View> : null}
            <Text style={styles.packageName}>{item.name}</Text>
            <Text style={styles.guests}>{item.guests}</Text>
            <View style={styles.divider} />
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.inclusions}>{item.inclusions.map((line) => <Text key={line} style={styles.inclusion}>✓  {line}</Text>)}</View>
            <Pressable onPress={() => router.push('/booking')} style={styles.button}><Text style={styles.buttonText}>Book this package</Text></Pressable>
          </View>
        ))}
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  hero: { maxWidth: 1280, width: '100%', alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 58 },
  eyebrow: { color: '#B58A46', fontSize: 10, fontWeight: '900', letterSpacing: 2.4, marginBottom: 10 },
  title: { color: '#38251D', fontFamily: 'Georgia', fontSize: 42, lineHeight: 48 },
  subtitle: { color: '#887E74', fontSize: 15, lineHeight: 23, marginTop: 12, maxWidth: 560 },
  grid: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 24, paddingBottom: 64 },
  gridWide: { flexWrap: 'nowrap' },
  card: { width: '100%', minHeight: 420, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 24, borderWidth: 1, borderColor: '#E8DECF', position: 'relative' },
  featured: { borderColor: '#C49A55', borderWidth: 2 },
  badge: { position: 'absolute', right: 16, top: 16, backgroundColor: '#38251D', borderRadius: 20, paddingHorizontal: 10, height: 25, justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  packageName: { color: '#38251D', fontFamily: 'Georgia', fontSize: 25, paddingRight: 90 },
  guests: { color: '#887E74', fontSize: 12, marginTop: 8 },
  divider: { height: 1, backgroundColor: '#ECE3D7', marginVertical: 20 },
  price: { color: '#A77D3D', fontSize: 26, fontWeight: '900' },
  description: { color: '#887E74', fontSize: 14, lineHeight: 21, marginTop: 12 },
  inclusions: { gap: 8, marginTop: 18, marginBottom: 24 },
  inclusion: { color: '#4D443E', fontSize: 13 },
  button: { height: 48, borderRadius: 8, backgroundColor: '#38251D', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  buttonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
});
