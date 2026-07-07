import { useEffect } from "react";
import { View, Text, Modal } from "react-native";
import Animated, { ZoomIn, FadeIn } from "react-native-reanimated";
import DroppiMascot from "./DroppiMascot";

interface Props {
  text: string;
  onDone: () => void;
}

/** Droppi celebration overlay after a logged session (web CheerPopup). */
const CheerPopup = ({ text, onDone }: Props) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <Modal transparent visible animationType="fade">
      <View className="flex-1 items-center justify-center" pointerEvents="none">
        <Animated.View entering={ZoomIn.springify().damping(10)}>
          <DroppiMascot variant="celebrate" size={128} />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(250)} className="mt-3 bg-card rounded-2xl px-4 py-2 max-w-[260px]" style={{ elevation: 4, shadowColor: "#141a2a", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
          <Text className="text-sm font-extrabold text-foreground text-center">{text}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CheerPopup;
