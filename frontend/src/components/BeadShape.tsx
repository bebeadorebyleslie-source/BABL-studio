import { Image, ImageSourcePropType, View } from "react-native";
import Svg, {
  Polygon,
  Ellipse,
  Defs,
  RadialGradient,
  Stop,
  Circle,
  G,
  Path,
} from "react-native-svg";

import type { SiliconeShape } from "../data/silicone-colors";

export type BeadMaterial = "silicone" | "bois" | "crochet";

type Props = {
  shape: SiliconeShape;
  material?: BeadMaterial;
  size: number;
  hex: string;
  image?: ImageSourcePropType;
};

// Petit utilitaire pour éclaircir/foncer une couleur hex
const shade = (hex: string, amount: number): string => {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const SILICONE_LIGHT = 40;
const SILICONE_DARK = -30;
const WOOD_LIGHT_EDGE = 25;
const WOOD_DARK_EDGE = -35;

export default function BeadShape({
  shape,
  material = "silicone",
  size,
  hex,
  image,
}: Props) {
  // === Silicone Ronde : PNG réel ===
  if (material === "silicone" && shape === "ronde" && image) {
    return (
      <Image
        source={image}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  // === Silicone Hexagone : SVG avec gradient radial + highlight ===
  if (material === "silicone" && shape === "hexagone") {
    const light = shade(hex, SILICONE_LIGHT);
    const dark = shade(hex, SILICONE_DARK);
    const gradId = `sil-hex-${hex.replace("#", "")}`;
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradId} cx="35%" cy="30%" rx="75%" ry="75%">
            <Stop offset="0%" stopColor={light} stopOpacity="1" />
            <Stop offset="55%" stopColor={hex} stopOpacity="1" />
            <Stop offset="100%" stopColor={dark} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Polygon
          points="50,4 92,26 92,74 50,96 8,74 8,26"
          fill={`url(#${gradId})`}
          stroke={shade(hex, -60)}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        {/* Highlight lumineux */}
        <Ellipse cx="40" cy="24" rx="18" ry="6" fill="#ffffff" opacity="0.35" />
      </Svg>
    );
  }

  // === Silicone Lentille : SVG ellipse aplatie avec gradient + highlight ===
  if (material === "silicone" && shape === "lentille") {
    const light = shade(hex, SILICONE_LIGHT);
    const dark = shade(hex, SILICONE_DARK);
    const gradId = `sil-len-${hex.replace("#", "")}`;
    const w = size * 2.2;
    const h = size;
    return (
      <Svg width={w} height={h} viewBox="0 0 220 100">
        <Defs>
          <RadialGradient id={gradId} cx="40%" cy="30%" rx="80%" ry="90%">
            <Stop offset="0%" stopColor={light} stopOpacity="1" />
            <Stop offset="55%" stopColor={hex} stopOpacity="1" />
            <Stop offset="100%" stopColor={dark} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx="110"
          cy="50"
          rx="105"
          ry="45"
          fill={`url(#${gradId})`}
          stroke={shade(hex, -60)}
          strokeWidth={1.5}
        />
        <Ellipse cx="90" cy="28" rx="40" ry="8" fill="#ffffff" opacity="0.4" />
      </Svg>
    );
  }

  // === Bois (hêtre) : image PNG réelle si dispo, sinon SVG avec grain ===
  if (material === "bois") {
    if (image && (shape === "ronde" || shape === "hexagone")) {
      // Utiliser le vrai PNG bois pour rondes et hexagones
      return (
        <Image
          source={image}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      );
    }

    // Fallback SVG (lentille bois)
    const light = shade(hex, WOOD_LIGHT_EDGE);
    const dark = shade(hex, WOOD_DARK_EDGE);
    const gradId = `bois-${shape}-${hex.replace("#", "")}`;

    const WoodTexture = () => (
      <>
        <Defs>
          <RadialGradient id={gradId} cx="35%" cy="30%" rx="85%" ry="85%">
            <Stop offset="0%" stopColor={light} stopOpacity="1" />
            <Stop offset="55%" stopColor={hex} stopOpacity="1" />
            <Stop offset="100%" stopColor={dark} stopOpacity="1" />
          </RadialGradient>
        </Defs>
      </>
    );

    if (shape === "ronde") {
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {WoodTexture()}
          <Circle cx="50" cy="50" r="47" fill={`url(#${gradId})`} stroke={shade(hex, -60)} strokeWidth="1" />
          {/* Veines de bois subtiles */}
          <Path d="M 20 45 Q 50 42 80 47" stroke={shade(hex, -40)} strokeWidth="0.6" fill="none" opacity="0.5" />
          <Path d="M 20 58 Q 50 62 80 56" stroke={shade(hex, -40)} strokeWidth="0.5" fill="none" opacity="0.4" />
          <Path d="M 25 70 Q 55 68 78 72" stroke={shade(hex, -40)} strokeWidth="0.5" fill="none" opacity="0.35" />
          {/* Trou central pour l'aspect perle */}
          <Circle cx="50" cy="50" r="6" fill={shade(hex, -50)} opacity="0.35" />
          {/* Highlight */}
          <Ellipse cx="38" cy="30" rx="14" ry="6" fill="#ffffff" opacity="0.35" />
        </Svg>
      );
    }

    if (shape === "hexagone") {
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {WoodTexture()}
          <Polygon
            points="50,4 92,26 92,74 50,96 8,74 8,26"
            fill={`url(#${gradId})`}
            stroke={shade(hex, -60)}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <Path d="M 20 48 Q 50 45 80 50" stroke={shade(hex, -40)} strokeWidth="0.6" fill="none" opacity="0.5" />
          <Path d="M 22 62 Q 50 65 78 60" stroke={shade(hex, -40)} strokeWidth="0.5" fill="none" opacity="0.4" />
          <Circle cx="50" cy="50" r="5" fill={shade(hex, -50)} opacity="0.35" />
          <Ellipse cx="38" cy="24" rx="14" ry="5" fill="#ffffff" opacity="0.35" />
        </Svg>
      );
    }

    if (shape === "lentille") {
      const w = size * 2.2;
      const h = size;
      return (
        <Svg width={w} height={h} viewBox="0 0 220 100">
          {WoodTexture()}
          <Ellipse cx="110" cy="50" rx="105" ry="45" fill={`url(#${gradId})`} stroke={shade(hex, -60)} strokeWidth="1.5" />
          <Path d="M 30 45 Q 110 42 190 48" stroke={shade(hex, -40)} strokeWidth="0.8" fill="none" opacity="0.5" />
          <Path d="M 40 62 Q 110 65 180 60" stroke={shade(hex, -40)} strokeWidth="0.7" fill="none" opacity="0.4" />
          <Circle cx="110" cy="50" r="6" fill={shade(hex, -50)} opacity="0.35" />
          <Ellipse cx="90" cy="28" rx="35" ry="7" fill="#ffffff" opacity="0.35" />
        </Svg>
      );
    }
  }

  // === Crochet : SVG cercle avec texture "tricot" (petits points) ===
  if (material === "crochet" && shape === "ronde") {
    const light = shade(hex, 15);
    const dark = shade(hex, -30);
    const gradId = `croc-${hex.replace("#", "")}`;
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradId} cx="40%" cy="35%" rx="80%" ry="80%">
            <Stop offset="0%" stopColor={light} stopOpacity="1" />
            <Stop offset="70%" stopColor={hex} stopOpacity="1" />
            <Stop offset="100%" stopColor={dark} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="47" fill={`url(#${gradId})`} stroke={shade(hex, -50)} strokeWidth="1" />
        {/* Texture crochetée : petits points en croix */}
        <G opacity="0.4">
          {[
            [30, 30], [45, 25], [60, 25], [75, 30],
            [25, 45], [40, 42], [55, 42], [70, 42], [80, 47],
            [22, 58], [37, 58], [52, 58], [67, 58], [80, 60],
            [28, 72], [43, 72], [58, 72], [72, 70],
          ].map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r="1.8" fill={shade(hex, -25)} />
          ))}
        </G>
        {/* Highlight général */}
        <Ellipse cx="38" cy="30" rx="14" ry="6" fill="#ffffff" opacity="0.28" />
      </Svg>
    );
  }

  // === Fallback : cercle plein ===
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
