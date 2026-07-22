import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
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
import { FORMES_VARIANTS, FormeVariant } from "../../data/formes-beads";
import { MM } from "../../constants/sizes";
import { TEMPLATE_INNER_HEIGHT_PX } from "../Workspace";

const PANEL_HEIGHT = 430;

type Props = {
  visible: boolean;
  mode?: "add" | "replace";
  currentLengthPx?: number;
  excludeBeadSizePx?: number;
  hasExistingForme?: boolean;
  onClose: () => void;
  onAddBead: (variantId: string) => void;
  onReplaceBead?: (variantId: string) => void;
};

function FormeTile({
  variant,
  selected,
  onPress,
  testID,
}: {
  variant: FormeVariant;
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

  const VISUAL = 40;
  const dims = variant.widthMm && variant.heightMm
    ? { width: variant.widthMm, height: variant.heightMm }
    : beadShapeDimensions(variant.shape, VISUAL);

  return (
    <Pressable testID={testID} onPress={onPress} style={styles.tileWrap}>
      <View style={styles.tileInner}>
        <View style={{ width: 92, height: 54, alignItems: "center", justifyContent: "center" }}>
          <Animated.View
            style={[
              styles.tileHalo,
              {
                width: dims.width + 14,
                height: dims.height + 14,
                borderRadius: (Math.max(dims.width, dims.height) + 14) / 2,
              },
              haloStyle,
            ]}
          />
          <Animated.View style={beadStyle}>
            <BeadShape
              shape={variant.shape}
              material="silicone"
              size={VISUAL}
              hex="#d4a574"
              image={variant.image}
            />
          </Animated.View>
        </View>
        <Text style={[styles.tileLabel, selected && styles.tileLabelActive]}>{variant.label}</Text>
      </View>
    </Pressable>
  );
}

export default function FormesPanel({
  visible,
  mode = "add",
  currentLengthPx = 0,
  excludeBeadSizePx = 0,
  hasExistingForme = false,
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

  const selectedVariant = FORMES_VARIANTS.find((v) => v.id === selectedVariantId) ?? null;

  const effectiveCurrentLength = currentLengthPx - excludeBeadSizePx;
  const remainingPx = TEMPLATE_INNER_HEIGHT_PX - effectiveCurrentLength;
  const selectedVariantAnchorReductionMm =
    (selectedVariant?.topAnchorOffsetMm ?? 0) + (selectedVariant?.bottomAnchorOffsetMm ?? 0);
  const selectedVariantEffectivePx = selectedVariant
    ? Math.max(0, selectedVariant.size - selectedVariantAnchorReductionMm) * MM
    : 0;
  const willFit = selectedVariant ? selectedVariantEffectivePx <= remainingPx : true;
  const remainingMm = Math.max(0, remainingPx / MM);
  const isReplaceMode = mode === "replace";

  const canSubmit = !!selectedVariant && willFit;
  const isReplaceFormeCta = hasExistingForme && !isReplaceMode;
  const isGreenCta = isReplaceFormeCta || isReplaceMode;
  const submitLabel = !willFit && selectedVariant
    ? isReplaceMode
      ? "Cette forme est trop grande pour l'espace restant."
      : `Plus de place (reste ${Math.floor(remainingMm)} mm)`
    : isReplaceMode
      ? "Remplacer"
      : hasExistingForme
        ? "Remplacer la forme"
        : "Ajouter à mon attache";

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]} testID="formes-overlay">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdropBase, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="formes-backdrop" />
      </Animated.View>

      <Animated.View style={[styles.panel, { height: PANEL_HEIGHT }, panelStyle]} testID="formes-panel">
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{isReplaceMode ? "Remplacer par une forme" : "Formes"}</Text>
            <Text style={styles.subtitle}>
              {selectedVariant ? `Forme · ${selectedVariant.label}` : "Choisissez une forme"}
            </Text>
            {hasExistingForme && !isReplaceMode ? (
              <Text style={styles.limitHint}>Une seule forme est autorisée. Toute nouvelle sélection remplacera la forme actuelle.</Text>
            ) : null}
          </View>
          <TouchableOpacity testID="formes-close-button" style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#5a4b3c" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={styles.grid}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {FORMES_VARIANTS.map((variant) => (
            <FormeTile
              key={variant.id}
              testID={`forme-tile-${variant.id}`}
              variant={variant}
              selected={selectedVariantId === variant.id}
              onPress={() => setSelectedVariantId(variant.id)}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          testID={isReplaceMode ? "formes-replace-button" : "formes-add-button"}
          disabled={!canSubmit}
          activeOpacity={0.85}
          style={[styles.addBtn, isGreenCta && styles.addBtnReplaceForme, !canSubmit && styles.addBtnDisabled]}
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
  limitHint: {
    fontSize: 11,
    color: "#8b7a68",
    marginTop: 6,
    lineHeight: 15,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5efe4",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "flex-start",
    gap: 4,
    paddingBottom: 168,
  },
  tileWrap: {
    width: "30%",
  },
  tileInner: {
    backgroundColor: "#faf5eb",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#f2ede4",
    paddingVertical: 10,
    paddingHorizontal: 6,
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
    marginTop: 4,
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
  addBtnReplaceForme: {
    backgroundColor: "#a3ba9e",
  },
  addBtnDisabled: { backgroundColor: "#f0e9dc" },
  addBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  addBtnTextDisabled: { color: "#c0b5a2" },
});
