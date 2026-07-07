import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ruler, Activity } from "lucide-react-native";
import BottomSheet from "@/components/BottomSheet";
import SegmentButtons from "@/components/SegmentButtons";
import Ring from "@/components/Ring";
import { useI18n } from "@/lib/i18n";
import { visibleRegions, MEASUREMENT_POINTS, REGION_LABEL, type BodyRegion, type SymptomLevel } from "@/lib/store";
import type { DroppiStore } from "@/lib/StoreContext";
import { colors } from "@/lib/theme";

const cardShadow = { elevation: 2, shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } as const;

const REGION_DE: Record<BodyRegion, string> = {
  leftArm: "Linker Arm", rightArm: "Rechter Arm", leftLeg: "Linkes Bein", rightLeg: "Rechtes Bein",
};

const BodyScreen = ({ store }: { store: DroppiStore }) => {
  const { t, lang } = useI18n();
  const insets = useSafeAreaInsets();
  const [symptomRegion, setSymptomRegion] = useState<BodyRegion | null>(null);
  const [measureRegion, setMeasureRegion] = useState<BodyRegion | null>(null);

  const regions = visibleRegions(store.settings.profile);
  const regionLabel = (r: BodyRegion) => (lang === "de" ? REGION_DE[r] : REGION_LABEL[r]);

  const todaySymptoms = store.todayData.symptomEntries.length;
  const todayMeasurements = store.todayData.measurementEntries.length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold text-foreground">{t("K\u00f6rper", "Body")}</Text>
          <Ring
            size={56}
            stroke={5}
            progress={store.bodyCompletion}
            content={<Text className="text-[11px] font-extrabold text-foreground">{store.bodyCompletion}%</Text>}
          />
        </View>
        <Text className="text-xs text-muted-foreground font-medium mt-1">
          {t("Symptome und Umf\u00e4nge je Region dokumentieren.", "Document symptoms and circumferences per region.")}
        </Text>

        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-6 mb-2">{t("Deine Regionen", "Your regions")}</Text>
        <View className="gap-2">
          {regions.map((r) => (
            <View key={r} className="bg-card rounded-2xl p-4" style={cardShadow}>
              <Text className="text-sm font-extrabold text-foreground">{regionLabel(r)}</Text>
              <View className="flex-row gap-2 mt-3">
                <Pressable onPress={() => setSymptomRegion(r)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-droppi-sky-light">
                  <Activity size={14} color={colors.primary} />
                  <Text className="text-xs font-bold text-primary">{t("Symptome", "Symptoms")}</Text>
                </Pressable>
                <Pressable onPress={() => setMeasureRegion(r)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-droppi-mint-light">
                  <Ruler size={14} color={colors.droppiMint} />
                  <Text className="text-xs font-bold" style={{ color: colors.droppiMint }}>{t("Umfang", "Measure")}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-card rounded-2xl p-4 mt-4" style={cardShadow}>
          <Text className="text-xs font-bold text-muted-foreground uppercase">{t("Heute erfasst", "Captured today")}</Text>
          <Text className="text-sm font-bold text-foreground mt-1">
            {todaySymptoms} {t("Symptom-Eintr\u00e4ge", "symptom entries")} \u00b7 {todayMeasurements} {t("Messungen", "measurements")}
          </Text>
        </View>
      </ScrollView>

      <SymptomSheet region={symptomRegion} label={symptomRegion ? regionLabel(symptomRegion) : ""} onClose={() => setSymptomRegion(null)} store={store} />
      <MeasureSheet region={measureRegion} label={measureRegion ? regionLabel(measureRegion) : ""} onClose={() => setMeasureRegion(null)} store={store} />
    </View>
  );
};

const LEVELS: { v: SymptomLevel; de: string; en: string }[] = [
  { v: "none", de: "Keins", en: "None" },
  { v: "mild", de: "Leicht", en: "Mild" },
  { v: "moderate", de: "Mittel", en: "Moderate" },
  { v: "strong", de: "Stark", en: "Strong" },
];

const SymptomSheet = ({ region, label, onClose, store }: { region: BodyRegion | null; label: string; onClose: () => void; store: DroppiStore }) => {
  const { t } = useI18n();
  const [heaviness, setHeaviness] = useState<SymptomLevel>("mild");
  const [pain, setPain] = useState<SymptomLevel>("none");
  const [note, setNote] = useState("");
  if (!region) return null;

  const save = () => {
    store.addSymptom({ region, heaviness, pain, note: note.trim() || undefined });
    setNote("");
    onClose();
  };

  return (
    <BottomSheet open={!!region} onClose={onClose} title={`${t("Symptome", "Symptoms")} \u00b7 ${label}`}>
      <Text className="text-xs font-bold text-foreground">{t("Schweregef\u00fchl", "Heaviness")}</Text>
      <SegmentButtons size="sm" cols={4} options={LEVELS.map((l) => ({ v: l.v, label: t(l.de, l.en) }))} value={heaviness} onChange={setHeaviness} />
      <Text className="text-xs font-bold text-foreground mt-3">{t("Schmerz", "Pain")}</Text>
      <SegmentButtons size="sm" cols={4} options={LEVELS.map((l) => ({ v: l.v, label: t(l.de, l.en) }))} value={pain} onChange={setPain} />
      <Text className="text-xs font-bold text-foreground mt-3">{t("Notiz (optional)", "Note (optional)")}</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder={t("z. B. abends st\u00e4rker", "e.g. worse in the evening")}
        placeholderTextColor={colors.mutedForeground}
        className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground mt-1"
        multiline
      />
      <Pressable onPress={save} className="mt-5 py-3 rounded-xl items-center" style={{ backgroundColor: colors.primary }}>
        <Text className="text-sm font-extrabold text-white">{t("Speichern", "Save")}</Text>
      </Pressable>
      <View className="h-4" />
    </BottomSheet>
  );
};

const MeasureSheet = ({ region, label, onClose, store }: { region: BodyRegion | null; label: string; onClose: () => void; store: DroppiStore }) => {
  const { t } = useI18n();
  const [point, setPoint] = useState<string>("");
  const [cm, setCm] = useState<string>("");
  if (!region) return null;
  const points = MEASUREMENT_POINTS[region];
  const activePoint = point || points[0];

  const save = () => {
    const value = Number(cm.replace(",", "."));
    if (!value || value <= 0) return;
    store.addMeasurement({ region, point: activePoint, cm: value });
    setCm("");
    onClose();
  };

  return (
    <BottomSheet open={!!region} onClose={onClose} title={`${t("Umfang", "Measurement")} \u00b7 ${label}`}>
      <Text className="text-xs font-bold text-foreground">{t("Messpunkt", "Point")}</Text>
      <SegmentButtons size="sm" cols={3} options={points.map((p) => ({ v: p, label: p }))} value={activePoint} onChange={setPoint} />
      <Text className="text-xs font-bold text-foreground mt-3">{t("Umfang in cm", "Circumference in cm")}</Text>
      <TextInput
        value={cm}
        onChangeText={setCm}
        keyboardType="decimal-pad"
        placeholder="32.5"
        placeholderTextColor={colors.mutedForeground}
        className="bg-muted rounded-xl px-3 py-2.5 text-sm font-bold text-foreground mt-1"
      />
      <Pressable onPress={save} className="mt-5 py-3 rounded-xl items-center" style={{ backgroundColor: colors.primary }}>
        <Text className="text-sm font-extrabold text-white">{t("Speichern", "Save")}</Text>
      </Pressable>
      <View className="h-4" />
    </BottomSheet>
  );
};

export default BodyScreen;
