import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../src/components/Header";
import Workspace from "../src/components/Workspace";
import Sidebar from "../src/components/Sidebar";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar style="dark" />

        {/* Header premium */}
        <Header onMenuPress={() => setSidebarOpen(true)} />

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

      {/* Sidebar (overlay indépendant, ne casse pas le Workspace) */}
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ece5d8",
  },
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
