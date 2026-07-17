import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type CategoryCardProps = {
  id: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  iconBg: string;
  selected: boolean;
  onPress: () => void;
};

export default function CategoryCard({
  id,
  title,
  subtitle,
  iconName,
  iconColor,
  iconBg,
  selected,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      testID={`category-card-${id}`}
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={iconName} size={26} color={iconColor} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#f2ede4",
  },
  cardSelected: {
    borderColor: "#d4a574",
    backgroundColor: "#faf5eb",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5a4b3c",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#a99a86",
  },
});
