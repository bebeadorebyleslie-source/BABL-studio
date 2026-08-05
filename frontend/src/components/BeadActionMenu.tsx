import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import BeadShape, { BeadMaterial } from "./BeadShape";
import type { SiliconeShape } from "../data/silicone-colors";

const PANEL_HEIGHT = 240;

type Props = {
  visible: boolean;
  bead: {
    name?: string;
    size: number;
    shape?: SiliconeShape;
    material?: BeadMaterial;
    image?: ImageSourcePropType;
    hex?: string;
  } | null;
  onReplace?: () => void;
  onDuplicate?: () => void;
  canDuplicate?: boolean;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onClose: () => void;
};

export default function BeadActionMenu({
  visible,
  bead,
  onReplace,
  onDuplicate,
  canDuplicate = true,
  onDelete,
  onMoveUp,
  onMoveDown,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(PANEL_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, { duration: 240 });
    } else if (mounted) {
      translateY.value = withTiming(PANEL_HEIGHT, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.15,
  }));

  if (!mounted || !bead) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]}
      testID="bead-action-menu-overlay"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          testID="bead-action-menu-backdrop"
        />
      </Animated.View>

      <Animated.View
        style={[styles.panel, { height: PANEL_HEIGHT }, panelStyle]}
        testID="bead-action-menu-panel"
      >
        <View style={styles.handleBar} />

        {/* Aperçu perle */}
        <View style={styles.preview}>
          <View style={styles.beadThumb}>
            <BeadShape
              shape={bead.shape ?? "ronde"}
              material={bead.material}
              size={48}
              hex={bead.hex ?? "#ddd"}
              image={bead.image}
            />
          </View>
          <View style={styles.previewText}>
            <Text style={styles.previewName}>{bead.name ?? "Perle"}</Text>
            <Text style={styles.previewSize}>{bead.size} mm</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onReplace ? (
            <TouchableOpacity
              testID="bead-action-replace"
              style={[styles.actionBtn, styles.replaceBtn]}
              activeOpacity={0.85}
              onPress={onReplace}
            >
              <Ionicons name="swap-horizontal" size={18} color="#5a4b3c" />
              <Text style={styles.replaceText}>Remplacer</Text>
            </TouchableOpacity>
          ) : null}

          {onDuplicate ? (
            <TouchableOpacity
              testID="bead-action-duplicate"
              style={[
                styles.actionBtn,
                styles.duplicateBtn,
                !canDuplicate && styles.actionBtnDisabled,
              ]}
              activeOpacity={0.85}
              onPress={onDuplicate}
              disabled={!canDuplicate}
            >
              <Ionicons name="copy-outline" size={18} color={canDuplicate ? "#5a4b3c" : "#bfb2a3"} />
              <Text style={[styles.duplicateText, !canDuplicate && styles.duplicateTextDisabled]}>Dupliquer</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            testID="bead-action-delete"
            style={[styles.actionBtn, styles.deleteBtn]}
            activeOpacity={0.85}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#ffffff" />
            <Text style={styles.deleteText}>Supprimer</Text>
          </TouchableOpacity>
        </View>

        {(onMoveUp || onMoveDown) && (
          <View style={styles.reorderRow}>
            <TouchableOpacity
              testID="bead-action-move-up"
              style={[styles.reorderBtn, !onMoveUp && styles.reorderBtnDisabled]}
              activeOpacity={0.85}
              onPress={onMoveUp}
              disabled={!onMoveUp}
            >
              <Ionicons name="chevron-up" size={18} color={onMoveUp ? "#5a4b3c" : "#bfb2a3"} />
              <Text style={[styles.reorderText, !onMoveUp && styles.reorderTextDisabled]}>Monter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="bead-action-move-down"
              style={[styles.reorderBtn, !onMoveDown && styles.reorderBtnDisabled]}
              activeOpacity={0.85}
              onPress={onMoveDown}
              disabled={!onMoveDown}
            >
              <Ionicons name="chevron-down" size={18} color={onMoveDown ? "#5a4b3c" : "#bfb2a3"} />
              <Text style={[styles.reorderText, !onMoveDown && styles.reorderTextDisabled]}>Descendre</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
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
    paddingBottom: 24,
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
    marginBottom: 16,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  beadThumb: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  beadImg: {
    width: 56,
    height: 56,
  },
  beadColor: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5a4b3c",
  },
  previewSize: {
    fontSize: 13,
    color: "#a99a86",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 999,
    gap: 8,
  },
  replaceBtn: {
    backgroundColor: "#f5efe4",
  },
  duplicateBtn: {
    backgroundColor: "#f5efe4",
  },
  actionBtnDisabled: {
    backgroundColor: "#f0ebe3",
  },
  replaceText: {
    color: "#5a4b3c",
    fontSize: 15,
    fontWeight: "600",
  },
  duplicateText: {
    color: "#5a4b3c",
    fontSize: 15,
    fontWeight: "600",
  },
  duplicateTextDisabled: {
    color: "#bfb2a3",
  },
  deleteBtn: {
    backgroundColor: "#c05a5a",
  },
  deleteText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  reorderRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  reorderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 999,
    gap: 6,
    backgroundColor: "#f5efe4",
  },
  reorderBtnDisabled: {
    opacity: 0.45,
  },
  reorderText: {
    color: "#5a4b3c",
    fontSize: 14,
    fontWeight: "600",
  },
  reorderTextDisabled: {
    color: "#bfb2a3",
  },
});
