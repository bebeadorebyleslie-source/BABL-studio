import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import FanBead from "./FanBead";
import SegmentedToggle from "../SegmentedToggle";
import {
  SILICONE_COLORS,
  SILICONE_VARIANTS,
  SiliconeVariant,
  getColorById,
  getVariantById,
} from "../../data/silicone-colors";
import { MM } from "../../constants/sizes";
import { TEMPLATE_INNER_HEIGHT_PX } from "../Workspace";

// === Layouts spécifiques par nombre de perles disponibles ===
// Pour 25 (rondes) : 2 arcs (10 + 15)
// Pour 13 (hexagones) : 2 arcs (5 + 8)
// Pour 4 (lentilles) : arc unique large
type FanLayout = {
  arcs: { count: number; radius: number }[];
  beadVisualSize: number;
  fanWidth: number;
  fanHeight: number;
};

const getFanLayout = (colorCount: number): FanLayout => {
  if (colorCount >= 20) {
    // Rondes : 25 couleurs → 10 + 15
    return {
      arcs: [
        { count: 10, radius: 100 },
        { count: 15, radius: 155 },
      ],
      beadVisualSize: 34,
      fanWidth: 350,
      fanHeight: 195,
    };
  }
  if (colorCount >= 10) {
    // Hexagones : 13 couleurs → 5 + 8
    return {
      arcs: [
        { count: 5, radius: 80 },
        { count: 8, radius: 140 },
      ],
      beadVisualSize: 40,
      fanWidth: 340,
      fanHeight: 185,
    };
  }
  // Lentilles : 4 couleurs → arc unique
  return {
    arcs: [{ count: colorCount, radius: 100 }],
    beadVisualSize: 30, // hauteur visuelle
    fanWidth: 320,
    fanHeight: 135,
  };
};

const PANEL_HEIGHT = 510;
const DEFAULT_VARIANT_ID = "ronde-15";

type Props = {
  visible: boolean;
  mode?: "add" | "replace";
  currentLengthPx?: number;
  excludeBeadSizePx?: number;
  onClose: () => void;
  onAddBead: (colorId: string, variantId: string) => void;
  onReplaceBead?: (colorId: string, variantId: string) => void;
};

