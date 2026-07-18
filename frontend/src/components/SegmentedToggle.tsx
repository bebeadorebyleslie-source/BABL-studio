import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type SegmentedOption<T extends string | number> = {
  value: T;
  label: string;
};

type Props<T extends string | number> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
};

export default function SegmentedToggle<T extends string | number>({
  options,
  value,
  onChange,
  testID,
}: Props<T>) {
  return (
    <View style={styles.container} testID={testID}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            testID={`${testID ?? "segment"}-${opt.value}`}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.85}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
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
    padding: 3,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    fontSize: 12,
    fontWeight: "500",
    color: "#a99a86",
  },
  labelActive: {
    color: "#5a4b3c",
    fontWeight: "600",
  },
});
