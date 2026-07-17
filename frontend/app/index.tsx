import { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../src/components/Header";
import Workspace, { CompositionBead } from "../src/components/Workspace";
import Sidebar from "../src/components/Sidebar";
import SiliconeRondePanel from "../src/components/panels/SiliconeRondePanel";
import BeadActionMenu from "../src/components/BeadActionMenu";

import initialComposition from "../src/data/composition";
import {
  SILICONE_RONDE_COLORS,
  SiliconeRondeSize,
} from "../src/data/silicone-ronde-colors";
import { MM } from "../src/constants/sizes";

type PanelMode = { family: string; mode: "add" | "replace"; beadId?: string } | null;

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState<PanelMode>(null);
  const [cardSize, setCardSize] = useState<{ width: number; height: number } | null>(null);
  const [composition, setComposition] = useState<CompositionBead[]>(initialComposition);
  const [selectedBeadId, setSelectedBeadId] = useState<string | null>(null);

  const totalLengthPx = useMemo(
    () => composition.reduce((sum, b) => sum + b.size * MM, 0),
    [composition],
  );

  const selectedBead = useMemo(
    () => composition.find((b) => b.id === selectedBeadId) ?? null,
    [composition, selectedBeadId],
  );

  const selectedBeadSizePx = selectedBead ? selectedBead.size * MM : 0;

  const handleFamilyOpen = (familyId: string) => {
    if (familyId === "silicone-ronde") {
      setSidebarOpen(false);
      setPanel({ family: "silicone-ronde", mode: "add" });
    }
  };

  const handleAddSiliconeRonde = (colorId: string, size: SiliconeRondeSize) => {
    const color = SILICONE_RONDE_COLORS.find((c) => c.id === colorId);
    if (!color) return;
    const newBead: CompositionBead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      family: "silicone-ronde",
      type: "silicone",
      colorId: color.id,
      size,
      image: color.image,
    };
    setComposition((prev) => [...prev, newBead]);
  };

  const handleBeadTap = (beadId: string) => {
    setSelectedBeadId(beadId);
  };

  const handleDeleteSelectedBead = () => {
    if (!selectedBeadId) return;
    setComposition((prev) => prev.filter((b) => b.id !== selectedBeadId));
    setSelectedBeadId(null);
  };

  const handleReplaceRequest = () => {
    if (!selectedBead) return;
    // Ouvrir le panneau de la famille correspondante en mode replace
    if (selectedBead.family === "silicone-ronde") {
      setPanel({ family: "silicone-ronde", mode: "replace", beadId: selectedBead.id });
    }
    // Fermer le menu contextuel visuellement (mais garder selectedBeadId pour le remplacement)
  };

  const handleReplaceSiliconeRonde = (colorId: string, size: SiliconeRondeSize) => {
    if (!selectedBeadId) return;
    const color = SILICONE_RONDE_COLORS.find((c) => c.id === colorId);
    if (!color) return;
    setComposition((prev) =>
      prev.map((b) =>
        b.id === selectedBeadId
          ? { ...b, colorId: color.id, size, image: color.image }
          : b,
      ),
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  // Info à passer au BeadActionMenu
  const selectedBeadColor = selectedBead
    ? SILICONE_RONDE_COLORS.find((c) => c.id === selectedBead.colorId)
    : null;

  const isReplaceMode = panel?.mode === "replace";
  const menuVisible = !!selectedBead && !panel; // fermé quand le panel replace est ouvert

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
                onBeadPress={handleBeadTap}
                selectedBeadId={selectedBeadId}
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
        visible={panel?.family === "silicone-ronde"}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddSiliconeRonde}
        onReplaceBead={handleReplaceSiliconeRonde}
      />

      <BeadActionMenu
        visible={menuVisible}
        bead={
          selectedBead
            ? {
                name: selectedBeadColor?.name,
                size: selectedBead.size,
                image: selectedBead.image,
                color: selectedBead.color,
              }
            : null
        }
        onReplace={handleReplaceRequest}
        onDelete={handleDeleteSelectedBead}
        onClose={() => setSelectedBeadId(null)}
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
