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
import { CROCHET_COLORS, CROCHET_SIZE_MM } from "../../data/crochet-beads";
import { MM } from "../../constants/sizes";
import { TEMPLATE_INNER_HEIGHT_PX } from "../Workspace";

// Layout éventail : 14 couleurs → 2 arcs (6 + 8)
const R_INNER = 90;
const R_OUTER = 150;
const BEAD_VISUAL = 40;
const FAN_WIDTH = 2 * R_OUTER + BEAD_VISUAL + 20; // 340
const FAN_HEIGHT = R_OUTER + BEAD_VISUAL + 10; // 200
const CX = FAN_WIDTH / 2;
const CY = FAN_HEIGHT - 15;

const PANEL_HEIGHT = 490;

type Props = {
  visible: boolean;
  mode?: "add" | "replace";
  currentLengthPx?: number;
  excludeBeadSizePx?: number;
  onClose: () => void;
  onAddBead: (colorId: string) => void;
  onReplaceBead?: (colorId: string) => void;
};

export default function CrochetPanel({
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

  const selectedColor = useMemo(
    () => CROCHET_COLORS.find((c) => c.id === selectedColorId) ?? null,
    [selectedColorId],
  );

  const effectiveCurrentLength = currentLengthPx - excludeBeadSizePx;
  const remainingPx = TEMPLATE_INNER_HEIGHT_PX - effectiveCurrentLength;
  const willFit = CROCHET_SIZE_MM * MM <= remainingPx;
  const remainingMm = Math.max(0, remainingPx / MM);
  const isReplaceMode = mode === "replace";

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

  const innerColors = CROCHET_COLORS.slice(0, 6);
  const outerColors = CROCHET_COLORS.slice(6, 14);

  const canSubmit = !!selectedColorId && (isReplaceMode || willFit);
  const submitLabel = isReplaceMode
    ? "Remplacer"
    : !willFit && selectedColorId
      ? `Plus de place (reste ${Math.floor(remainingMm)} mm)`
      : "Ajouter à mon attache";

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]} testID="crochet-overlay">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdropBase, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="crochet-backdrop" />
      </Animated.View>

      <Animated.View style={[styles.panel, { height: PANEL_HEIGHT }, panelStyle]} testID="crochet-panel">
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{isReplaceMode ? "Remplacer par une perle crochet" : "Crochet"}</Text>
            <Text style={styles.subtitle}>
              {selectedColor ? `${selectedColor.name} · 16 mm` : "Choisissez une couleur — 16 mm"}
            </Text>
          </View>
          <TouchableOpacity testID="crochet-close-button" style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#5a4b3c" />
          </TouchableOpacity>
        </View>

        <View style={styles.fanWrap}>
          <View style={[styles.fan, { width: FAN_WIDTH, height: FAN_HEIGHT }]} testID="crochet-fan">
            {outerColors.map((c, i) => {
              const { x, y } = beadPos(i, outerColors.length, R_OUTER);
              return (
                <FanBead
                  key={`crochet-${c.id}`}
                  testID={`crochet-bead-${c.id}`}
                  shape="ronde"
                  material="crochet"
                  hex={c.hex}
                  image={c.image}
                  size={BEAD_VISUAL}
                  x={x}
                  y={y}
                  selected={selectedColorId === c.id}
                  onPress={() => setSelectedColorId(c.id)}
                />
              );
            })}
            {innerColors.map((c, i) => {
              const { x, y } = beadPos(i, innerColors.length, R_INNER);
              return (
                <FanBead
                  key={`crochet-${c.id}`}
                  testID={`crochet-bead-${c.id}`}
                  shape="ronde"
                  material="crochet"
                  hex={c.hex}
                  image={c.image}
                  size={BEAD_VISUAL}
                  x={x}
                  y={y}
                  selected={selectedColorId === c.id}
                  onPress={() => setSelectedColorId(c.id)}
                />
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          testID={isReplaceMode ? "crochet-replace-button" : "crochet-add-button"}
          disabled={!canSubmit}
          activeOpacity={0.85}
          style={[styles.addBtn, !canSubmit && styles.addBtnDisabled]}
          onPress={() => {
            if (!selectedColorId || !canSubmit) return;
            if (isReplaceMode && onReplaceBead) onReplaceBead(selectedColorId);
            else {
              onAddBead(selectedColorId);
              setSelectedColorId(null);
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
    marginTop: 6,
    gap: 8,
  },
  addBtnDisabled: { backgroundColor: "#f0e9dc" },
  addBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  addBtnTextDisabled: { color: "#c0b5a2" },
});