export default function PerlesSiliconePanel({
  visible,
  mode = "add",
  currentLengthPx = 0,
  excludeBeadSizePx = 0,
  onClose,
  onAddBead,
  onReplaceBead,
}: Props) {
  const [mounted, setMounted] = useState(visible);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(DEFAULT_VARIANT_ID);

  const translateY = useSharedValue(PANEL_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 280 });
    } else if (mounted) {
      translateY.value = withTiming(PANEL_HEIGHT, { duration: 240, easing: Easing.in(Easing.cubic) });
      backdropOpacity.value = withTiming(0, { duration: 240 });
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.18,
  }));

  // Variante et couleurs filtrées
  const variant: SiliconeVariant =
    getVariantById(selectedVariantId) ?? SILICONE_VARIANTS[1];
  const availableColors = useMemo(
    () =>
      SILICONE_COLORS.filter((c) => variant.availableColorIds.includes(c.id)),
    [variant],
  );

  // Si la couleur sélectionnée n'est plus disponible dans la variante courante, la réinitialiser
  useEffect(() => {
    if (
      selectedColorId &&
      !variant.availableColorIds.includes(selectedColorId)
    ) {
      setSelectedColorId(null);
    }
  }, [selectedVariantId]);

  const selectedColor = getColorById(selectedColorId ?? "") ?? null;

  // Contrainte de longueur
  const effectiveCurrentLength = currentLengthPx - excludeBeadSizePx;
  const remainingPx = TEMPLATE_INNER_HEIGHT_PX - effectiveCurrentLength;
  const willFit = variant.size * MM <= remainingPx;
  const remainingMm = Math.max(0, remainingPx / MM);
  const isReplaceMode = mode === "replace";

  // Layout adaptatif de l'éventail
  const layout = getFanLayout(availableColors.length);
  const CX = layout.fanWidth / 2;
  const CY = layout.fanHeight - 15;

  const beadPos = (index: number, total: number, radius: number) => {
    // Pour un seul bead (édge case), le placer au centre haut
    if (total === 1) return { x: CX, y: CY - radius };
    const stepAngleDeg = 180 / (total - 1);
    const angleDeg = -90 + index * stepAngleDeg;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + radius * Math.sin(angleRad),
      y: CY - radius * Math.cos(angleRad),
    };
  };

  // Répartition des couleurs par arc (arc extérieur d'abord pour z-order)
  const arcSlices = useMemo(() => {
    const result: { colors: typeof availableColors; radius: number }[] = [];
    let cursor = 0;
    // On distribue en commençant par l'arc intérieur (plus petit index de la palette)
    for (const arc of layout.arcs) {
      result.push({
        colors: availableColors.slice(cursor, cursor + arc.count),
        radius: arc.radius,
      });
      cursor += arc.count;
    }
    return result;
  }, [availableColors, layout]);

  const variantOptions = SILICONE_VARIANTS.map((v) => ({
    value: v.id,
    label: v.label,
  }));

  const canSubmit =
    !!selectedColorId && (isReplaceMode || willFit);

  const submitLabel = isReplaceMode
    ? "Remplacer"
    : !willFit && selectedColorId
      ? `Plus de place (reste ${Math.floor(remainingMm)} mm)`
      : "Ajouter à mon attache";

  if (!mounted) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]}
      testID="perles-silicone-overlay"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdropBase, backdropStyle]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          testID="perles-silicone-backdrop"
        />
      </Animated.View>

      <Animated.View
        style={[styles.panel, { height: PANEL_HEIGHT }, panelStyle]}
        testID="perles-silicone-panel"
      >
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {isReplaceMode ? "Remplacer la perle" : "Perles Silicone"}
            </Text>
            <Text style={styles.subtitle}>
              {selectedColor
                ? selectedColor.name
                : isReplaceMode
                  ? "Choisissez une nouvelle perle"
                  : "Choisissez une perle"}
            </Text>
          </View>
          <TouchableOpacity
            testID="perles-silicone-close-button"
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#5a4b3c" />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de variante (12mm / 15mm / Hexa 14 / Lentille) */}
        <View style={styles.sizeRow}>
          <SegmentedToggle
            testID="perles-silicone-variant"
            options={variantOptions}
            value={selectedVariantId}
            onChange={setSelectedVariantId}
          />
        </View>

        {/* Éventail dynamique selon la variante */}
        <View style={styles.fanWrap}>
          <View
            style={[
              styles.fan,
              { width: layout.fanWidth, height: layout.fanHeight },
            ]}
            testID="perles-silicone-fan"
          >
            {arcSlices.map((slice, arcIdx) =>
              slice.colors.map((c, i) => {
                const { x, y } = beadPos(i, slice.colors.length, slice.radius);
                return (
                  <FanBead
                    key={`${c.id}-${variant.id}`}
                    testID={`bead-${c.id}`}
                    shape={variant.shape}
                    hex={c.hex}
                    image={c.image}
                    size={layout.beadVisualSize}
                    x={x}
                    y={y}
                    selected={selectedColorId === c.id}
                    onPress={() => setSelectedColorId(c.id)}
                  />
                );
              }),
            )}
          </View>
        </View>

        {/* Bouton d'action */}
        <TouchableOpacity
          testID={isReplaceMode ? "perles-silicone-replace-button" : "perles-silicone-add-button"}
          disabled={!canSubmit}
          activeOpacity={0.85}
          style={[styles.addBtn, !canSubmit && styles.addBtnDisabled]}
          onPress={() => {
            if (!selectedColorId || !canSubmit) return;
            if (isReplaceMode && onReplaceBead) {
              onReplaceBead(selectedColorId, variant.id);
            } else {
              onAddBead(selectedColorId, variant.id);
              setSelectedColorId(null);
            }
          }}
        >
          <Ionicons
            name={isReplaceMode ? "swap-horizontal" : "add"}
            size={20}
            color={canSubmit ? "#ffffff" : "#c0b5a2"}
          />
          <Text style={[styles.addBtnText, !canSubmit && styles.addBtnTextDisabled]}>
            {submitLabel}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdropBase: { backgroundColor: "#5a4b3c" },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  handleBar: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5ddd0",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", color: "#5a4b3c" },
  subtitle: { fontSize: 13, color: "#a99a86", marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5efe4",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sizeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  fanWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  fan: { position: "relative" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5a4b3c",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginTop: 10,
    gap: 8,
    shadowColor: "#5a4b3c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  addBtnDisabled: {
    backgroundColor: "#f0e9dc",
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  addBtnTextDisabled: { color: "#c0b5a2" },
});
