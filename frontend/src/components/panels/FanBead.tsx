import { useEffect } from "react";
import { StyleSheet, Pressable, ImageSourcePropType } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import BeadShape, { beadShapeDimensions, BeadMaterial } from "../BeadShape";
import type { SiliconeShape } from "../../data/silicone-colors";

const HITAREA_MIN = 46;

type Props = {
  shape: SiliconeShape;
  material?: BeadMaterial;
  hex: string;
  image?: ImageSourcePropType;
  size: number; // Taille visuelle en px
  beadWidthPx?: number;
  beadHeightPx?: number;
  x: number;
  y: number;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

export default function FanBead({
  shape,
  material,
  hex,
  image,
  size,
  beadWidthPx,
  beadHeightPx,
  x,
  y,
  selected,
  onPress,
  testID,
}: Props) {
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

  const shapeDims = beadShapeDimensions(shape, size);
  const bw = beadWidthPx ?? shapeDims.width;
  const bh = beadHeightPx ?? shapeDims.height;
  const hitW = Math.max(HITAREA_MIN, bw);
  const hitH = Math.max(HITAREA_MIN, bh);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={6}
      style={[
        styles.hitArea,
        {
          left: x - hitW / 2,
          top: y - hitH / 2,
          width: hitW,
          height: hitH,
        },
      ]}
    >
      {/* Halo autour de la perle */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: bw + 12,
            height: bh + 12,
            borderRadius: (Math.max(bw, bh) + 12) / 2,
          },
          haloStyle,
        ]}
      />
      {/* Perle avec sa vraie forme */}
      <Animated.View style={beadStyle}>
        <BeadShape
          shape={shape}
          material={material}
          size={size}
          hex={hex}
          image={image}
          renderWidthPx={beadWidthPx}
          renderHeightPx={beadHeightPx}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    position: "absolute",
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
