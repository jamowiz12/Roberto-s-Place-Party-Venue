import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import PageShell from "../components/PageShell";

const COLORS = {
  brown: "#38251D",
  beige: "#F5EFE6",
  gold: "#C49A55",
  text: "#29231F",
  muted: "#887E74",
  white: "#FFFFFF",
};

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const isTablet = width >= 768;

  const services = [
    [
      "01",
      "Catering",
      "Thoughtfully prepared menus for intimate dinners and grand celebrations.",
    ],
    [
      "02",
      "Party Packages",
      "Complete package options for a beautifully planned event.",
    ],
    [
      "03",
      "Venue Hosting",
      "Elegant spaces for moments shared with the people you love.",
    ],
  ];

  return (
    <PageShell>
      <View style={stylesNew.heroWrap}>
        <View
          style={[
            stylesNew.hero,
            isWide && stylesNew.heroWide,
            isTablet && stylesNew.heroTablet,
          ]}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=85",
            }}
            style={stylesNew.heroImage}
            resizeMode="cover"
          />
          <View style={stylesNew.heroShade} />
          <View style={[stylesNew.heroCopy, isWide && stylesNew.heroCopyWide]}>
            <Text style={stylesNew.eyebrowLight}>CELEBRATE WITH US</Text>
            <Text
              style={[stylesNew.heroTitle, isWide && stylesNew.heroTitleWide]}
            >
              Every celebration deserves something special.
            </Text>
            <Text style={stylesNew.heroText}>
              Food, venue, and thoughtful service brought together for gatherings
              worth remembering.
            </Text>
            <View style={stylesNew.heroActions}>
              <Pressable
                onPress={() => router.push("/booking")}
                style={stylesNew.primaryButton}
              >
                <Text style={stylesNew.primaryText}>Book an event</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/packages")}
                style={stylesNew.secondaryButton}
              >
                <Text style={stylesNew.secondaryText}>Explore packages</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={stylesNew.sectionIntro}>
        <View style={stylesNew.introCopy}>
          <Text style={stylesNew.eyebrow}>
            WELCOME TO ROBERTO&apos;S PLACE
          </Text>
          <Text style={stylesNew.sectionTitle}>
            Making your special moments memorable.
          </Text>
        </View>
        <Text style={stylesNew.introText}>
          From intimate gatherings to milestone celebrations, our team brings
          elegant spaces, generous flavors, and attentive service together in one
          seamless experience.
        </Text>
      </View>

      <View style={stylesNew.servicesSection}>
        <View style={stylesNew.serviceGrid}>
          {services.map(([number, title, copy]) => (
            <View
              key={title}
              style={[stylesNew.serviceCard, isWide && stylesNew.serviceCardWide]}
            >
              <Text style={stylesNew.serviceNumber}>{number}</Text>
              <Text style={stylesNew.serviceTitle}>{title}</Text>
              <Text style={stylesNew.serviceCopy}>{copy}</Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[stylesNew.featureSection, isWide && stylesNew.featureSectionWide]}
      >
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
          }}
          style={[stylesNew.featureImage, isWide && stylesNew.featureImageWide]}
          resizeMode="cover"
        />
        <View style={stylesNew.featureCopy}>
          <Text style={stylesNew.eyebrow}>CURATED FOR YOUR TABLE</Text>
          <Text style={stylesNew.featureTitle}>
            Generous dishes. Familiar favorites. Beautifully served.
          </Text>
          <Text style={stylesNew.bodyText}>
            Explore classic Filipino dishes and celebration favorites prepared
            for sharing.
          </Text>
          <Pressable
            onPress={() => router.push("/menu")}
            style={stylesNew.textButton}
          >
            <Text style={stylesNew.textButtonText}>View food menu →</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[stylesNew.packageSection, isWide && stylesNew.packageSectionWide]}
      >
        <View style={stylesNew.packageHeading}>
          <View>
            <Text style={stylesNew.eyebrow}>POPULAR CHOICES</Text>
            <Text style={stylesNew.sectionTitle}>Featured packages</Text>
          </View>
          <Pressable onPress={() => router.push("/packages")}>
            <Text style={stylesNew.textButtonText}>View all packages →</Text>
          </Pressable>
        </View>
        <View style={stylesNew.packageGrid}>
          {(
            [
              ["Silver Celebration", "₱12,500", "For intimate celebrations"],
              ["Gold Gathering", "₱18,900", "A complete guest experience"],
              ["Premium Event", "₱26,400", "Elegant, all-inclusive hosting"],
            ] as const
          ).map(([name, price, description]) => (
            <Pressable
              key={name}
              onPress={() => router.push("/packages")}
              style={stylesNew.packageCard}
            >
              <Text style={stylesNew.packageName}>{name}</Text>
              <Text style={stylesNew.packagePrice}>{price}</Text>
              <Text style={stylesNew.packageDescription}>{description}</Text>
              <Text style={stylesNew.packageLink}>View package →</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[stylesNew.cta, isWide && stylesNew.ctaWide]}>
        <View>
          <Text style={stylesNew.ctaEyebrow}>START PLANNING</Text>
          <Text style={stylesNew.ctaTitle}>
            Let&apos;s plan your next celebration.
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/inquiry")}
          style={stylesNew.ctaButton}
        >
          <Text style={stylesNew.ctaButtonText}>Send an inquiry</Text>
        </Pressable>
      </View>
    </PageShell>
  );
}

