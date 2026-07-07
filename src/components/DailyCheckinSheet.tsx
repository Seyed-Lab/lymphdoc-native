import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet from "./BottomSheet";
import SegmentButtons from "./SegmentButtons";
import DroppiMascot from "./DroppiMascot";
import { useI18n } from "@/lib/i18n";
import type { DroppiStore } from "@/lib/StoreContext";
import type { Mood } from "@/lib/store";
import { colors } from "@/lib/theme";

const MOODS: { v: Exclude<Mood, null>; emoji: string; de: string; en: string }[] = [
  { v: "bad", emoji: "\ud83d\ude23", de: "Schlecht", en: "Bad" },
  { v: "low", emoji: "\ud83d\ude14", de: "M\u00e4\u00dfig", en: "Low" },
  { v: "okay", emoji: "\ud83d\ude10", de: "Okay", en: "Okay" },
  { v: "good", emoji: "\ud83d\ude42", de: "Gut", en: "Good" },
  { v: "great", emoji: "\ud83d\ude04", de: "Super", en: "Great" },
];

const Scale010 = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <View className="mt-3">
    <View className="flex-row justify-between mb-1">
      <Text className="text-xs font-bold text-foreground">{label}</Text>
      <Text className="text-xs font-extrabold text-primary">{value}</Text>
    </View>
    <View className="flex-row gap-1">
      {Array.from({ length: 11 }, (_, i) => (
        <Pressable
          key={i}
          onPress={() => onChange(i)}
          className={`flex-1 h-8 rounded-md items-center justify-center ${i <= value ? "bg-droppi-sky-light" : "bg-muted"}`}
        >
          <Text className={`text-[10px] font-bold ${i <= value ? "text-primary" : "text-muted-foreground"}`}>{i}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

interface Props {
  open: boolean;
  onClose: () => void;
  store: DroppiStore;
  onSaved?: () => void;
}

/** Morning quick check-in: mood + 0\u201310 symptom scales. Ported from web DailyCheckinSheet. */
const DailyCheckinSheet = ({ open, onClose, store, onSaved }: Props) => {
  const { t } = useI18n();
  const [mood, setMood] = useState<Exclude<Mood, null>>("okay");
  const [heaviness, setHeaviness] = useState(3);
  const [pain, setPain] = useState(2);
  const [tension, setTension] = useState(3);

  const save = () => {
    store.addCheckin({ mood, heaviness, pain, tension });
    onClose();
    onSaved?.();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("Quick Check-in", "Quick Check-in")}>
      <View className="items-center">
        <DroppiMascot variant="happy" size={64} />
        <Text className="text-sm font-bold text-foreground mt-2">{t("Wie f\u00fchlst du dich?", "How are you feeling?")}</Text>
      </View>
      <View className="flex-row justify-between mt-3">
        {MOODS.map((m) => (
          <Pressable key={m.v} onPress={() => setMood(m.v)} className={`items-center px-2 py-2 rounded-xl ${mood === m.v ? "bg-droppi-sky-light" : ""}`}>
            <Text className="text-2xl">{m.emoji}</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${mood === m.v ? "text-primary" : "text-muted-foreground"}`}>{t(m.de, m.en)}</Text>
          </Pressable>
        ))}
      </View>
      <Scale010 label={t("Schweregef\u00fchl", "Heaviness")} value={heaviness} onChange={setHeaviness} />
      <Scale010 label={t("Schmerz", "Pain")} value={pain} onChange={setPain} />
      <Scale010 label={t("Spannungsgef\u00fchl", "Tension")} value={tension} onChange={setTension} />
      <Pressable onPress={save} className="mt-5 py-3 rounded-xl items-center" style={{ backgroundColor: colors.primary }}>
        <Text className="text-sm font-extrabold text-white">{t("Speichern (+5 \ud83d\udca7)", "Save (+5 \ud83d\udca7)")}</Text>
      </Pressable>
      <View className="h-4" />
    </BottomSheet>
  );
};

export default DailyCheckinSheet;
