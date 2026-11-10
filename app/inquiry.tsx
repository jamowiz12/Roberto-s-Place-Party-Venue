import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function InquiryScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Event inquiry</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.formCard}>
        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#7F7F7F" />
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#7F7F7F" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Event type" placeholderTextColor="#7F7F7F" />
        <TextInput style={styles.textArea} placeholder="Tell us about your event" placeholderTextColor="#7F7F7F" multiline numberOfLines={5} />
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Submit inquiry</Text>
        </TouchableOpacity>
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
  formCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 18 },
  input: { backgroundColor: '#F7F3EE', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E9D8C3' },
  textArea: { backgroundColor: '#F7F3EE', borderRadius: 12, padding: 14, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E9D8C3' },
  submitButton: { marginTop: 18, backgroundColor: '#304F47', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#FFF7EE', fontWeight: '700', fontSize: 16 },
});
