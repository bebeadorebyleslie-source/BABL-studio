import { ImageSourcePropType } from "react-native";
import type { SiliconeShape } from "./silicone-colors";

export type WoodColor = {
  id: string;
  name: string;
  hex: string;
};

export const WOOD_COLORS: WoodColor[] = [
  { id: "wd-natural", name: "Hêtre naturel", hex: "#D9B98A" },
];

export type WoodVariant = {
  id: string;
  label: string;
  shape: SiliconeShape;
  size: number;
  image?: ImageSourcePropType;
};

export const WOOD_IMAGE_RONDE = require("../../assets/images/wood/wd-ronde.png");
export const WOOD_IMAGE_HEXA = require("../../assets/images/wood/wd-hexa.png");
export const WOOD_IMAGE_LENTILLE = require("../../assets/images/wood/wd-lentille.png");

export const WOOD_VARIANTS: WoodVariant[] = [
  { id: "wd-ronde-15", label: "Ronde 15", shape: "ronde", size: 15, image: WOOD_IMAGE_RONDE },
  { id: "wd-ronde-12", label: "Ronde 12", shape: "ronde", size: 12, image: WOOD_IMAGE_RONDE },
  { id: "wd-hexa-14", label: "Hexa 14", shape: "hexagone", size: 14, image: WOOD_IMAGE_HEXA },
  { id: "wd-hexa-10", label: "Hexa 10", shape: "hexagone", size: 10, image: WOOD_IMAGE_HEXA },
  { id: "wd-lentille-7", label: "Lentille 7", shape: "lentille", size: 7, image: WOOD_IMAGE_LENTILLE },
];

export const getWoodVariantById = (id: string) =>
  WOOD_VARIANTS.find((v) => v.id === id);
