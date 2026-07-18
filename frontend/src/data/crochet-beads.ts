import { ImageSourcePropType } from "react-native";
import { SILICONE_COLORS } from "./silicone-colors";

// Perles crochet — 16mm, 14 couleurs disponibles.
// Les couleurs suivent la palette silicone (même codes hex) car le fil de crochet
// respecte les mêmes teintes commerciales.
const CROCHET_COLOR_IDS = [
  "sr-01", // Blanc
  "sr-05", // Gris clair
  "sr-07", // Argan
  "sr-17", // Chocolat
  "sr-15", // Moutarde
  "sr-14", // Jaune pâle
  "sr-13", // Kaki clair
  "sr-11", // Vert tropicale
  "sr-10", // Menthe
  "sr-09", // Vert d'eau
  "sr-19", // Saphir
  "sr-18", // Brume bleu
  "sr-21", // Orchidée
  "sr-23", // Pêche
] as const;

// Mapping direct des PNG photoréalistes générés (cr-sr-XX.png)
const CROCHET_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  "sr-01": require("../../assets/images/crochet/cr-sr-01.png"),
  "sr-05": require("../../assets/images/crochet/cr-sr-05.png"),
  "sr-07": require("../../assets/images/crochet/cr-sr-07.png"),
  "sr-09": require("../../assets/images/crochet/cr-sr-09.png"),
  "sr-10": require("../../assets/images/crochet/cr-sr-10.png"),
  "sr-11": require("../../assets/images/crochet/cr-sr-11.png"),
  "sr-13": require("../../assets/images/crochet/cr-sr-13.png"),
  "sr-14": require("../../assets/images/crochet/cr-sr-14.png"),
  "sr-15": require("../../assets/images/crochet/cr-sr-15.png"),
  "sr-17": require("../../assets/images/crochet/cr-sr-17.png"),
  "sr-18": require("../../assets/images/crochet/cr-sr-18.png"),
  "sr-19": require("../../assets/images/crochet/cr-sr-19.png"),
  "sr-21": require("../../assets/images/crochet/cr-sr-21.png"),
  "sr-23": require("../../assets/images/crochet/cr-sr-23.png"),
};

export type CrochetColor = {
  id: string;
  name: string;
  hex: string;
  image?: ImageSourcePropType;
};

export const CROCHET_COLORS: CrochetColor[] = SILICONE_COLORS
  .filter((c) => (CROCHET_COLOR_IDS as readonly string[]).includes(c.id))
  .map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    image: CROCHET_IMAGE_MAP[c.id],
  }));

export const getCrochetImageById = (id: string): ImageSourcePropType | undefined =>
  CROCHET_IMAGE_MAP[id];

export const CROCHET_SIZE_MM = 16;
export const CROCHET_VARIANT_ID = "crochet-16";
