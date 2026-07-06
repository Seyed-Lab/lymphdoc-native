import { View, Text } from "react-native";
import DroppiMascot from "./DroppiMascot";

interface Props {
  show?: boolean;
  side?: "left" | "right";
  message: string;
}

/** Prof. Droppi speech-bubble hint, ported from the web component. */
const ProfDroppi = ({ show = true, side = "left", message }: Props) => {
  if (!show) return null;
  const reverse = side === "right";
  return (
    <View className={`flex-row items-end gap-2 ${reverse ? "flex-row-reverse" : ""}`}>
      <DroppiMascot variant="prof" size={56} />
      <View className="flex-1 bg-card rounded-2xl px-3 py-2" style={{ shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
        <Text className="text-[12px] font-semibold text-foreground leading-snug">{message}</Text>
      </View>
    </View>
  );
};

export default ProfDroppi;
