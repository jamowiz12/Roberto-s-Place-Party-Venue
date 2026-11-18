import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

const COLORS = {
  brown: '#38251D', beige: '#F5EFE6', gold: '#C49A55', white: '#FFFFFF', text: '#29231F',
};

const links = [
  { label: 'Home', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'Menu', href: '/menu' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Booking', href: '/booking' },
  { label: 'Profile', href: '/profile' },
];

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const mobile = width < 768;

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href as any);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, mobile && styles.headerMobile]}>
        <Pressable onPress={() => navigate('/')} style={styles.brandWrap} accessibilityRole="button">
          <Text style={styles.brand}>ROBERTO&apos;S PLACE</Text>
          <Text style={styles.brandSub}>PARTY VENUE &amp; CATERING</Text>
        </Pressable>

        {mobile ? (
          <Pressable
            onPress={() => setOpen((value) => !value)}
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel={open ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <Text style={styles.menuIcon}>{open ? '×' : '☰'}</Text>
          </Pressable>
        ) : (
          <View style={styles.desktopNav}>
            {links.map((link) => {
              const active = pathname === link.href || (link.href === '/' && pathname === '/index');
              return (
                <Pressable key={link.href} onPress={() => navigate(link.href)} style={styles.navItem}>
                  <Text style={[styles.navText, active && styles.navTextActive]}>{link.label}</Text>
                  {active ? <View style={styles.activeLine} /> : null}
                </Pressable>
              );
            })}
            <Pressable onPress={() => navigate('/inquiry')} style={styles.accountButton}>
              <Text style={styles.accountText}>Inquire</Text>
            </Pressable>
          </View>
        )}
      </View>

      {mobile && open ? (
        <View style={styles.mobileMenu}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Pressable key={link.href} onPress={() => navigate(link.href)} style={[styles.mobileLink, active && styles.mobileLinkActive]}>
                <Text style={[styles.mobileLinkText, active && styles.mobileLinkTextActive]}>{link.label}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={() => navigate('/inquiry')} style={styles.mobileInquire}>
            <Text style={styles.accountText}>Send an inquiry</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { zIndex: 100, backgroundColor: COLORS.beige },
  header: { height: 82, maxWidth: 1280, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 34 },
  headerMobile: { height: 68, paddingHorizontal: 18 },
  brandWrap: { gap: 3 },
  brand: { color: COLORS.brown, fontSize: 17, fontWeight: '900', letterSpacing: 1.4 },
  brandSub: { color: COLORS.gold, fontSize: 8, fontWeight: '800', letterSpacing: 2.2 },
  desktopNav: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  navItem: { height: 82, justifyContent: 'center', alignItems: 'center' },
  navText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  navTextActive: { color: COLORS.brown },
  activeLine: { position: 'absolute', bottom: 18, width: 22, height: 2, backgroundColor: COLORS.gold },
  accountButton: { backgroundColor: COLORS.brown, borderRadius: 8, paddingHorizontal: 16, height: 42, justifyContent: 'center' },
  accountText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  menuButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#DCCFBF', alignItems: 'center', justifyContent: 'center' },
  menuIcon: { color: COLORS.brown, fontSize: 23, fontWeight: '700' },
  mobileMenu: { position: 'absolute', top: 68, left: 0, right: 0, backgroundColor: COLORS.white, padding: 16, borderTopWidth: 1, borderTopColor: '#ECE3D7', shadowColor: '#38251D', shadowOpacity: 0.12, shadowRadius: 18, elevation: 8 },
  mobileLink: { height: 48, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8 },
  mobileLinkActive: { backgroundColor: '#F3ECE2' },
  mobileLinkText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  mobileLinkTextActive: { color: COLORS.brown },
  mobileInquire: { height: 48, borderRadius: 8, backgroundColor: COLORS.brown, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});
