import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function AppFooter() {
  const router = useRouter();
  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>ROBERTO&apos;S PLACE</Text>
          <Text style={styles.tagline}>Party venue &amp; catering for celebrations worth remembering.</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.heading}>Explore</Text>
          <Pressable onPress={() => router.push('/packages')}><Text style={styles.link}>Packages</Text></Pressable>
          <Pressable onPress={() => router.push('/menu')}><Text style={styles.link}>Food menu</Text></Pressable>
          <Pressable onPress={() => router.push('/gallery')}><Text style={styles.link}>Gallery</Text></Pressable>
        </View>
        <View style={styles.column}>
          <Text style={styles.heading}>Visit &amp; inquire</Text>
          <Text style={styles.link}>hello@robertosplace.com</Text>
          <Text style={styles.link}>Celebrations, catering &amp; venue</Text>
          <Pressable onPress={() => router.push('/inquiry')}><Text style={[styles.link, styles.goldLink]}>Send an inquiry →</Text></Pressable>
        </View>
      </View>
      <View style={styles.bottom}><Text style={styles.copyright}>© 2026 Roberto&apos;s Place Party Venue</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { backgroundColor: '#38251D', paddingTop: 48 },
  inner: { maxWidth: 1280, width: '100%', alignSelf: 'center', paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 38, paddingBottom: 38 },
  brandBlock: { flexGrow: 1, minWidth: 220, maxWidth: 440 },
  brand: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 1.5 },
  tagline: { color: '#D6CBBB', fontSize: 13, lineHeight: 21, marginTop: 12, maxWidth: 330 },
  column: { width: 230, gap: 9 },
  heading: { color: '#C49A55', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 5 },
  link: { color: '#F5EFE6', fontSize: 13, lineHeight: 20 },
  goldLink: { color: '#C49A55', fontWeight: '800', marginTop: 5 },
  bottom: { borderTopWidth: 1, borderTopColor: '#514036', minHeight: 58, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  copyright: { color: '#AFA296', fontSize: 11 },
});
