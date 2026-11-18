import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import PageShell from '../components/PageShell';

export default function InquiryScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const wide = width >= 1024;

  const submit = () => {
    if (!name.trim() || !email.includes('@') || !message.trim()) { setError('Please complete your name, email, and event details.'); return; }
    setError(''); setSent(true);
  };

  return (
    <PageShell>
        <View style={[styles.layout, wide && styles.layoutWide]}>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>EVENT INQUIRY</Text>
            <Text style={styles.title}>Tell us what you&apos;re celebrating.</Text>
            <Text style={styles.body}>Share a few details and the Roberto&apos;s Place team can help you plan the right venue, food, and package for your occasion.</Text>
          </View>
          <View style={styles.card}>
            {sent ? (
              <View style={styles.success}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>Inquiry submitted</Text>
                <Text style={styles.successText}>Thank you. Your event details have been received.</Text>
                <Pressable onPress={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }} style={styles.resetButton}>
                  <Text style={styles.resetText}>Send another inquiry</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.formTitle}>Your event details</Text>
                <Text style={styles.label}>Full name</Text>
                <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Maria Dela Cruz" />
                <Text style={styles.label}>Email address</Text>
                <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="maria@example.com" keyboardType="email-address" />
                <Text style={styles.label}>Event type</Text>
                <TextInput style={styles.input} placeholder="Birthday, wedding, corporate event..." />
                <Text style={styles.label}>Tell us about your event</Text>
                <TextInput value={message} onChangeText={setMessage} style={[styles.input, styles.textArea]} placeholder="Date, guest count, venue or catering needs" multiline textAlignVertical="top" />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable onPress={submit} style={styles.submit}>
                  <Text style={styles.submitText}>Submit inquiry</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5EFE9' },
  content: { padding: 20, paddingBottom: 40 },
  layout: { maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, paddingVertical: 58, gap: 24 },
  layoutWide: { alignItems: 'center', flexWrap: 'nowrap' },
  copy: { width: '100%', maxWidth: 520 },
  eyebrow: { color: '#B58A46', fontSize: 10, fontWeight: '900', letterSpacing: 2.4, marginBottom: 12 },
  title: { color: '#38251D', fontFamily: 'Georgia', fontSize: 42, lineHeight: 50 },
  body: { color: '#887E74', fontSize: 15, lineHeight: 24, marginTop: 16, maxWidth: 460 },
  card: { width: '100%', flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E8DECF', padding: 22 },
  formTitle: { color: '#38251D', fontFamily: 'Georgia', fontSize: 24, marginBottom: 18 },
  label: { color: '#4D443E', fontSize: 12, fontWeight: '800', marginBottom: 7, marginTop: 10 },
  input: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#DED3C4', backgroundColor: '#FBF8F3', paddingHorizontal: 13, color: '#29231F' },
  textArea: { height: 120, paddingTop: 12 },
  error: { color: '#9B3E32', fontSize: 12, marginTop: 12 },
  submit: { height: 50, borderRadius: 8, backgroundColor: '#38251D', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  submitText: { color: '#FFFFFF', fontWeight: '900' },
  success: { minHeight: 420, alignItems: 'center', justifyContent: 'center', padding: 20 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#C49A55', color: '#38251D', textAlign: 'center', lineHeight: 64, fontSize: 28, fontWeight: '900' },
  successTitle: { color: '#38251D', fontFamily: 'Georgia', fontSize: 28, marginTop: 16 },
  successText: { color: '#887E74', marginTop: 8, textAlign: 'center' },
  resetButton: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#38251D', justifyContent: 'center', paddingHorizontal: 16, marginTop: 20 },
  resetText: { color: '#38251D', fontWeight: '900' },
});
