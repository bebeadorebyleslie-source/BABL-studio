import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  return (
    <View style={styles.header}>
      {/* Menu hamburger */}
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#5a4b3c" />
      </TouchableOpacity>

      {/* Logo BABL Studio */}
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Icône favoris */}
      <TouchableOpacity style={styles.favoritesButton}>
        <Ionicons name="heart-outline" size={24} color="#5a4b3c" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 40,
    width: 140,
  },
  favoritesButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
