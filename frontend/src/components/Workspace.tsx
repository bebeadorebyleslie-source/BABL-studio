import { useMemo } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { MM } from "../constants/sizes";
import BeadShape, { beadShapeDimensions, BeadMaterial } from "./BeadShape";
import type { SiliconeShape } from "../data/silicone-colors";
import { ClipModel, DEFAULT_CLIP_MODEL } from "../data/clip-models";

// === Dimensions naturelles (référence, ne jamais modifier) ===
const CLIP_SIZE = 180;
const TEMPLATE_WIDTH = 72;
const TEMPLATE_HEIGHT = 664;
const TEMPLATE_BORDER = 2;
const LOOP_SIZE = 140;
const CLIP_TEMPLATE_OVERLAP = 18;
const TEMPLATE_LOOP_OVERLAP = 4;

// Espace intérieur du gabarit dédié aux perles (2px de bordure en haut et en bas)
export const TEMPLATE_INNER_HEIGHT_PX = TEMPLATE_HEIGHT - TEMPLATE_BORDER * 2; // 660
export const TEMPLATE_INNER_HEIGHT_MM = TEMPLATE_INNER_HEIGHT_PX / MM; // 165
export const BEAD_STACK_OVERLAP_PX = 0.8;

export const NATURAL_HEIGHT =
  CLIP_SIZE + TEMPLATE_HEIGHT + LOOP_SIZE - CLIP_TEMPLATE_OVERLAP - TEMPLATE_LOOP_OVERLAP;
export const NATURAL_WIDTH = CLIP_SIZE;

export type CompositionBead = {
  id: string;
  family: string;
  shape?: SiliconeShape;
  material?: BeadMaterial;
  variantId?: string;
  colorId?: string;
  size: number; // mm
  topAnchorOffsetMm?: number;
  bottomAnchorOffsetMm?: number;
  imageAspectRatio?: number;
  generatedByName?: boolean;
  hex?: string;
  color?: string;
  image?: ImageSourcePropType;
  label?: string;
  widthMm?: number;
  heightMm?: number;
};

type Props = {
  composition: CompositionBead[];
  availableWidth?: number;
  availableHeight?: number;
  onBeadPress?: (beadId: string) => void;
  selectedBeadId?: string | null;
  clipModel?: ClipModel;
  showEngravingPreview?: boolean;
  engravingPreviewText?: string;
};

export default function Workspace({
  composition,
  availableWidth,
  availableHeight,
  onBeadPress,
  selectedBeadId,
  clipModel = DEFAULT_CLIP_MODEL,
  showEngravingPreview = false,
  engravingPreviewText = "",
}: Props) {
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
        <View style={styles.clipWrap}>
          <Image
            source={clipModel.image}
            style={styles.clip}
            resizeMode="contain"
          />
          {showEngravingPreview && engravingPreviewText.trim() && clipModel.engravingArea ? (
            <View
              pointerEvents="none"
              style={[
                styles.engravingPreviewWrap,
                {
                  left: clipModel.engravingArea.x,
                  top: clipModel.engravingArea.y,
                  width: clipModel.engravingArea.width,
                  height: clipModel.engravingArea.height,
                },
              ]}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.engravingPreviewText}>
                {engravingPreviewText}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Gabarit (Template) */}
        <View style={styles.template}>
          <View style={styles.beadsStack}>
            {composition.map((item) => {
              const px = item.size * MM;
              const isSelected = selectedBeadId === item.id;
              const shape: SiliconeShape = item.shape ?? "ronde";
              const isLetter = item.family === "lettres" && !!item.imageAspectRatio;
              const letterWidthPx = px;
              const letterHeightPx = isLetter ? px * (item.imageAspectRatio ?? 1) : px;
              const shapeStackHeightPx = shape === "lentille" ? Math.round(px + 3) : px;
              const explicitShapeWidthPx = item.widthMm ? item.widthMm * MM : undefined;
              const explicitShapeHeightPx = item.heightMm ? item.heightMm * MM : undefined;
              const dims = isLetter
                ? { width: letterHeightPx, height: letterWidthPx }
                : explicitShapeWidthPx && explicitShapeHeightPx
                  ? { width: explicitShapeWidthPx, height: explicitShapeHeightPx }
                : shape === "lentille"
                  ? { width: beadShapeDimensions(shape, px).width, height: shapeStackHeightPx }
                  : beadShapeDimensions(shape, px);
              const topAnchorOffsetPx = Math.max(0, (item.topAnchorOffsetMm ?? 0) * MM);
              const bottomAnchorOffsetPx = Math.max(0, (item.bottomAnchorOffsetMm ?? 0) * MM);
              return (
                <Pressable
                  key={item.id}
                  testID={`composition-bead-${item.id}`}
                  onPress={() => onBeadPress?.(item.id)}
                  style={{
                    width: dims.width,
                    height: dims.height,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -BEAD_STACK_OVERLAP_PX - topAnchorOffsetPx,
                    marginBottom: -BEAD_STACK_OVERLAP_PX - bottomAnchorOffsetPx,
                  }}
                >
                  <BeadShape
                    shape={shape}
                    material={item.material}
                    size={px}
                    hex={item.hex ?? item.color ?? "#ddd"}
                    image={item.image}
                    label={item.label}
                    rotationDeg={item.family === "lettres" ? 90 : undefined}
                    renderWidthPx={isLetter ? letterWidthPx : explicitShapeWidthPx}
                    renderHeightPx={isLetter ? letterHeightPx : explicitShapeHeightPx}
                  />
                  {isSelected && <View style={styles.beadSelectedRing} pointerEvents="none" />}
                </Pressable>
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
  clipWrap: {
    width: CLIP_SIZE,
    height: CLIP_SIZE,
    position: "relative",
  },
  engravingPreviewWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  engravingPreviewText: {
    color: "#5a4b3c",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  template: {
    width: TEMPLATE_WIDTH,
    height: TEMPLATE_HEIGHT,
    borderWidth: TEMPLATE_BORDER,
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
    paddingTop: 0, // Première perle collée au haut du gabarit
  },
  beadImage: {
    width: "100%",
    height: "100%",
  },
  beadColor: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
  },
  beadSelectedRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 1000,
    borderWidth: 2.5,
    borderColor: "#d4a574",
  },
  loop: {
    width: LOOP_SIZE,
    height: LOOP_SIZE,
    marginTop: -TEMPLATE_LOOP_OVERLAP,
  },
});
