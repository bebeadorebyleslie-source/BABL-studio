export type SiliconeRondeColor = {
  id: string;
  name: string;
  image: number; // ImageSourcePropType (via require)
};

// 25 perles silicone ronde — images issues du visuel produit fourni.
// Ordre : ligne 1 (8 perles), ligne 2 (9 perles), ligne 3 (8 perles).
// Disponibles en 2 tailles : 12 mm et 15 mm.
export const SILICONE_RONDE_COLORS: SiliconeRondeColor[] = [
  { id: "sr-01", name: "Blanc", image: require("../../assets/images/silicone-ronde/sr-01.png") },
  { id: "sr-02", name: "Terrazzo", image: require("../../assets/images/silicone-ronde/sr-02.png") },
  { id: "sr-03", name: "Marbre gris", image: require("../../assets/images/silicone-ronde/sr-03.png") },
  { id: "sr-04", name: "Marbre nacre", image: require("../../assets/images/silicone-ronde/sr-04.png") },
  { id: "sr-05", name: "Gris", image: require("../../assets/images/silicone-ronde/sr-05.png") },
  { id: "sr-06", name: "Ardoise", image: require("../../assets/images/silicone-ronde/sr-06.png") },
  { id: "sr-07", name: "Beige", image: require("../../assets/images/silicone-ronde/sr-07.png") },
  { id: "sr-08", name: "Bois marron", image: require("../../assets/images/silicone-ronde/sr-08.png") },
  { id: "sr-09", name: "Menthe pâle", image: require("../../assets/images/silicone-ronde/sr-09.png") },
  { id: "sr-10", name: "Menthe", image: require("../../assets/images/silicone-ronde/sr-10.png") },
  { id: "sr-11", name: "Sarcelle", image: require("../../assets/images/silicone-ronde/sr-11.png") },
  { id: "sr-12", name: "Olive", image: require("../../assets/images/silicone-ronde/sr-12.png") },
  { id: "sr-13", name: "Sauge", image: require("../../assets/images/silicone-ronde/sr-13.png") },
  { id: "sr-14", name: "Jaune", image: require("../../assets/images/silicone-ronde/sr-14.png") },
  { id: "sr-15", name: "Moutarde", image: require("../../assets/images/silicone-ronde/sr-15.png") },
  { id: "sr-16", name: "Orange", image: require("../../assets/images/silicone-ronde/sr-16.png") },
  { id: "sr-17", name: "Chocolat", image: require("../../assets/images/silicone-ronde/sr-17.png") },
  { id: "sr-18", name: "Bleu ciel", image: require("../../assets/images/silicone-ronde/sr-18.png") },
  { id: "sr-19", name: "Bleu vif", image: require("../../assets/images/silicone-ronde/sr-19.png") },
  { id: "sr-20", name: "Bleuet", image: require("../../assets/images/silicone-ronde/sr-20.png") },
  { id: "sr-21", name: "Lavande", image: require("../../assets/images/silicone-ronde/sr-21.png") },
  { id: "sr-22", name: "Rose pâle", image: require("../../assets/images/silicone-ronde/sr-22.png") },
  { id: "sr-23", name: "Nude", image: require("../../assets/images/silicone-ronde/sr-23.png") },
  { id: "sr-24", name: "Terracotta", image: require("../../assets/images/silicone-ronde/sr-24.png") },
  { id: "sr-25", name: "Bordeaux", image: require("../../assets/images/silicone-ronde/sr-25.png") },
];

export const SILICONE_RONDE_SIZES = [12, 15] as const;
export type SiliconeRondeSize = (typeof SILICONE_RONDE_SIZES)[number];
