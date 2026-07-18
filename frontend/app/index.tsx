import { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import Header from "../src/components/Header";
import Workspace, { CompositionBead } from "../src/components/Workspace";
import Sidebar from "../src/components/Sidebar";
import PerlesSiliconePanel from "../src/components/panels/PerlesSiliconePanel";
import PerlesBoisPanel from "../src/components/panels/PerlesBoisPanel";
import CrochetPanel from "../src/components/panels/CrochetPanel";
import BeadActionMenu from "../src/components/BeadActionMenu";

import initialComposition from "../src/data/composition";
import { getColorById, getVariantById } from "../src/data/silicone-colors";
import { WOOD_COLORS, getWoodVariantById } from "../src/data/wood-beads";
import { CROCHET_COLORS, CROCHET_SIZE_MM, CROCHET_VARIANT_ID } from "../src/data/crochet-beads";
import { MM } from "../src/constants/sizes";

type PanelState = { family: string; mode: "add" | "replace"; beadId?: string } | null;

const PERLES_SILICONE_ID = "perles-silicone";
const PERLES_BOIS_ID = "perles-bois";
const CROCHET_ID = "crochet";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState<PanelState>(null);
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

  const newBeadId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handleFamilyOpen = (familyId: string) => {
    if ([PERLES_SILICONE_ID, PERLES_BOIS_ID, CROCHET_ID].includes(familyId)) {
      setSidebarOpen(false);
      setPanel({ family: familyId, mode: "add" });
    }
  };

  // === Silicone ===
  const handleAddPerleSilicone = (colorId: string, variantId: string) => {
    const color = getColorById(colorId);
    const variant = getVariantById(variantId);
    if (!color || !variant) return;
    setComposition((prev) => [
      ...prev,
      {
        id: newBeadId(),
        family: PERLES_SILICONE_ID,
        shape: variant.shape,
        material: "silicone",
        variantId: variant.id,
        colorId: color.id,
        size: variant.size,
        hex: color.hex,
        image: color.image,
      },
    ]);
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
              family: PERLES_SILICONE_ID,
              shape: variant.shape,
              material: "silicone",
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

  // === Bois ===
  const handleAddPerleBois = (variantId: string) => {
    const variant = getWoodVariantById(variantId);
    if (!variant) return;
    const wood = WOOD_COLORS[0];
    setComposition((prev) => [
      ...prev,
      {
        id: newBeadId(),
        family: PERLES_BOIS_ID,
        shape: variant.shape,
        material: "bois",
        variantId: variant.id,
        colorId: wood.id,
        size: variant.size,
        hex: wood.hex,
        image: variant.image,
      },
    ]);
  };

  const handleReplacePerleBois = (variantId: string) => {
    if (!selectedBeadId) return;
    const variant = getWoodVariantById(variantId);
    if (!variant) return;
    const wood = WOOD_COLORS[0];
    setComposition((prev) =>
      prev.map((b) =>
        b.id === selectedBeadId
          ? {
              ...b,
              family: PERLES_BOIS_ID,
              shape: variant.shape,
              material: "bois",
              variantId: variant.id,
              colorId: wood.id,
              size: variant.size,
              hex: wood.hex,
              image: variant.image,
            }
          : b,
      ),
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  // === Crochet ===
  const handleAddCrochet = (colorId: string) => {
    const color = CROCHET_COLORS.find((c) => c.id === colorId);
    if (!color) return;
    setComposition((prev) => [
      ...prev,
      {
        id: newBeadId(),
        family: CROCHET_ID,
        shape: "ronde",
        material: "crochet",
        variantId: CROCHET_VARIANT_ID,
        colorId: color.id,
        size: CROCHET_SIZE_MM,
        hex: color.hex,
      },
    ]);
  };

  const handleReplaceCrochet = (colorId: string) => {
    if (!selectedBeadId) return;
    const color = CROCHET_COLORS.find((c) => c.id === colorId);
    if (!color) return;
    setComposition((prev) =>
      prev.map((b) =>
        b.id === selectedBeadId
          ? {
              ...b,
              family: CROCHET_ID,
              shape: "ronde",
              material: "crochet",
              variantId: CROCHET_VARIANT_ID,
              colorId: color.id,
              size: CROCHET_SIZE_MM,
              hex: color.hex,
              image: undefined,
            }
          : b,
      ),
    );
    setSelectedBeadId(null);
    setPanel(null);
  };

  const handleBeadTap = (beadId: string) => setSelectedBeadId(beadId);

  const handleDeleteSelectedBead = () => {
    if (!selectedBeadId) return;
    setComposition((prev) => prev.filter((b) => b.id !== selectedBeadId));
    setSelectedBeadId(null);
  };

  const handleReplaceRequest = () => {
    if (!selectedBead) return;
    if ([PERLES_SILICONE_ID, PERLES_BOIS_ID, CROCHET_ID].includes(selectedBead.family)) {
      setPanel({ family: selectedBead.family, mode: "replace", beadId: selectedBead.id });
    }
  };

  const isReplaceMode = panel?.mode === "replace";
  const menuVisible = !!selectedBead && !panel;

  // Bead menu preview info
  const previewName = (() => {
    if (!selectedBead) return undefined;
    if (selectedBead.family === PERLES_BOIS_ID) return WOOD_COLORS[0].name;
    const c = getColorById(selectedBead.colorId ?? "");
    return c?.name;
  })();

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

      <PerlesBoisPanel
        visible={panel?.family === PERLES_BOIS_ID}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddPerleBois}
        onReplaceBead={handleReplacePerleBois}
      />

      <CrochetPanel
        visible={panel?.family === CROCHET_ID}
        mode={panel?.mode ?? "add"}
        currentLengthPx={totalLengthPx}
        excludeBeadSizePx={isReplaceMode ? selectedBeadSizePx : 0}
        onClose={() => {
          setPanel(null);
          if (isReplaceMode) setSelectedBeadId(null);
        }}
        onAddBead={handleAddCrochet}
        onReplaceBead={handleReplaceCrochet}
      />

      <BeadActionMenu
        visible={menuVisible}
        bead={
          selectedBead
            ? {
                name: previewName,
                size: selectedBead.size,
                shape: selectedBead.shape,
                material: selectedBead.material,
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
  root: { flex: 1, backgroundColor: "#ece5d8" },
  safeArea: { flex: 1, backgroundColor: "#ece5d8" },
  cardWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
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
