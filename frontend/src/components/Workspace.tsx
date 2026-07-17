import { useMemo } from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";
import { MM } from "../constants/sizes";

// === Dimensions naturelles (référence, ne jamais modifier) ===
const CLIP_SIZE = 180;
const TEMPLATE_WIDTH = 72;
const TEMPLATE_HEIGHT = 620;
const LOOP_SIZE = 140;
const CLIP_TEMPLATE_OVERLAP = 18;
const TEMPLATE_LOOP_OVERLAP = 8;
const BEADS_TOP_PADDING = 18;

export const NATURAL_HEIGHT =
  CLIP_SIZE + TEMPLATE_HEIGHT + LOOP_SIZE - CLIP_TEMPLATE_OVERLAP - TEMPLATE_LOOP_OVERLAP;
export const NATURAL_WIDTH = CLIP_SIZE;

export type CompositionBead = {
  id: string | number;
  type: string;
  size: number; // mm
  color?: string;
  image?: ImageSourcePropType;
};

type Props = {
  composition: CompositionBead[];
  availableWidth?: number;
  availableHeight?: number;
};

export default function Workspace({ composition, availableWidth, availableHeight }: Props) {
  const scale = useMemo(() => {
    const sH = availableHeight && availableHeight > 0 ? availableHeight / NATURAL_HEIGHT : 1;
    const sW = availableWidth && availableWidth > 0 ? availableWidth / NATURAL_WIDTH : 1;
    return Math.min(1, sH, sW);
  }, [availableHeight, availableWidth]);

  return (
    <View
      style={[
        styles.workspace,
        { width: NATURAL_WIDTH * scale, height: NATURAL_HEIGHT * scale },
      ]}
      testID="workspace"
    >
      <View
        style={[
          styles.centerAxis,
          { width: NATURAL_WIDTH, height: NATURAL_HEIGHT, transform: [{ scale }] },
        ]}
      >
        {/* Clip */}
        <Image
          source={require("../../assets/images/clip.png")}
          style={styles.clip}
          resizeMode="contain"
        />

        {/* Gabarit (Template) */}
        <View style={styles.template}>
          <View style={styles.beadsStack}>
            {composition.map((item) => {
              const px = item.size * MM;
              // Image PNG réelle si dispo, sinon rendu couleur (rétrocompatibilité)
              if (item.image) {
                return (
                  <Image
                    key={item.id}
                    source={item.image}
                    style={{ width: px, height: px }}
                    resizeMode="contain"
                    testID={`composition-bead-${item.id}`}
                  />
                );
              }
              return (
                <View
                  key={item.id}
                  testID={`composition-bead-${item.id}`}
                  style={[
                    styles.beadColor,
                    { width: px, height: px, backgroundColor: item.color ?? "#ddd" },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Boucle (Loop) */}
        <Image
          source={require("../../assets/images/loop.png")}
          style={styles.loop}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workspace: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerAxis: {
    flexDirection: "column",
    alignItems: "center",
  },
  clip: {
    width: CLIP_SIZE,
    height: CLIP_SIZE,
  },
  template: {
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
    borderWidth: 2,
    borderColor: "#d4a574",
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: -CLIP_TEMPLATE_OVERLAP,
  },
  beadsStack: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: BEADS_TOP_PADDING,
  },
  beadColor: {
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: "white",
  },
  loop: {
    width: LOOP_SIZE,
    height: LOOP_SIZE,
    marginTop: -TEMPLATE_LOOP_OVERLAP,
  },
});
