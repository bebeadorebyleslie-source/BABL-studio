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
import SizeToggle from "../SizeToggle";
import {
  SILICONE_RONDE_COLORS,
  SILICONE_RONDE_SIZES,
  SiliconeRondeSize,
} from "../../data/silicone-ronde-colors";

// === Géométrie de l'éventail ===
// 25 perles en 2 arcs concentriques semi-circulaires (ouverts vers le haut)
// - Arc intérieur : 10 perles, rayon 100
// - Arc extérieur : 15 perles, rayon 155
const R_INNER = 100;
const R_OUTER = 155;
const BEAD_VISUAL = 34;
const FAN_WIDTH = 2 * R_OUTER + BEAD_VISUAL + 20;
const FAN_HEIGHT = R_OUTER + BEAD_VISUAL + 10;
const CX = FAN_WIDTH / 2;
const CY = FAN_HEIGHT - 15;

const PANEL_HEIGHT = 440;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SiliconeRondePanel({ visible, onClose }: Props) {
  const [mounted, setMounted] = useState(visible);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<SiliconeRondeSize>(15);

  const translateY = useSharedValue(PANEL_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, { duration: 280 });
    } else if (mounted) {
      translateY.value = withTiming(PANEL_HEIGHT, {
        duration: 240,
        easing: Easing.in(Easing.cubic),
      });
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

  const selectedColor = useMemo(
    () => SILICONE_RONDE_COLORS.find((c) => c.id === selectedColorId) ?? null,
    [selectedColorId],
  );

  const beadPos = (index: number, total: number, radius: number) => {
    const stepAngleDeg = 180 / (total - 1);
    const angleDeg = -90 + index * stepAngleDeg;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + radius * Math.sin(angleRad),
      y: CY - radius * Math.cos(angleRad),
    };
  };

  if (!mounted) return null;

  const innerBeads = SILICONE_RONDE_COLORS.slice(0, 10);
  const outerBeads = SILICONE_RONDE_COLORS.slice(10, 25);

  return (
    <View
      style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]}
      testID="silicone-ronde-overlay"
    >
      {/* Backdrop subtil */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdropBase, backdropStyle]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          testID="silicone-ronde-backdrop"
        />
      </Animated.View>

      {/* Panneau bottom-sheet */}
      <Animated.View
        style={[styles.panel, { height: PANEL_HEIGHT }, panelStyle]}
        testID="silicone-ronde-panel"
      >
        <View style={styles.handleBar} />

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Silicone ronde</Text>
            <Text style={styles.subtitle}>
              {selectedColor ? selectedColor.name : "Choisissez une couleur"}
            </Text>
          </View>
          <TouchableOpacity
            testID="silicone-ronde-close-button"
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#5a4b3c" />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de taille 12mm / 15mm */}
        <View style={styles.sizeRow}>
          <SizeToggle
            testID="silicone-ronde-size"
            options={SILICONE_RONDE_SIZES}
            value={selectedSize}
            onChange={setSelectedSize}
          />
        </View>

        {/* Éventail des 25 perles */}
        <View style={styles.fanWrap}>
          <View
            style={[styles.fan, { width: FAN_WIDTH, height: FAN_HEIGHT }]}
            testID="silicone-ronde-fan"
          >
            {outerBeads.map((c, i) => {
              const { x, y } = beadPos(i, outerBeads.length, R_OUTER);
              return (
                <FanBead
                  key={c.id}
                  testID={`bead-${c.id}`}
                  image={c.image}
                  x={x}
                  y={y}
                  selected={selectedColorId === c.id}
                  onPress={() => setSelectedColorId(c.id)}
                />
              );
            })}
            {innerBeads.map((c, i) => {
              const { x, y } = beadPos(i, innerBeads.length, R_INNER);
              return (
                <FanBead
                  key={c.id}
                  testID={`bead-${c.id}`}
                  image={c.image}
                  x={x}
                  y={y}
                  selected={selectedColorId === c.id}
                  onPress={() => setSelectedColorId(c.id)}
                />
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdropBase: {
    backgroundColor: "#5a4b3c",
  },
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5a4b3c",
  },
  subtitle: {
    fontSize: 13,
    color: "#a99a86",
    marginTop: 2,
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
  sizeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  fanWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fan: {
    position: "relative",
  },
});
