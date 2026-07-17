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
    id: "silicone-ronde",
    title: "Silicone ronde",
    subtitle: "25 couleurs disponibles",
    iconName: "circle",
    iconColor: "#c48a5c",
    iconBg: "#f6ecdf",
  },
  {
    id: "silicone-hexagonale",
    title: "Silicone hexagonale",
    subtitle: "Perles à facettes",
    iconName: "hexagon",
    iconColor: "#8a9b73",
    iconBg: "#eef1e6",
  },
  {
    id: "crochet",
    title: "Crochet",
    subtitle: "Perles crochetées",
    iconName: "circle-double",
    iconColor: "#b98c74",
    iconBg: "#f3e8dc",
  },
  {
    id: "bois-ronde",
    title: "Bois ronde",
    subtitle: "Perles naturelles",
    iconName: "tree",
    iconColor: "#8a6b48",
    iconBg: "#efe4d1",
  },
  {
    id: "bois-hexagonale",
    title: "Bois hexagonale",
    subtitle: "Bois à facettes",
    iconName: "hexagon-outline",
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
