import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
        <AppFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#F5EFE6' }, scroll: { flex: 1 }, content: { flexGrow: 1 } });
