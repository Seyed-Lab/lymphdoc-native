import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet from "./BottomSheet";
import DroppiMascot from "./DroppiMascot";
import { useI18n } from "@/lib/i18n";
import type { DroppiStore } from "@/lib/StoreContext";
import { colors } from "@/lib/theme";

interface Props {
  open: boolean;
  onClose: () => void;
  store: DroppiStore;
  onSaved?: () => void;
}

/** Evening Daily-Check: which therapies were done today. Ported from web DailyCheckCard. */
const DailyCheckSheet = ({ open, onClose, store, onSaved }: Props) => {
  const { t } = useI18n();
  const [compression, setCompression] = useState(false);
  const [exercises, setExercises] = useState(false);
  const [pump, setPump] = useState(false);
  const [lymphDot, setLymphDot] = useState(false);

  const items = [
    { label: t("Kompression getragen", "Wore compression"), value: compression, set: setCompression },
    { label: t("\u00dcbungen gemacht", "Did exercises"), value: exercises, set: setExercises },
    { label: t("Pumpe genutzt", "Used the pump"), value: pump, set: setPump },
    { label: "LymphDot", value: lymphDot, set: setLymphDot },
  ];

  const save = () => {
    store.addDailyCheck({ compression, exercises, pump, lymphDot });
    onClose();
    onSaved?.();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("Daily-Check", "Daily-Check")}>
      <View className="items-center">
        <DroppiMascot variant="clipboard" size={64} />
        <Text className="text-sm font-bold text-foreground mt-2">{t("Was hast du heute geschafft?", "What did you do today?")}</Text>
      </View>
      <View className="mt-4 gap-2">
        {items.map((i) => (
          <Pressable
            key={i.label}
            onPress={() => i.set(!i.value)}
            className={`flex-row items-center justify-between px-4 py-3 rounded-xl ${i.value ? "bg-droppi-mint-light" : "bg-muted"}`}
          >
            <Text className={`text-sm font-bold ${i.value ? "text-foreground" : "text-muted-foreground"}`}>{i.label}</Text>
            <Text className="text-base">{i.value ? "\u2705" : "\u2b55"}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={save} className="mt-5 py-3 rounded-xl items-center" style={{ backgroundColor: colors.primary }}>
        <Text className="text-sm font-extrabold text-white">{t("Speichern (+5 \ud83d\udca7)", "Save (+5 \ud83d\udca7)")}</Text>
      </Pressable>
      <View className="h-4" />
    </BottomSheet>
  );
};

export default DailyCheckSheet;
