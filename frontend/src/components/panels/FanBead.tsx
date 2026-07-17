import { useEffect } from "react";
import { StyleSheet, Pressable, Image, ImageSourcePropType } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const BEAD_SIZE = 34;
const HALO_EXTRA = 12;
const HITAREA = 46;

type Props = {
  image: ImageSourcePropType;
  x: number;
  y: number;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

export default function FanBead({ image, x, y, selected, onPress, testID }: Props) {
  const scale = useSharedValue(1);
  const haloOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.2 : 1, { damping: 12, stiffness: 220 });
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
      {/* Vraie perle PNG */}
      <Animated.View style={beadStyle}>
        <Image
          source={image}
          style={{
            width: BEAD_SIZE,
            height: BEAD_SIZE,
          }}
          resizeMode="contain"
        />
      </Animated.View>
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
    backgroundColor: "rgba(212, 165, 116, 0.10)",
  },
});
