import { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../src/components/Header";
import Workspace, { CompositionBead } from "../src/components/Workspace";
import Sidebar from "../src/components/Sidebar";
import PerlesSiliconePanel from "../src/components/panels/PerlesSiliconePanel";
import BeadActionMenu from "../src/components/BeadActionMenu";

import initialComposition from "../src/data/composition";
import { getColorById, getVariantById } from "../src/data/silicone-colors";
import { MM } from "../src/constants/sizes";

type PanelMode = { family: string; mode: "add" | "replace"; beadId?: string } | null;

const PERLES_SILICONE_ID = "perles-silicone";

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
    if (familyId === PERLES_SILICONE_ID) {
      setSidebarOpen(false);
      setPanel({ family: PERLES_SILICONE_ID, mode: "add" });
    }
  };

  const handleAddPerleSilicone = (colorId: string, variantId: string) => {
    const color = getColorById(colorId);
    const variant = getVariantById(variantId);
    if (!color || !variant) return;
    const newBead: CompositionBead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      family: PERLES_SILICONE_ID,
      shape: variant.shape,
      variantId: variant.id,
      colorId: color.id,
      size: variant.size,
      hex: color.hex,
      image: color.image,
    };
    setComposition((prev) => [...prev, newBead]);
  };

  const handleReplacePerleSilicone = (colorId: string, variantId: string) => {
    if (!selectedBeadId) return;
    const color = getColorById(colorId);
    const variant = getVariantById(variantId);
    if (!color || !variant) return;
    setComposition((prev) =>
      prev.map((b) =>
        b.id === selectedBeadId
          ? {
              ...b,
              shape: variant.shape,
              variantId: variant.id,
              colorId: color.id,
              size: variant.size,
              hex: color.hex,
              image: color.image,
            }
          : b,
      ),
    );
    setSelectedBeadId(null);
    setPanel(null);
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
    if (selectedBead.family === PERLES_SILICONE_ID) {
      setPanel({
        family: PERLES_SILICONE_ID,
        mode: "replace",
        beadId: selectedBead.id,
      });
    }
  };

  const selectedBeadColor = selectedBead
    ? getColorById(selectedBead.colorId ?? "")
    : null;

  const isReplaceMode = panel?.mode === "replace";
  const menuVisible = !!selectedBead && !panel;

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

      <PerlesSiliconePanel
        visible={panel?.family === PERLES_SILICONE_ID}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddPerleSilicone}
        onReplaceBead={handleReplacePerleSilicone}
      />

      <BeadActionMenu
        visible={menuVisible}
        bead={
          selectedBead
            ? {
                name: selectedBeadColor?.name,
                size: selectedBead.size,
                shape: selectedBead.shape,
                image: selectedBead.image,
                hex: selectedBead.hex,
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
