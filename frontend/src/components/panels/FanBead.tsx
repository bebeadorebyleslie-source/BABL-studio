import { useEffect } from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const BEAD_SIZE = 30;
const HALO_EXTRA = 10;
const HITAREA = 44;

type Props = {
  color: string;
  x: number;
  y: number;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

export default function FanBead({ color, x, y, selected, onPress, testID }: Props) {
  const scale = useSharedValue(1);
  const haloOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.18 : 1, { damping: 12, stiffness: 220 });
    haloOpacity.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const beadStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
  }));

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={6}
      style={[
        styles.hitArea,
        {
          left: x - HITAREA / 2,
          top: y - HITAREA / 2,
        },
      ]}
    >
      {/* Halo autour de la perle sélectionnée */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: BEAD_SIZE + HALO_EXTRA,
            height: BEAD_SIZE + HALO_EXTRA,
            borderRadius: (BEAD_SIZE + HALO_EXTRA) / 2,
          },
          haloStyle,
        ]}
      />
      {/* Perle */}
      <Animated.View
        style={[
          styles.bead,
          {
            width: BEAD_SIZE,
            height: BEAD_SIZE,
            borderRadius: BEAD_SIZE / 2,
            backgroundColor: color,
          },
          beadStyle,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    position: "absolute",
    width: HITAREA,
    height: HITAREA,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#d4a574",
    backgroundColor: "rgba(212, 165, 116, 0.08)",
  },
  bead: {
    borderWidth: 2,
    borderColor: "#ffffff",
    // Petite ombre pour donner un effet perle réelle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
