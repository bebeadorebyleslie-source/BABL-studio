import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import CategoryCard from "./CategoryCard";
import { FAMILIES } from "../data/families";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function Sidebar({ visible, onClose }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  // Largeur bien proportionnée :
  // - minimum 288px (garantit la lisibilité des titres même sur iPhone SE 375px)
  // - cible 72% de l'écran
  // - maximum 340px (reste discrète sur grands écrans)
  const SIDEBAR_WIDTH = Math.max(288, Math.min(340, screenWidth * 0.72));

  const [mounted, setMounted] = useState(visible);
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, { duration: 280 });
    } else if (mounted) {
      translateX.value = withTiming(-SIDEBAR_WIDTH, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) {
          // Unmount after animation completes
        }
      });
      // Unmount after animation duration
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" testID="sidebar-overlay">
      {/* Backdrop flouté */}
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill}>
          <Pressable
            testID="sidebar-backdrop"
            style={[StyleSheet.absoluteFill, styles.backdropTint]}
            onPress={onClose}
          />
        </BlurView>
      </Animated.View>

      {/* Panneau Sidebar */}
      <Animated.View style={[styles.panel, { width: SIDEBAR_WIDTH }, panelStyle]} testID="sidebar-panel">
        <View style={styles.panelInner}>
          {/* Header du panneau */}
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Ateliers</Text>
              <Text style={styles.panelSubtitle}>Choisis une famille de perles</Text>
            </View>

            <TouchableOpacity
              testID="sidebar-close-button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color="#5a4b3c" />
            </TouchableOpacity>
          </View>

          {/* Liste des familles */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {FAMILIES.map((f) => (
              <CategoryCard
                key={f.id}
                id={f.id}
                title={f.title}
                subtitle={f.subtitle}
                iconName={f.iconName}
                iconColor={f.iconColor}
                iconBg={f.iconBg}
                selected={selectedId === f.id}
                onPress={() => setSelectedId(f.id)}
              />
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdropTint: {
    backgroundColor: "rgba(90, 75, 60, 0.15)",
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    paddingTop: 50,
    paddingBottom: 20,
    paddingLeft: 12,
  },
  panelInner: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5a4b3c",
  },
  panelSubtitle: {
    fontSize: 13,
    color: "#a99a86",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5efe4",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 20,
  },
});
