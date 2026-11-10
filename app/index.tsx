
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* STICKY HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>ROBERTO&apos;S PLACE</Text>
          <Text style={styles.subtitle}>PARTY VENUE & CATERING</Text>
        </View>

        <Pressable style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
      </View>

    {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {/* HERO SECTION */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000",
            }}
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay}>
            <Text style={styles.heroLabel}>
              CELEBRATE WITH US
            </Text>

            <Text style={styles.heroTitle}>
              Every Celebration{"\n"}
              Deserves Something{"\n"}
              Special.
            </Text>

            <Text style={styles.heroDescription}>
              Delicious food, beautiful moments,
              and unforgettable celebrations.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/packages")}
            >
              <Text style={styles.primaryButtonText}>
                Explore Packages →
              </Text>
            </Pressable>
          </View>
        </View>

        {/* INTRODUCTION */}
        <View style={styles.intro}>
          <Text style={styles.sectionEyebrow}>WELCOME TO ROBERTO&apos;S</Text>

          <Text style={styles.sectionTitle}>
            Making Your Special Moments Memorable
          </Text>

          <Text style={styles.bodyText}>
            From intimate gatherings to grand celebrations,
            Roberto&apos;s Place brings food, service, and venue
            experiences together for your special occasions.
          </Text>
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>WHAT WE OFFER</Text>
          <Text style={styles.sectionTitle}>Our Services</Text>

          <View style={styles.serviceGrid}>
            {[
              ["🍽️", "Catering Services", "Food for every occasion"],
              ["🎉", "Party Packages", "Celebrate your way"],
              ["🏛️", "Event Venue", "A place for memories"],
              ["✨", "Custom Bundles", "Choose your food favorites"],
            ].map(([icon, title, description]) => (
              <View key={title} style={styles.serviceCard}>
                <Text style={styles.serviceIcon}>{icon}</Text>
                <Text style={styles.serviceTitle}>{title}</Text>
                <Text style={styles.serviceDescription}>
                  {description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* FEATURED FOOD */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>MADE FOR YOUR TABLE</Text>
          <Text style={styles.sectionTitle}>Explore Our Food</Text>

          <View style={styles.foodCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900",
              }}
              style={styles.foodImage}
            />
            <View style={styles.foodInfo}>
              <Text style={styles.foodTitle}>Discover Our Menu</Text>
              <Text style={styles.bodyText}>
                Explore delicious food choices for your next event.
              </Text>

              <Pressable
                onPress={() => router.push("/menu")}
              >
                <Text style={styles.textLink}>View Food Menu →</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* BOOKING CTA */}
        <View style={styles.bookingSection}>
          <Text style={styles.bookingTitle}>
            Planning Something Special?
          </Text>

          <Text style={styles.bookingDescription}>
            Tell us about your event. Let us help you
            prepare the perfect celebration.
          </Text>

          <Pressable
            style={styles.bookingButton}
            onPress={() => router.push("/inquiry")}
          >
            <Text style={styles.bookingButtonText}>
              Send an Inquiry →
            </Text>
          </Pressable>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.brand}>ROBERTO&apos;S PLACE</Text>
          <Text style={styles.footerText}>
            Party Venue & Catering
          </Text>
          <Text style={styles.footerText}>
            Every Celebration Deserves Something Special.
          </Text>
          <Text style={styles.copyright}>
            © 2026 Roberto&apos;s Place Party Venue
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  hero: {
    height: 470,
    marginHorizontal: 14,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.brown,
  },
  heroImage: {
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
  heroTitle: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
  },
  heroDescription: {
    color: "#F5EFE6",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 280,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    padding: 16,
    borderRadius: 9,
    alignSelf: "flex-start",
    marginTop: 25,
  },
  primaryButtonText: {
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
  sectionTitle: {
    color: COLORS.brown,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 12,
  },
  bodyText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  serviceCard: {
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
  serviceTitle: {
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
