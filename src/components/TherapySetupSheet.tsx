import { View, Text, Pressable } from "react-native";
import BottomSheet from "./BottomSheet";
import DroppiMascot from "./DroppiMascot";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/lib/theme";

export type TherapyKind = "compression" | "pump" | "lymphdot" | "mld";

interface Props {
  kind: TherapyKind | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** Pre-session confirmation sheet, ported (condensed) from web TherapySetupSheet. */
const TherapySetupSheet = ({ kind, onClose, onConfirm }: Props) => {
  const { t } = useI18n();
  if (!kind) return null;

  const content: Record<TherapyKind, { title: string; hint: string }> = {
    compression: {
      title: t("Kompression starten", "Start compression"),
      hint: t("Zieh deine Versorgung an \u2014 der Timer l\u00e4uft, bis du stoppst.", "Put on your garment \u2014 the timer runs until you stop."),
    },
    pump: {
      title: t("Pumpe starten", "Start pump"),
      hint: t("Mach es dir bequem. Empfohlen: 30\u201360 Minuten.", "Get comfortable. Recommended: 30\u201360 minutes."),
    },
    lymphdot: {
      title: t("LymphDot starten", "Start LymphDot"),
      hint: t("Dot entlang der gro\u00dfen Lymphbahnen platzieren. Ab 20 Minuten gibt es einen \u2b50.", "Place the dot along major lymph routes. 20+ minutes earns a \u2b50."),
    },
    mld: {
      title: t("Lymphdrainage", "Manual lymph drainage"),
      hint: t("MLD-Sitzungen tr\u00e4gst du \u00fcber \u201eLog\u201c ein \u2014 w\u00e4hle Dauer und Anzahl.", "Log MLD sessions via \u201eLog\u201c \u2014 pick duration and count."),
    },
  };

  const isMld = kind === "mld";

  return (
    <BottomSheet open={!!kind} onClose={onClose} title={content[kind].title}>
      <View className="items-center">
        <DroppiMascot variant="happy" size={72} />
        <Text className="text-sm font-medium text-foreground text-center mt-3 leading-snug">{content[kind].hint}</Text>
      </View>
      {!isMld && (
        <Pressable onPress={onConfirm} className="mt-5 py-3 rounded-xl items-center" style={{ backgroundColor: colors.primary }}>
          <Text className="text-sm font-extrabold text-white">{t("Jetzt starten", "Start now")}</Text>
        </Pressable>
      )}
      <Pressable onPress={onClose} className="mt-2 py-3 rounded-xl items-center bg-muted">
        <Text className="text-sm font-bold text-muted-foreground">{isMld ? t("Verstanden", "Got it") : t("Abbrechen", "Cancel")}</Text>
      </Pressable>
      <View className="h-4" />
    </BottomSheet>
  );
};

export default TherapySetupSheet;
