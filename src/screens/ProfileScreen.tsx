import { View, Text, ScrollView, Pressable, Switch, TextInput } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Award, Globe, Bell, Target, User as UserIcon } from "lucide-react-native";
import Ring from "@/components/Ring";
import BottomSheet from "@/components/BottomSheet";
import SegmentButtons from "@/components/SegmentButtons";
import { useI18n } from "@/lib/i18n";
import type { DroppiStore } from "@/lib/StoreContext";
import { colors } from "@/lib/theme";

const cardShadow = { elevation: 2, shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } as const;

const ProfileScreen = ({ store }: { store: DroppiStore }) => {
  const { t, lang, setLang } = useI18n();
  const insets = useSafeAreaInsets();
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [bodyOpen, setBodyOpen] = useState(false);
  const p = store.settings.profile;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="bg-card rounded-2xl p-4 mt-3" style={cardShadow}>
      <Text className="text-sm font-extrabold text-foreground mb-2">{title}</Text>
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-extrabold text-foreground">{t("Profil", "Profile")}</Text>

        {/* Level card */}
        <View className="bg-card rounded-2xl p-4 mt-4 flex-row items-center gap-4" style={cardShadow}>
          <Ring
            progress={store.levelProgress}
            content={
              <View className="items-center">
                <Award size={16} color={colors.primary} />
                <Text className="text-base font-extrabold text-foreground">{store.level}</Text>
              </View>
            }
          />
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-foreground">Level {store.level}</Text>
            <Text className="text-xs text-muted-foreground font-medium mt-0.5">
              {store.totalDrops} \ud83d\udca7 \u00b7 {store.totalDots} \u2b50 \u00b7 {store.streak} {t("Tage Serie", "day streak")}
            </Text>
            <Text className="text-[11px] text-muted-foreground font-medium mt-1">
              {store.dropsToNextLevel} \ud83d\udca7 {t("bis Level", "to level")} {store.level + 1}
            </Text>
          </View>
        </View>

        <Section title={t("Dein Setup", "Your setup")}>
          <Pressable onPress={() => setBodyOpen(true)} className="flex-row items-center gap-3 py-2">
            <UserIcon size={16} color={colors.primary} />
            <Text className="flex-1 text-xs font-bold text-foreground">{t("K\u00f6rperdaten", "Body data")}</Text>
            <Text className="text-xs font-extrabold text-primary">{store.bodyCompletion}%</Text>
          </Pressable>
          <Text className="text-[11px] text-muted-foreground font-medium">
            {t("Therapien", "Therapies")}: {[p.uses.compression && t("Kompression", "Compression"), p.uses.lymphDot && "LymphDot", p.uses.ipk && t("Pumpe", "Pump"), p.uses.mld && "MLD"].filter(Boolean).join(" \u00b7 ") || t("keine gew\u00e4hlt", "none selected")}
          </Text>
        </Section>

        <Section title={t("Tagesziele", "Daily goals")}>
          <Pressable onPress={() => setGoalsOpen(true)} className="flex-row items-center gap-3 py-1">
            <Target size={16} color={colors.droppiMint} />
            <Text className="flex-1 text-xs font-bold text-foreground">
              {store.settings.goals.daily.waterMl} ml \u00b7 {store.settings.goals.daily.breaks} {t("Pausen", "breaks")} \u00b7 {Math.round(store.settings.goals.daily.compressionMin / 60)}h {t("Kompression", "compression")}
            </Text>
            <Text className="text-xs font-extrabold text-primary">{t("\u00c4ndern", "Edit")}</Text>
          </Pressable>
        </Section>

        <Section title={t("Einstellungen", "Settings")}>
          <View className="flex-row items-center gap-3 py-2">
            <Bell size={16} color={colors.droppiWarm} />
            <Text className="flex-1 text-xs font-bold text-foreground">{t("Erinnerungen (20:30 Check-in)", "Reminders (20:30 check-in)")}</Text>
            <Switch
              value={p.remindersOptIn}
              onValueChange={(v) => store.updateProfile({ remindersOptIn: v })}
              trackColor={{ true: colors.primary, false: colors.muted }}
            />
          </View>
          <View className="flex-row items-center gap-3 py-2">
            <Globe size={16} color={colors.primary} />
            <Text className="flex-1 text-xs font-bold text-foreground">{t("Sprache", "Language")}</Text>
            <View className="flex-row rounded-full bg-muted p-0.5">
              {(["de", "en"] as const).map((l) => (
                <Pressable key={l} onPress={() => setLang(l)} className={`px-3 py-1 rounded-full ${lang === l ? "bg-card" : ""}`}>
                  <Text className={`text-xs font-bold ${lang === l ? "text-primary" : "text-muted-foreground"}`}>{l.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Section>
      </ScrollView>

      <GoalsSheet open={goalsOpen} onClose={() => setGoalsOpen(false)} store={store} />
      <BodyDataSheet open={bodyOpen} onClose={() => setBodyOpen(false)} store={store} />
    </View>
  );
};

const GoalsSheet = ({ open, onClose, store }: { open: boolean; onClose: () => void; store: DroppiStore }) => {
  const { t } = useI18n();
  const d = store.settings.goals.daily;
  return (
    <BottomSheet open={open} onClose={onClose} title={t("Tagesziele", "Daily goals")}>
      <Text className="text-xs font-bold text-foreground">{t("Wasser (ml)", "Water (ml)")}</Text>
      <SegmentButtons size="sm" cols={4} options={[1500, 2000, 2500, 3000].map((v) => ({ v, label: `${v}` }))} value={d.waterMl} onChange={(v) => store.updateDailyGoals({ waterMl: v })} />
      <Text className="text-xs font-bold text-foreground mt-3">{t("Pausen pro Tag", "Breaks per day")}</Text>
      <SegmentButtons size="sm" cols={4} options={[1, 2, 3, 4].map((v) => ({ v, label: `${v}` }))} value={d.breaks} onChange={(v) => store.updateDailyGoals({ breaks: v })} />
      <Text className="text-xs font-bold text-foreground mt-3">{t("Kompression (Std.)", "Compression (hrs)")}</Text>
      <SegmentButtons size="sm" cols={4} options={[4, 6, 8, 10].map((v) => ({ v: v * 60, label: `${v}h` }))} value={d.compressionMin} onChange={(v) => store.updateDailyGoals({ compressionMin: v })} />
      <View className="h-6" />
    </BottomSheet>
  );
};

const BodyDataSheet = ({ open, onClose, store }: { open: boolean; onClose: () => void; store: DroppiStore }) => {
  const { t } = useI18n();
  const p = store.settings.profile;
  const [diagnosis, setDiagnosis] = useState(p.diagnosis ?? "");

  const NumField = ({ label, value, onSave }: { label: string; value: number | undefined; onSave: (n: number | undefined) => void }) => {
    const [txt, setTxt] = useState(value ? String(value) : "");
    return (
      <View className="flex-row items-center justify-between bg-muted rounded-xl px-3 py-2 mt-2">
        <Text className="text-xs font-bold text-foreground">{label}</Text>
        <TextInput
          keyboardType="number-pad"
          value={txt}
          onChangeText={setTxt}
          onEndEditing={() => onSave(txt ? Number(txt) : undefined)}
          className="w-20 text-right text-sm font-bold text-foreground"
          placeholder="\u2013"
          placeholderTextColor={colors.mutedForeground}
        />
      </View>
    );
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("K\u00f6rperdaten", "Body data")}>
      <Text className="text-xs font-bold text-foreground">{t("Geschlecht", "Sex")}</Text>
      <SegmentButtons
        size="sm"
        options={[
          { v: "female" as const, label: t("weiblich", "female") },
          { v: "male" as const, label: t("m\u00e4nnlich", "male") },
          { v: "diverse" as const, label: t("divers", "diverse") },
        ]}
        value={p.sex}
        onChange={(v) => store.updateProfile({ sex: v })}
      />
      <NumField label={t("Alter", "Age")} value={p.age} onSave={(n) => store.updateProfile({ age: n })} />
      <NumField label={t("Gr\u00f6\u00dfe (cm)", "Height (cm)")} value={p.heightCm} onSave={(n) => store.updateProfile({ heightCm: n })} />
      <NumField label={t("Gewicht (kg)", "Weight (kg)")} value={p.weightKg} onSave={(n) => store.updateProfile({ weightKg: n })} />
      <NumField label={t("Diagnosejahr", "Diagnosis year")} value={p.diagnosisYear} onSave={(n) => store.updateProfile({ diagnosisYear: n })} />
      <Text className="text-xs font-bold text-foreground mt-3">{t("Diagnose", "Diagnosis")}</Text>
      <TextInput
        value={diagnosis}
        onChangeText={setDiagnosis}
        onEndEditing={() => store.updateProfile({ diagnosis: diagnosis.trim() || undefined })}
        placeholder={t("z. B. Lip\u00f6dem Stadium II", "e.g. lipedema stage II")}
        placeholderTextColor={colors.mutedForeground}
        className="bg-muted rounded-xl px-3 py-2.5 text-sm font-bold text-foreground mt-1"
      />
      <View className="h-6" />
    </BottomSheet>
  );
};

export default ProfileScreen;
