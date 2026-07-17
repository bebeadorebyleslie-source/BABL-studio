import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props<T extends number> = {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  unit?: string;
  testID?: string;
};

export default function SizeToggle<T extends number>({
  options,
  value,
  onChange,
  unit = "mm",
  testID,
}: Props<T>) {
  return (
    <View style={styles.container} testID={testID}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={String(opt)}
            testID={`${testID ?? "size"}-${opt}`}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.85}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt} {unit}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f5efe4",
    borderRadius: 999,
    padding: 4,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#a99a86",
  },
  labelActive: {
    color: "#5a4b3c",
    fontWeight: "600",
  },
});
