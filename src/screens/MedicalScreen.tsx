import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FileText, Stethoscope, Send, Ruler, Activity } from "lucide-react-native";
import ProfDroppi from "@/components/ProfDroppi";
import { useI18n } from "@/lib/i18n";
import { visibleRegions } from "@/lib/store";
import type { DroppiStore } from "@/lib/StoreContext";
import { colors } from "@/lib/theme";

const cardShadow = { elevation: 2, shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } as const;

/**
 * v1 Medical hub: findings overview built from real logged data.
 * The full guided anamnesis (AI voice, photo measurement, paid report transmission)
 * from the web MedicalScreen follows in the next milestone \u2014 see README roadmap.
 */
const MedicalScreen = ({ store }: { store: DroppiStore }) => {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const days = store.getDays(30);
  const symptomCount = days.reduce((s, d) => s + d.symptomEntries.length, 0);
  const measurementCount = days.reduce((s, d) => s + d.measurementEntries.length, 0);
  const checkinCount = days.reduce((s, d) => s + d.checkins.length, 0);
  const careMinutes = days.reduce(
    (s, d) =>
      s +
      d.compressionSessions.reduce((x, c) => x + c.minutes, 0) +
      d.lymphDotSessions.reduce((x, c) => x + c.minutes, 0) +
      d.ipkSessions.reduce((x, c) => x + c.minutes, 0) +
      d.mldSessions.reduce((x, c) => x + c.minutes, 0),
    0,
  );
  const p = store.settings.profile;
  const regions = visibleRegions(p);

  const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View className="flex-row items-center gap-3 py-2">
      {icon}
      <Text className="flex-1 text-xs font-bold text-foreground">{label}</Text>
      <Text className="text-xs font-extrabold text-primary">{value}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-extrabold text-foreground">{t("Medizin", "Medical")}</Text>
      <Text className="text-xs text-muted-foreground font-medium mt-1">
        {t("Dein Befund-Bereich \u2014 alles f\u00fcr \u00c4rztin und Krankenkasse.", "Your findings hub \u2014 everything for doctor and insurer.")}
      </Text>

      <View className="mt-4">
        <ProfDroppi
          message={t(
            "Alles, was du in K\u00f6rper und Home dokumentierst, sammle ich hier f\u00fcr deinen Bericht.",
            "Everything you log in Body and Home is collected here for your report.",
          )}
        />
      </View>

      <View className="bg-card rounded-2xl p-4 mt-4" style={cardShadow}>
        <Text className="text-sm font-extrabold text-foreground mb-1">{t("Befundlage \u00b7 30 Tage", "Findings \u00b7 30 days")}</Text>
        <Row icon={<Activity size={16} color={colors.droppiRose} />} label={t("Symptom-Eintr\u00e4ge", "Symptom entries")} value={String(symptomCount)} />
        <Row icon={<Ruler size={16} color={colors.droppiMint} />} label={t("Umfangsmessungen", "Measurements")} value={String(measurementCount)} />
        <Row icon={<Stethoscope size={16} color={colors.primary} />} label={t("Check-ins", "Check-ins")} value={String(checkinCount)} />
        <Row icon={<FileText size={16} color={colors.droppiLavender} />} label={t("Therapie dokumentiert", "Care documented")} value={`${Math.round(careMinutes / 60)}h`} />
      </View>

      <View className="bg-card rounded-2xl p-4 mt-3" style={cardShadow}>
        <Text className="text-sm font-extrabold text-foreground">{t("Dein Profil f\u00fcr den Bericht", "Your report profile")}</Text>
        <Text className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
          {t("Betroffen", "Affected")}: {regions.length} {t("Region(en)", "region(s)")}
          {p.lipedemaStage ? ` \u00b7 ${t("Lip\u00f6dem Stadium", "Lipedema stage")} ${p.lipedemaStage}` : ""}
          {p.diagnosis ? ` \u00b7 ${p.diagnosis}` : ""}
        </Text>
        {store.missingBodyFields.length > 0 && (
          <Text className="text-[11px] text-muted-foreground font-medium mt-2">
            {t("Noch offen", "Still missing")}: {store.missingBodyFields.join(", ")} \u2014 {t("im Profil erg\u00e4nzen.", "add these in your profile.")}
          </Text>
        )}
      </View>

      <Pressable className="rounded-2xl p-4 mt-3 flex-row items-center gap-3" style={[{ backgroundColor: colors.primary }, cardShadow]}>
        <Send size={18} color="#fff" />
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-white">{t("Bericht an \u00c4rztin senden", "Send report to a doctor")}</Text>
          <Text className="text-[11px] text-white/80 font-medium">{t("Kommt im n\u00e4chsten Update \u2014 inkl. PDF-Export.", "Coming in the next update \u2014 incl. PDF export.")}</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
};

export default MedicalScreen;
