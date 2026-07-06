import { View, Text, Pressable } from "react-native";

interface Option<T extends string | number> {
  v: T;
  label: string;
}

interface Props<T extends string | number> {
  options: Option<T>[];
  value: T | undefined;
  onChange: (v: T) => void;
  cols?: number;
  size?: "sm" | "lg";
}

/** Grid of pill buttons — replaces the web OptionGrid / small segmented selectors. */
function SegmentButtons<T extends string | number>({ options, value, onChange, cols = 3, size = "lg" }: Props<T>) {
  return (
    <View className="flex-row flex-wrap -m-1 mt-4">
      {options.map((o) => {
        const on = value === o.v;
        return (
          <View key={String(o.v)} style={{ width: `${100 / cols}%` }} className="p-1">
            <Pressable
              onPress={() => onChange(o.v)}
              className={`${size === "lg" ? "py-4" : "py-2"} rounded-xl items-center justify-center ${on ? "bg-droppi-sky-light" : "bg-muted"}`}
            >
              <Text className={`text-sm font-bold ${on ? "text-primary" : "text-muted-foreground"}`}>{o.label}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export default SegmentButtons;
