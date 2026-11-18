import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import PageShell from '../components/PageShell';

const items = [
  ['Garden Setup', 'Venue', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80'],
  ['Celebration Table', 'Catering', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80'],
  ['Main Hall', 'Venue', 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80'],
  ['Reception', 'Events', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80'],
  ['Wedding Stage', 'Events', 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80'],
  ['Dining Experience', 'Catering', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80'],
];

export default function GalleryScreen() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<(typeof items)[number] | null>(null);
  const { width } = useWindowDimensions();
  const twoColumn = width >= 768;
  const threeColumn = width >= 1024;
  const visible = filter === 'All' ? items : items.filter((item) => item[1] === filter);

  return (
    <PageShell>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>OUR GALLERY</Text>
        <Text style={styles.title}>Moments beautifully hosted</Text>
      </View>
      <View style={styles.filters}>
        {['All', 'Venue', 'Catering', 'Events'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.grid}>
        {visible.map((item) => (
          <Pressable
            key={item[0]}
            onPress={() => setSelected(item)}
            style={[styles.tile, twoColumn && styles.tileTwo, threeColumn && styles.tileThree]}
          >
            <Image source={{ uri: item[2] }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageShade} />
            <Text style={styles.label}>{item[0]}</Text>
          </Pressable>
        ))}
      </View>
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <View style={styles.modalCard}>
            <Pressable onPress={() => setSelected(null)} style={styles.close}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
            {selected ? (
              <>
                <Image source={{ uri: selected[2] }} style={styles.modalImage} resizeMode="cover" />
                <Text style={styles.modalLabel}>{selected[0]}</Text>
              </>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  hero: { maxWidth: 1280, width: '100%', alignSelf: 'center', paddingHorizontal: 24, paddingTop: 58, paddingBottom: 24 },
  eyebrow: { color: '#B58A46', fontSize: 10, fontWeight: '900', letterSpacing: 2.4, marginBottom: 10 },
  title: { color: '#38251D', fontFamily: 'Georgia', fontSize: 42, lineHeight: 48 },
  filters: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24, paddingBottom: 24 },
  filter: { height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#D9CCBC', paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#FFFFFF' },
  filterActive: { backgroundColor: '#38251D', borderColor: '#38251D' },
  filterText: { color: '#5E554F', fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: '#FFFFFF' },
  grid: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 24, paddingBottom: 64 },
  tile: { width: '100%', height: 280, borderRadius: 12, overflow: 'hidden' },
  tileTwo: { width: '48.8%' },
  tileThree: { width: '32.2%' },
  image: { width: '100%', height: '100%' },
  imageShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, backgroundColor: 'rgba(56,37,29,0.42)' },
  label: { position: 'absolute', left: 16, bottom: 16, color: '#FFFFFF', fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(30,20,15,0.82)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { maxWidth: 900, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  close: { position: 'absolute', right: 12, top: 12, zIndex: 2, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#38251D', fontSize: 24 },
  modalImage: { width: '100%', height: 500 },
  modalLabel: { color: '#38251D', fontFamily: 'Georgia', fontSize: 24, padding: 18 },
});
