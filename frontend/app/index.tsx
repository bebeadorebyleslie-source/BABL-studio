import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../src/components/Header";
import Workspace from "../src/components/Workspace";
import Sidebar from "../src/components/Sidebar";
import SiliconeRondePanel from "../src/components/panels/SiliconeRondePanel";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [cardSize, setCardSize] = useState<{ width: number; height: number } | null>(null);

  const handleFamilyOpen = (familyId: string) => {
    if (familyId === "silicone-ronde") {
      setSidebarOpen(false);
      setActivePanel("silicone-ronde");
    }
    // Les autres familles arriveront dans les sprints suivants
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar style="dark" />

        {/* Header premium */}
        <Header onMenuPress={() => setSidebarOpen(true)} />

        {/* Grande carte blanche contenant le Workspace (pas de scroll, tout visible) */}
        <View style={styles.cardWrap}>
          <View
            style={styles.card}
            testID="workspace-card"
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setCardSize({ width, height });
            }}
          >
            {cardSize && (
              <Workspace
                availableWidth={cardSize.width - 32} // paddingHorizontal
                availableHeight={cardSize.height - 40} // paddingVertical
              />
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Sidebar (overlay indépendant) */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFamilyOpen={handleFamilyOpen}
      />

      {/* Panneau Silicone ronde (bottom-sheet) */}
      <SiliconeRondePanel
        visible={activePanel === "silicone-ronde"}
        onClose={() => setActivePanel(null)}
      />
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
    backgroundColor: "#ece5d8",
  },
  cardWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 32,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    // Ombre très douce (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    // Ombre très douce (Android)
    elevation: 3,
  },
});
