import { Image, ImageSourcePropType, View, StyleSheet } from "react-native";
import Svg, { Polygon, Ellipse } from "react-native-svg";

import type { SiliconeShape } from "../data/silicone-colors";

type Props = {
  shape: SiliconeShape;
  size: number; // px (visual size = diameter/height in pixels)
  hex: string;
  image?: ImageSourcePropType;
};

/**
 * Rendu unifié d'une perle silicone selon sa forme.
 * - Ronde : PNG réel (texture silicone préservée)
 * - Hexagone : polygone SVG (pointe en haut/bas)
 * - Lentille : ellipse SVG aplatie (largeur ≈ 2x hauteur)
 */
export default function BeadShape({ shape, size, hex, image }: Props) {
  if (shape === "ronde" && image) {
    return (
      <Image
        source={image}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  if (shape === "hexagone") {
    // Hexagone régulier avec pointes en haut/bas
    const w = size;
    const h = size;
    return (
      <Svg width={w} height={h} viewBox="0 0 100 100">
        <Polygon
          points="50,3 93,26 93,74 50,97 7,74 7,26"
          fill={hex}
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (shape === "lentille") {
    // Lentille = ellipse aplatie. size = hauteur visuelle, largeur ≈ 2x
    const h = size;
    const w = size * 2.2;
    return (
      <Svg width={w} height={h} viewBox="0 0 220 100">
        <Ellipse
          cx="110"
          cy="50"
          rx="105"
          ry="45"
          fill={hex}
          stroke="#ffffff"
          strokeWidth={3}
        />
      </Svg>
    );
  }

  // Fallback (rond sans image)
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hex,
      }}
    />
  );
}

export const beadShapeDimensions = (shape: SiliconeShape, sizePx: number) => {
  if (shape === "lentille") return { width: sizePx * 2.2, height: sizePx };
  return { width: sizePx, height: sizePx };
};

const _unused = StyleSheet.create({});
