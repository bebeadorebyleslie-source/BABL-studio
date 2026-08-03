import { Image, ImageSourcePropType } from "react-native";
import type { SiliconeShape } from "./silicone-colors";

export type FormeVariant = {
  id: string;
  label: string;
  shape: SiliconeShape;
  size: number;
  widthMm?: number;
  heightMm?: number;
  topAnchorOffsetMm?: number;
  bottomAnchorOffsetMm?: number;
  image: ImageSourcePropType;
};

export const FORMES_VARIANTS: FormeVariant[] = [
  {
    id: "forme-renard",
    label: "Renard",
    shape: "ronde",
    size: 26,
    topAnchorOffsetMm: 4,
    image: require("../../assets/images/formes/renard (1).png"),
  },
  {
    id: "forme-lapin",
    label: "Lapin",
    shape: "ronde",
    size: 21,
    image: require("../../assets/images/formes/lapin.png"),
  },
  {
    id: "forme-elephant",
    label: "Éléphant",
    shape: "ronde",
    size: 21,
    image: require("../../assets/images/formes/elephant.png"),
  },
  {
    id: "forme-arc-en-ciel",
    label: "Arc-en-ciel",
    shape: "ronde",
    size: 20,
    topAnchorOffsetMm: 2,
    bottomAnchorOffsetMm: 3,
    image: require("../../assets/images/formes/arc-en-ciel.png"),
  },
  {
    id: "forme-perlemontagne",
    label: "Perle montagne",
    shape: "ronde",
    size: 20,
    image: require("../../assets/images/formes/perlemontagne.png"),
  },
  {
    id: "forme-perleetoile",
    label: "Perle étoile",
    shape: "ronde",
    size: 20,
    image: require("../../assets/images/formes/perleetoile.png"),
  },
  {
    id: "forme-perlearcenciel",
    label: "Perle arc-en-ciel",
    shape: "ronde",
    size: 20,
    topAnchorOffsetMm: 2,
    bottomAnchorOffsetMm: 3,
    image: require("../../assets/images/formes/perlearcenciel.png"),
  },
  {
    id: "forme-oiseau",
    label: "Oiseau",
    shape: "ronde",
    size: 18,
    widthMm: 27.1,
    heightMm: 18,
    image: require("../../assets/images/formes/oiseau.png"),
  },
  {
    id: "forme-oiseau2",
    label: "Oiseau 2",
    shape: "ronde",
    size: 24,
    widthMm: 33,
    heightMm: 24,
    image: require("../../assets/images/formes/oiseau2.png"),
  },
  {
    id: "forme-hibou",
    label: "Hibou",
    shape: "ronde",
    size: 23,
    widthMm: 21,
    heightMm: 23,
    image: require("../../assets/images/formes/hibou.png"),
  },
  {
    id: "forme-nuage",
    label: "Nuage",
    shape: "ronde",
    size: 20,
    widthMm: 34,
    heightMm: 20,
    image: require("../../assets/images/formes/nuage.png"),
  },
  {
    id: "forme-etoile",
    label: "Étoile",
    shape: "ronde",
    size: 22,
    image: require("../../assets/images/formes/etoile.png"),
  },
  {
    id: "forme-et-01",
    label: "Étoile silicone 01",
    shape: "ronde",
    size: 35,
    image: require("../../assets/images/formes/et-01.png"),
  },
  {
    id: "forme-et-05",
    label: "Étoile silicone 05",
    shape: "ronde",
    size: 35,
    image: require("../../assets/images/formes/et-05.png"),
  },
  {
    id: "forme-et-18",
    label: "Étoile silicone 18",
    shape: "ronde",
    size: 35,
    image: require("../../assets/images/formes/et-18.png"),
  },
  {
    id: "forme-feuillesiliconebas",
    label: "Feuille silicone bas",
    shape: "feuillesiliconebas",
    size: 25,
    widthMm: 20,
    heightMm: 25,
    image: require("../../assets/images/formes/feuillesiliconebas.png"),
  },
  {
    id: "forme-feuillesiliconehaut",
    label: "Feuille silicone haut",
    shape: "feuillesiliconehaut",
    size: 25,
    widthMm: 20,
    heightMm: 25,
    image: require("../../assets/images/formes/feuillesiliconehaut.png"),
  },
];

export const getFormeVariantById = (id: string) =>
  FORMES_VARIANTS.find((variant) => variant.id === id);

export const getFormeDimensionsByVariantId = (id: string, targetHeightMm?: number) => {
  const variant = getFormeVariantById(id);
  if (!variant) return null;

  const height = targetHeightMm ?? variant.heightMm ?? variant.size;
  if (variant.widthMm && variant.heightMm) {
    return {
      width: (variant.widthMm / variant.heightMm) * height,
      height,
    };
  }

  const resolveAssetSource = (Image as unknown as {
    resolveAssetSource?: (source: ImageSourcePropType) => { width?: number; height?: number };
  }).resolveAssetSource;

  if (typeof resolveAssetSource !== "function") {
    return { width: height, height };
  }

  const resolved = resolveAssetSource(variant.image);
  const sourceWidth = resolved?.width ?? 0;
  const sourceHeight = resolved?.height ?? 0;

  if (!sourceWidth || !sourceHeight) {
    return { width: height, height };
  }

  return {
    width: (sourceWidth / sourceHeight) * height,
    height,
  };
};
