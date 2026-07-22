import { ImageSourcePropType } from "react-native";

export type EngravingArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  alignHorizontal?: "left" | "center" | "right";
  alignVertical?: "top" | "center" | "bottom";
};

export type ClipModel = {
  id: string;
  label: string;
  material: "wood" | "metal" | "plastic";
  image: ImageSourcePropType;
  naturalWidth: number;
  naturalHeight: number;
  engravingArea?: EngravingArea;
};

export const CLIP_MODELS: ClipModel[] = [
  {
    id: "wood-classic",
    label: "Clip bois classique",
    material: "wood",
    image: require("../../assets/images/clip.png"),
    naturalWidth: 180,
    naturalHeight: 180,
    engravingArea: {
      x: 42,
      y: 64,
      width: 96,
      height: 42,
      alignHorizontal: "center",
      alignVertical: "center",
    },
  },
];

export const DEFAULT_CLIP_MODEL = CLIP_MODELS[0];
