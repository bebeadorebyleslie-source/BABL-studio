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

export const CROCHET_COLORS = SILICONE_COLORS.filter((c) =>
  (CROCHET_COLOR_IDS as readonly string[]).includes(c.id),
);

export const CROCHET_SIZE_MM = 16;
export const CROCHET_VARIANT_ID = "crochet-16";
