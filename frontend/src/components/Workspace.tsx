import { View, Image, StyleSheet } from "react-native";
import composition from "../data/composition";
import { MM } from "../constants/sizes";

export default function Workspace() {
  return (
    <View style={styles.workspace}>
      <View style={styles.centerAxis}>
        
        {/* Clip */}
        <Image
          source={require("../../assets/images/clip.png")}
          style={styles.clip}
          resizeMode="contain"
        />

        {/* Gabarit (Template) */}
        <View style={styles.template}>
          <View style={styles.beadsStack}>
            {composition.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.bead,
                  {
                    width: item.size * MM,
                    height: item.size * MM,
                    backgroundColor: item.color,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Boucle (Loop) */}
        <Image
          source={require("../../assets/images/loop.png")}
          style={styles.loop}
          resizeMode="contain"
        />
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  workspace: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  centerAxis: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  clip: {
    width: 180,
    height: 180,
  },
  template: {
    width: 72,
    height: 620,
    borderWidth: 2,
    borderColor: "#d4a574",
    borderRadius: 20,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: -18,
  },
  beadsStack: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 18,
  },
  bead: {
    borderRadius: 1000, // Très grand pour garantir un cercle parfait
    borderWidth: 2,
    borderColor: "white",
  },
  loop: {
    width: 140,
    height: 140,
    marginTop: -8,
  },
});
