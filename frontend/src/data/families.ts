import { MaterialCommunityIcons } from "@expo/vector-icons";

export type Family = {
  id: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  iconBg: string;
};

export const FAMILIES: Family[] = [
  {
    id: "perles-silicone",
    title: "Perles Silicone",
    subtitle: "Ronde, hexagone, lentille",
    iconName: "circle",
    iconColor: "#c48a5c",
    iconBg: "#f6ecdf",
  },
  {
    id: "crochet",
    title: "Crochet",
    subtitle: "16 mm, 14 couleurs",
    iconName: "circle-double",
    iconColor: "#b98c74",
    iconBg: "#f3e8dc",
  },
  {
    id: "perles-bois",
    title: "Perles en bois",
    subtitle: "Hêtre naturel, 5 formes",
    iconName: "tree",
    iconColor: "#8a6b48",
    iconBg: "#efe4d1",
  },
  {
    id: "formes",
    title: "Formes",
    subtitle: "Animaux, étoiles, nuages",
    iconName: "star-four-points",
    iconColor: "#c9a24e",
    iconBg: "#f7efdc",
  },
  {
    id: "lettres",
    title: "Lettres",
    subtitle: "Alphabet complet",
    iconName: "alphabetical-variant",
    iconColor: "#7a8ba8",
    iconBg: "#e9edf3",
  },
];
