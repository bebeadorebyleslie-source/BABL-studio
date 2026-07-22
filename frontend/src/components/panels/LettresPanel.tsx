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
import { LETTRES_VARIANTS } from "../../data/lettres-beads";
import { MM } from "../../constants/sizes";
import { TEMPLATE_INNER_HEIGHT_PX } from "../Workspace";

const PANEL_HEIGHT = 500;
const LETTER_WIDTH_MM = 12;
const LETTER_VISUAL_SIZE = LETTER_WIDTH_MM * MM;

type FanLayout = {
  arcs: { count: number; radius: number }[];
  beadVisualSize: number;
  fanWidth: number;
  fanHeight: number;
};

const getFanLayout = (letterCount: number): FanLayout => {
  if (letterCount >= 20) {
    return {
      arcs: [
        { count: 8, radius: 88 },
        { count: 8, radius: 142 },
        { count: 10, radius: 196 },
      ],
      beadVisualSize: LETTER_VISUAL_SIZE,
      fanWidth: 350,
      fanHeight: 230,
    };
  }

  if (letterCount >= 10) {
    return {
      arcs: [
        { count: 6, radius: 82 },
        { count: 7, radius: 138 },
        { count: 6, radius: 190 },
      ],
      beadVisualSize: LETTER_VISUAL_SIZE,
      fanWidth: 340,
      fanHeight: 220,
    };
  }

  return {
    arcs: [{ count: letterCount, radius: 110 }],
    beadVisualSize: LETTER_VISUAL_SIZE,
    fanWidth: 320,
    fanHeight: 150,
  };
};

type Props = {
  visible: boolean;
  mode?: "add" | "replace";
  currentLengthPx?: number;
  excludeBeadSizePx?: number;
  onClose: () => void;
  onAddBead: (variantId: string) => void;
  onReplaceBead?: (variantId: string) => void;
};

export default function LettresPanel({
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

  const selectedVariant = useMemo(
    () => LETTRES_VARIANTS.find((v) => v.id === selectedVariantId) ?? null,
    [selectedVariantId],
  );

  const effectiveCurrentLength = currentLengthPx - excludeBeadSizePx;
  const remainingPx = TEMPLATE_INNER_HEIGHT_PX - effectiveCurrentLength;
  const willFit = selectedVariant ? selectedVariant.size * MM <= remainingPx : true;
  const remainingMm = Math.max(0, remainingPx / MM);
  const isReplaceMode = mode === "replace";

  const layout = useMemo(() => getFanLayout(LETTRES_VARIANTS.length), []);
  const CX = layout.fanWidth / 2;
  const CY = layout.fanHeight - 15;

  const beadPos = (index: number, total: number, radius: number) => {
    if (total === 1) return { x: CX, y: CY - radius };
    const stepAngleDeg = 180 / (total - 1);
    const angleDeg = -90 + index * stepAngleDeg;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + radius * Math.sin(angleRad),
      y: CY - radius * Math.cos(angleRad),
    };
  };

  const arcSlices = useMemo(() => {
    const result: { variants: typeof LETTRES_VARIANTS; radius: number }[] = [];
    let cursor = 0;
    for (const arc of layout.arcs) {
      result.push({
        variants: LETTRES_VARIANTS.slice(cursor, cursor + arc.count),
        radius: arc.radius,
      });
      cursor += arc.count;
    }
    return result;
  }, [layout]);

  const canSubmit = !!selectedVariant && (isReplaceMode || willFit);
  const submitLabel = isReplaceMode
    ? "Remplacer"
    : !willFit && selectedVariant
      ? `Plus de place (reste ${Math.floor(remainingMm)} mm)`
      : "Ajouter à mon attache";

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]} testID="lettres-overlay">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdropBase, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="lettres-backdrop" />
      </Animated.View>

      <Animated.View style={[styles.panel, { height: PANEL_HEIGHT }, panelStyle]} testID="lettres-panel">
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{isReplaceMode ? "Remplacer" : "Lettres"}</Text>
            <Text style={styles.subtitle}>
              {selectedVariant ? `${selectedVariant.label}` : "Choisissez une touche"}
            </Text>
          </View>
          <TouchableOpacity testID="lettres-close-button" style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#5a4b3c" />
          </TouchableOpacity>
        </View>

        <View style={styles.fanWrap}>
          <View style={[styles.fan, { width: layout.fanWidth, height: layout.fanHeight }]} testID="lettres-fan">
            {arcSlices.map((slice) =>
              slice.variants.map((variant, index) => {
                const { x, y } = beadPos(index, slice.variants.length, slice.radius);
                return (
                  <FanBead
                    key={variant.id}
                    testID={`lettre-${variant.id}`}
                    shape="ronde"
                    material="silicone"
                    hex={variant.hex}
                    image={variant.image}
                    size={layout.beadVisualSize}
                    beadWidthPx={layout.beadVisualSize}
                    beadHeightPx={layout.beadVisualSize * variant.imageAspectRatio}
                    x={x}
                    y={y}
                    selected={selectedVariantId === variant.id}
                    onPress={() => setSelectedVariantId(variant.id)}
                  />
                );
              }),
            )}
          </View>
        </View>

        <TouchableOpacity
          testID={isReplaceMode ? "lettres-replace-button" : "lettres-add-button"}
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
    marginBottom: 14,
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
  fanWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  fan: {
    position: "relative",
    backgroundColor: "#f9f4eb",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#f1e9dd",
  },
  addBtn: {
    marginTop: 2,
    backgroundColor: "#5a4b3c",
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addBtnDisabled: {
    backgroundColor: "#efe7da",
  },
  addBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  addBtnTextDisabled: {
    color: "#c0b5a2",
  },
});