const stylesNew = StyleSheet.create({
  heroWrap: { paddingHorizontal: 14 },
  hero: {
    height: 520,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#38251D",
  },
  heroTablet: { height: 560, marginHorizontal: 8 },
  heroWide: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    height: 610,
    marginHorizontal: 0,
  },
  heroImage: { position: "absolute", width: "100%", height: "100%" },
  heroShade: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(41,29,23,0.58)",
  },
  heroCopy: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    maxWidth: 620,
  },
  heroCopyWide: { paddingHorizontal: 68 },
  eyebrowLight: {
    color: "#E6C98F",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 16,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: "Georgia",
    fontSize: 39,
    lineHeight: 46,
    fontWeight: "700",
  },
  heroTitleWide: { fontSize: 62, lineHeight: 68 },
  heroText: {
    color: "#F5EFE6",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 18,
    maxWidth: 520,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
  },
  primaryButton: {
    height: 48,
    borderRadius: 7,
    backgroundColor: "#C49A55",
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  primaryText: { color: "#38251D", fontWeight: "900", fontSize: 13 },
  secondaryButton: {
    height: 48,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  secondaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  sectionIntro: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 64,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 24,
  },
  introCopy: { maxWidth: 620 },
  eyebrow: {
    color: "#B58A46",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.4,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#38251D",
    fontFamily: "Georgia",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "700",
  },
  introText: {
    color: "#887E74",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 430,
    paddingTop: 24,
  },
  servicesSection: { backgroundColor: "#FFFFFF", paddingVertical: 42 },
  serviceGrid: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
  },
  serviceCard: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ECE3D7",
    paddingHorizontal: 10,
    paddingVertical: 24,
  },
  serviceCardWide: {
    width: "33.333%",
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: "#ECE3D7",
    paddingHorizontal: 28,
  },
  serviceNumber: {
    color: "#C49A55",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 20,
  },
  serviceTitle: {
    color: "#38251D",
    fontFamily: "Georgia",
    fontSize: 24,
    fontWeight: "700",
  },
  serviceCopy: {
    color: "#887E74",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  featureSection: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 64,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
  },
  featureSectionWide: {
    paddingHorizontal: 24,
    alignItems: "center",
    flexWrap: "nowrap",
  },
  featureImage: { width: "100%", height: 300, borderRadius: 12 },
  featureImageWide: { width: "52%", height: 430 },
  featureCopy: {
    flexGrow: 1,
    minWidth: 260,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  featureTitle: {
    color: "#38251D",
    fontFamily: "Georgia",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    maxWidth: 520,
  },
  bodyText: {
    color: "#887E74",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 460,
  },
  textButton: { marginTop: 18 },
  textButtonText: { color: "#A77D3D", fontWeight: "900", fontSize: 13 },
  packageSection: {
    backgroundColor: "#ECE1D2",
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  packageSectionWide: { paddingHorizontal: 48 },
  packageHeading: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 28,
  },
  packageGrid: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  packageCard: {
    width: "100%",
    minHeight: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    justifyContent: "center",
  },
  packageName: {
    color: "#38251D",
    fontFamily: "Georgia",
    fontSize: 22,
    fontWeight: "700",
  },
  packagePrice: {
    color: "#A77D3D",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 18,
  },
  packageDescription: { color: "#887E74", fontSize: 13, marginTop: 7 },
  packageLink: {
    color: "#38251D",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 18,
  },
  cta: {
    marginHorizontal: 14,
    marginVertical: 24,
    minHeight: 210,
    backgroundColor: "#38251D",
    borderRadius: 14,
    padding: 28,
    justifyContent: "space-between",
    gap: 24,
  },
  ctaWide: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    marginHorizontal: 0,
    marginVertical: 48,
    paddingHorizontal: 54,
    flexDirection: "row",
    alignItems: "center",
  },
  ctaEyebrow: {
    color: "#C49A55",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.4,
  },
  ctaTitle: {
    color: "#FFFFFF",
    fontFamily: "Georgia",
    fontSize: 32,
    lineHeight: 40,
    marginTop: 8,
  },
  ctaButton: {
    height: 48,
    borderRadius: 7,
    backgroundColor: "#C49A55",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  ctaButtonText: { color: "#38251D", fontWeight: "900" },

  // legacy screen implementation preserved below
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.beige,
  },
  scrollView: {
    flex: 1,
  },
  brand: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.brown,
  },
  subtitle: {
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 4,
    color: COLORS.gold,
  },
  menuButton: {
    padding: 9,
    borderWidth: 1,
    borderColor: "#D9CCBC",
    borderRadius: 10,
  },
  menuIcon: {
    fontSize: 20,
    color: COLORS.brown,
  },
  heroLegacy: {
    height: 470,
    marginHorizontal: 14,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.brown,
  },
  heroImageLegacy: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "rgba(30, 20, 15, 0.58)",
  },
  heroLabel: {
    color: "#E8C88F",
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
    marginBottom: 18,
  },
  heroTitleLegacy: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
  },
  heroDescriptionLegacy: {
    color: "#F5EFE6",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 280,
  },
  primaryButtonLegacy: {
    backgroundColor: COLORS.gold,
    padding: 16,
    borderRadius: 9,
    alignSelf: "flex-start",
    marginTop: 25,
  },
  primaryButtonTextLegacy: {
    color: COLORS.brown,
    fontWeight: "800",
    fontSize: 13,
  },
  intro: {
    padding: 26,
    alignItems: "center",
  },
  sectionEyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 10,
  },
  sectionTitleLegacy: {
    color: COLORS.brown,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 12,
  },
  bodyTextLegacy: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  serviceGridLegacy: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  serviceCardLegacy: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: COLORS.white,
    padding: 17,
    borderRadius: 13,
  },
  serviceIcon: {
    fontSize: 27,
    marginBottom: 12,
  },
  serviceTitleLegacy: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.brown,
  },
  serviceDescription: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 6,
  },
  foodCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
  },
  foodImage: {
    width: "100%",
    height: 190,
  },
  foodInfo: {
    padding: 17,
  },
  foodTitle: {
    color: COLORS.brown,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  textLink: {
    color: COLORS.gold,
    fontWeight: "800",
    marginTop: 14,
  },
  bookingSection: {
    margin: 20,
    padding: 25,
    backgroundColor: COLORS.brown,
    borderRadius: 16,
  },
  bookingTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "800",
  },
  bookingDescription: {
    color: "#E0D4C7",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },
  bookingButton: {
    backgroundColor: COLORS.gold,
    padding: 15,
    borderRadius: 9,
    marginTop: 22,
    alignItems: "center",
  },
  bookingButtonText: {
    color: COLORS.brown,
    fontWeight: "800",
  },
  footer: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#EDE3D7",
  },
  footerText: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 8,
  },
  copyright: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 20,
  },
});
