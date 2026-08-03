import { Image, ImageSourcePropType } from "react-native";
import type { SiliconeShape } from "./silicone-colors";

export type LettreVariant = {
  id: string;
  label: string;
  letter: string;
  shape: SiliconeShape;
  size: number;
  imageAspectRatio: number;
  hex: string;
  image: ImageSourcePropType;
};

const alphabetImages = [
  require("../../assets/images/alphabet/1.png"),
  require("../../assets/images/alphabet/2.png"),
  require("../../assets/images/alphabet/3.png"),
  require("../../assets/images/alphabet/4.png"),
  require("../../assets/images/alphabet/5.png"),
  require("../../assets/images/alphabet/6.png"),
  require("../../assets/images/alphabet/7.png"),
  require("../../assets/images/alphabet/8.png"),
  require("../../assets/images/alphabet/9.png"),
  require("../../assets/images/alphabet/10.png"),
  require("../../assets/images/alphabet/11.png"),
  require("../../assets/images/alphabet/12.png"),
  require("../../assets/images/alphabet/13.png"),
  require("../../assets/images/alphabet/14.png"),
  require("../../assets/images/alphabet/15.png"),
  require("../../assets/images/alphabet/16.png"),
  require("../../assets/images/alphabet/17.png"),
  require("../../assets/images/alphabet/18.png"),
  require("../../assets/images/alphabet/19.png"),
  require("../../assets/images/alphabet/20.png"),
  require("../../assets/images/alphabet/21.png"),
  require("../../assets/images/alphabet/22.png"),
  require("../../assets/images/alphabet/23.png"),
  require("../../assets/images/alphabet/24.png"),
  require("../../assets/images/alphabet/25.png"),
  require("../../assets/images/alphabet/26.png"),
] as const;

const specialAlphabetImages = [
  ["À", require("../../assets/images/alphabet/A-grave.png")],
  ["Ä", require("../../assets/images/alphabet/A-trema.png")],
  ["Ç", require("../../assets/images/alphabet/C-cedille.png")],
  ["È", require("../../assets/images/alphabet/E-grave.png")],
  ["É", require("../../assets/images/alphabet/E-aigu.png")],
  ["Ê", require("../../assets/images/alphabet/E-circonflexe.png")],
  ["Ë", require("../../assets/images/alphabet/E-trema.png")],
  ["Î", require("../../assets/images/alphabet/I-circonflexe.png")],
  ["Ï", require("../../assets/images/alphabet/I-trema.png")],
  ["Ô", require("../../assets/images/alphabet/O-circonflexe.png")],
  ["Ö", require("../../assets/images/alphabet/O-trema.png")],
  ["Ù", require("../../assets/images/alphabet/U-grave.png")],
  ["Û", require("../../assets/images/alphabet/U-circonflexe.png")],
  ["Ÿ", require("../../assets/images/alphabet/Y-trema.png")],
] as const;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const SPECIAL_LETTERS = ["À", "Ä", "Ç", "È", "É", "Ê", "Ë", "Î", "Ï", "Ô", "Ö", "Ù", "Û", "Ÿ"] as const;
const DEFAULT_LETTER_IMAGE_ASPECT_RATIO = 130 / 99;

const getImageAspectRatio = (image: ImageSourcePropType): number => {
  try {
    const resolveAssetSource = (Image as any)?.resolveAssetSource;
    if (typeof resolveAssetSource !== "function") return DEFAULT_LETTER_IMAGE_ASPECT_RATIO;
    const resolved = resolveAssetSource(image);
    if (!resolved?.width || !resolved?.height) return DEFAULT_LETTER_IMAGE_ASPECT_RATIO;
    return resolved.height / resolved.width;
  } catch {
    return DEFAULT_LETTER_IMAGE_ASPECT_RATIO;
  }
};

export const LETTRES_VARIANTS: LettreVariant[] = LETTERS.map((letter, index) => ({
  id: `lettre-${letter.toLowerCase()}`,
  label: letter,
  letter,
  shape: "ronde",
  size: 12,
  imageAspectRatio: getImageAspectRatio(alphabetImages[index]),
  hex: "#ECE3D0",
  image: alphabetImages[index],
}));

export const LETTRES_SPECIALES_VARIANTS: LettreVariant[] = SPECIAL_LETTERS.map((letter, index) => ({
  id: `lettre-special-${index + 1}`,
  label: letter,
  letter,
  shape: "ronde",
  size: 12,
  imageAspectRatio: getImageAspectRatio(specialAlphabetImages[index][1]),
  hex: "#ECE3D0",
  image: specialAlphabetImages[index][1],
}));

const ALL_LETTERS_VARIANTS = [...LETTRES_VARIANTS, ...LETTRES_SPECIALES_VARIANTS];

export const getLettreVariantById = (id: string) =>
  ALL_LETTERS_VARIANTS.find((variant) => variant.id === id);
