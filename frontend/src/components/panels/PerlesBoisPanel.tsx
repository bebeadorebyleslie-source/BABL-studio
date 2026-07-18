import { useEffect, useState } from "react";
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
  withSpring,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import BeadShape, { beadShapeDimensions } from "../BeadShape";
import {
  WOOD_VARIANTS,
  WOOD_COLORS,
  WoodVariant,
} from "../../data/wood-beads";
import { MM } from "../../constants/sizes";
import { TEMPLATE_INNER_HEIGHT_PX } from "../Workspace";

const PANEL_HEIGHT = 480;

type Props = {
  visible: boolean;
  mode?: "add" | "replace";
  currentLengthPx?: number;
  excludeBeadSizePx?: number;
  onClose: () => void;
  onAddBead: (variantId: string) => void;
  onReplaceBead?: (variantId: string) => void;
};

// Sous-composant : une "tuile" bois
function WoodTile({
  variant,
  selected,
  onPress,
  testID,
}: {
  variant: WoodVariant;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  const scale = useSharedValue(1);
  const haloOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.08 : 1, { damping: 12, stiffness: 220 });
    haloOpacity.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const beadStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
  }));

  const wood = WOOD_COLORS[0];
  // Taille visuelle homogène pour la palette (pas la taille réelle)
  const VISUAL = variant.shape === "lentille" ? 22 : 40;
  const dims = beadShapeDimensions(variant.shape, VISUAL);

  return (
    <Pressable testID={testID} onPress={onPress} style={styles.tileWrap}>
      <View style={styles.tileInner}>
        <View style={{ width: 100, height: 60, alignItems: "center", justifyContent: "center" }}>
          <Animated.View
            style={[
              styles.tileHalo,
              { width: dims.width + 14, height: dims.height + 14, borderRadius: (Math.max(dims.width, dims.height) + 14) / 2 },
              haloStyle,
            ]}
          />
          <Animated.View style={beadStyle}>
            <BeadShape shape={variant.shape} material="bois" size={VISUAL} hex={wood.hex} image={variant.image} />
          </Animated.View>
        </View>
        <Text style={[styles.tileLabel, selected && styles.tileLabelActive]}>
          {variant.label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function PerlesBoisPanel({
  visible,
  mode = "add",
  currentLengthPx = 0,
  excludeBeadSizePx = 0,
  onClose,
  onAddBead,
  onReplaceBead,
}: Props) {
  const [mounted, setMounted] = useState(visible);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

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

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value * 0.18 }));

  const selectedVariant = WOOD_VARIANTS.find((v) => v.id === selectedVariantId) ?? null;

  const effectiveCurrentLength = currentLengthPx - excludeBeadSizePx;
  const remainingPx = TEMPLATE_INNER_HEIGHT_PX - effectiveCurrentLength;
  const willFit = selectedVariant ? selectedVariant.size * MM <= remainingPx : true;
  const remainingMm = Math.max(0, remainingPx / MM);
  const isReplaceMode = mode === "replace";

  const canSubmit = !!selectedVariant && (isReplaceMode || willFit);
  const submitLabel = isReplaceMode
    ? "Remplacer"
    : !willFit && selectedVariant
      ? `Plus de place (reste ${Math.floor(remainingMm)} mm)`
      : "Ajouter à mon attache";

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]} testID="perles-bois-overlay">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdropBase, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="perles-bois-backdrop" />
      </Animated.View>

      <Animated.View style={[styles.panel, { height: PANEL_HEIGHT }, panelStyle]} testID="perles-bois-panel">
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{isReplaceMode ? "Remplacer par une perle bois" : "Perles en bois"}</Text>
            <Text style={styles.subtitle}>
              {selectedVariant ? `Hêtre naturel · ${selectedVariant.label}` : "Choisissez une forme et une taille"}
            </Text>
          </View>
          <TouchableOpacity testID="perles-bois-close-button" style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#5a4b3c" />
          </TouchableOpacity>
        </View>

        {/* Grille de tuiles */}
        <View style={styles.grid}>
          {WOOD_VARIANTS.map((v) => (
            <WoodTile
              key={v.id}
              testID={`wood-tile-${v.id}`}
              variant={v}
              selected={selectedVariantId === v.id}
              onPress={() => setSelectedVariantId(v.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          testID={isReplaceMode ? "perles-bois-replace-button" : "perles-bois-add-button"}
          disabled={!canSubmit}
          activeOpacity={0.85}
          style={[styles.addBtn, !canSubmit && styles.addBtnDisabled]}
          onPress={() => {
            if (!selectedVariantId || !canSubmit) return;
            if (isReplaceMode && onReplaceBead) onReplaceBead(selectedVariantId);
            else {
              onAddBead(selectedVariantId);
              setSelectedVariantId(null);
            }
          }}
        >
          <Ionicons name={isReplaceMode ? "swap-horizontal" : "add"} size={20} color={canSubmit ? "#ffffff" : "#c0b5a2"} />
          <Text style={[styles.addBtnText, !canSubmit && styles.addBtnTextDisabled]}>{submitLabel}</Text>
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
    marginBottom: 16,
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
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    gap: 8,
  },
  tileWrap: {
    width: "31%",
  },
  tileInner: {
    backgroundColor: "#faf5eb",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#f2ede4",
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tileHalo: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#d4a574",
    backgroundColor: "rgba(212, 165, 116, 0.10)",
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#a99a86",
    marginTop: 6,
  },
  tileLabelActive: {
    color: "#5a4b3c",
    fontWeight: "700",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5a4b3c",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginTop: 4,
    gap: 8,
  },
  addBtnDisabled: { backgroundColor: "#f0e9dc" },
  addBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  addBtnTextDisabled: { color: "#c0b5a2" },
});
