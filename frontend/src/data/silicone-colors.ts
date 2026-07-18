import { ImageSourcePropType } from "react-native";

export type SiliconeShape = "ronde" | "hexagone" | "lentille";

export type SiliconeColor = {
  id: string;
  name: string;
  hex: string;
  image: ImageSourcePropType; // PNG utilisé pour les perles rondes
};

// 25 couleurs des perles Silicone (image ronde + code hex pour les formes hexagone/lentille)
export const SILICONE_COLORS: SiliconeColor[] = [
  { id: "sr-01", name: "Blanc", hex: "#E8E7E5", image: require("../../assets/images/silicone-ronde/sr-01.png") },
  { id: "sr-02", name: "Poussière d'étoile", hex: "#C6C5C3", image: require("../../assets/images/silicone-ronde/sr-02.png") },
  { id: "sr-03", name: "Marbre", hex: "#C1C2C2", image: require("../../assets/images/silicone-ronde/sr-03.png") },
  { id: "sr-04", name: "Givre", hex: "#D4CFBE", image: require("../../assets/images/silicone-ronde/sr-04.png") },
  { id: "sr-05", name: "Gris clair", hex: "#939595", image: require("../../assets/images/silicone-ronde/sr-05.png") },
  { id: "sr-06", name: "Gris foncé", hex: "#58656C", image: require("../../assets/images/silicone-ronde/sr-06.png") },
  { id: "sr-07", name: "Argan", hex: "#E8CFA9", image: require("../../assets/images/silicone-ronde/sr-07.png") },
  { id: "sr-08", name: "Bronze", hex: "#844E2B", image: require("../../assets/images/silicone-ronde/sr-08.png") },
  { id: "sr-09", name: "Vert d'eau", hex: "#9DC8BD", image: require("../../assets/images/silicone-ronde/sr-09.png") },
  { id: "sr-10", name: "Menthe", hex: "#96D7C2", image: require("../../assets/images/silicone-ronde/sr-10.png") },
  { id: "sr-11", name: "Vert tropicale", hex: "#028B97", image: require("../../assets/images/silicone-ronde/sr-11.png") },
  { id: "sr-12", name: "Kaki", hex: "#5D7A35", image: require("../../assets/images/silicone-ronde/sr-12.png") },
  { id: "sr-13", name: "Kaki clair", hex: "#B2B67F", image: require("../../assets/images/silicone-ronde/sr-13.png") },
  { id: "sr-14", name: "Jaune pâle", hex: "#F7E277", image: require("../../assets/images/silicone-ronde/sr-14.png") },
  { id: "sr-15", name: "Moutarde", hex: "#E6A004", image: require("../../assets/images/silicone-ronde/sr-15.png") },
  { id: "sr-16", name: "Ocre", hex: "#DC692A", image: require("../../assets/images/silicone-ronde/sr-16.png") },
  { id: "sr-17", name: "Chocolat", hex: "#39271A", image: require("../../assets/images/silicone-ronde/sr-17.png") },
  { id: "sr-18", name: "Brume bleu", hex: "#A3C8F4", image: require("../../assets/images/silicone-ronde/sr-18.png") },
  { id: "sr-19", name: "Saphir", hex: "#2976AF", image: require("../../assets/images/silicone-ronde/sr-19.png") },
  { id: "sr-20", name: "Glycine", hex: "#7CA4ED", image: require("../../assets/images/silicone-ronde/sr-20.png") },
  { id: "sr-21", name: "Orchidée", hex: "#C6B8CF", image: require("../../assets/images/silicone-ronde/sr-21.png") },
  { id: "sr-22", name: "Rose quartz", hex: "#F8BCB7", image: require("../../assets/images/silicone-ronde/sr-22.png") },
  { id: "sr-23", name: "Pêche", hex: "#E3AC91", image: require("../../assets/images/silicone-ronde/sr-23.png") },
  { id: "sr-24", name: "Terracotta", hex: "#B55049", image: require("../../assets/images/silicone-ronde/sr-24.png") },
  { id: "sr-25", name: "Rouge sombre", hex: "#722F2A", image: require("../../assets/images/silicone-ronde/sr-25.png") },
];

const ALL_IDS = SILICONE_COLORS.map((c) => c.id);

export type SiliconeVariant = {
  id: string;         // ex: "ronde-15"
  label: string;      // libellé du toggle
  shape: SiliconeShape;
  size: number;       // taille en mm
  availableColorIds: readonly string[];
};

export const SILICONE_VARIANTS: SiliconeVariant[] = [
  {
    id: "ronde-12",
    label: "12 mm",
    shape: "ronde",
    size: 12,
    availableColorIds: ALL_IDS,
  },
  {
    id: "ronde-15",
    label: "15 mm",
    shape: "ronde",
    size: 15,
    availableColorIds: ALL_IDS,
  },
  {
    id: "hexagone-14",
    label: "Hexa 14",
    shape: "hexagone",
    size: 14,
    availableColorIds: [
      "sr-01", "sr-02", "sr-03", "sr-06", "sr-07", "sr-10", "sr-11",
      "sr-13", "sr-15", "sr-17", "sr-18", "sr-22", "sr-23",
    ],
  },
  {
    id: "lentille-6",
    label: "Lentille",
    shape: "lentille",
    size: 6,
    availableColorIds: ["sr-01", "sr-13", "sr-07", "sr-23"],
  },
];

export const getColorById = (id: string) => SILICONE_COLORS.find((c) => c.id === id);
export const getVariantById = (id: string) => SILICONE_VARIANTS.find((v) => v.id === id);
