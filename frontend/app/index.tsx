import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../src/components/Header";
import Workspace from "../src/components/Workspace";

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      
      {/* Header premium */}
      <Header />

      {/* Grande carte blanche contenant le Workspace */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card} testID="workspace-card">
          <Workspace />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ece5d8", // Fond beige
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 16,
    // Ombre très douce (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    // Ombre très douce (Android)
    elevation: 3,
  },
});
