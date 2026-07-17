import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../src/components/Header";
import Workspace, { CompositionBead } from "../src/components/Workspace";
import Sidebar from "../src/components/Sidebar";
import SiliconeRondePanel from "../src/components/panels/SiliconeRondePanel";

import initialComposition from "../src/data/composition";
import {
  SILICONE_RONDE_COLORS,
  SiliconeRondeSize,
} from "../src/data/silicone-ronde-colors";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [cardSize, setCardSize] = useState<{ width: number; height: number } | null>(null);
  const [composition, setComposition] = useState<CompositionBead[]>(initialComposition);

  const handleFamilyOpen = (familyId: string) => {
    if (familyId === "silicone-ronde") {
      setSidebarOpen(false);
      setActivePanel("silicone-ronde");
    }
  };

  const handleAddSiliconeRonde = (colorId: string, size: SiliconeRondeSize) => {
    const color = SILICONE_RONDE_COLORS.find((c) => c.id === colorId);
    if (!color) return;
    const newBead: CompositionBead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "silicone",
      size,
      image: color.image,
    };
    setComposition((prev) => [...prev, newBead]);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar style="dark" />

        <Header onMenuPress={() => setSidebarOpen(true)} />

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
                composition={composition}
                availableWidth={cardSize.width - 32}
                availableHeight={cardSize.height - 40}
              />
            )}
          </View>
        </View>
      </SafeAreaView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFamilyOpen={handleFamilyOpen}
      />

      <SiliconeRondePanel
        visible={activePanel === "silicone-ronde"}
        onClose={() => setActivePanel(null)}
        onAddBead={handleAddSiliconeRonde}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
});
