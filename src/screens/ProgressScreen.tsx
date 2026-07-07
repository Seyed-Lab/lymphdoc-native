import { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Droplets, Clock, Flame, CheckCircle2 } from "lucide-react-native";
import { useI18n } from "@/lib/i18n";
import type { DroppiStore } from "@/lib/StoreContext";
import { colors } from "@/lib/theme";

const cardShadow = { elevation: 2, shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } as const;

const Bars = ({ values, color, max }: { values: number[]; color: string; max?: number }) => {
  const top = max ?? Math.max(1, ...values);
  return (
    <View className="flex-row items-end gap-1 h-16 mt-2">
      {values.map((v, i) => (
        <View key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.max(4, (v / top) * 100)}%`, backgroundColor: v > 0 ? color : colors.muted }} />
      ))}
    </View>
  );
};

const ProgressScreen = ({ store }: { store: DroppiStore }) => {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const days = useMemo(() => store.getDays(14), [store]);

  const stats = useMemo(() => {
    const active = days.filter((d) => store.isDayCompleted(d)).length;
    const totalCare = days.reduce(
      (s, d) =>
        s +
        d.compressionSessions.reduce((x, c) => x + c.minutes, 0) +
        d.lymphDotSessions.reduce((x, c) => x + c.minutes, 0) +
        d.ipkSessions.reduce((x, c) => x + c.minutes, 0) +
        d.mldSessions.reduce((x, c) => x + c.minutes, 0),
      0,
    );
    const totalWater = days.reduce((s, d) => s + d.waterEntries.reduce((x, w) => x + w.ml, 0), 0);
    const checkins = days.reduce((s, d) => s + d.checkins.length, 0);
    return { active, totalCare, totalWater, checkins };
  }, [days, store]);

  const careMinutes = days.map((d) =>
    d.compressionSessions.reduce((x, c) => x + c.minutes, 0) +
    d.lymphDotSessions.reduce((x, c) => x + c.minutes, 0) +
    d.ipkSessions.reduce((x, c) => x + c.minutes, 0) +
    d.mldSessions.reduce((x, c) => x + c.minutes, 0),
  );
  const waterMl = days.map((d) => d.waterEntries.reduce((x, w) => x + w.ml, 0));
  const symptomAvg = days.map((d) => {
    const c = d.checkins[d.checkins.length - 1];
    if (!c) return 0;
    const nums = [c.heaviness, c.pain, c.tension].filter((v): v is number => typeof v === "number");
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  });

  const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View className="flex-1 bg-card rounded-2xl p-3 items-center" style={cardShadow}>
      {icon}
      <Text className="text-base font-extrabold text-foreground mt-1">{value}</Text>
      <Text className="text-[10px] text-muted-foreground font-medium text-center">{label}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-extrabold text-foreground">{t("Verlauf", "Progress")}</Text>
      <Text className="text-xs text-muted-foreground font-medium mt-1">{t("Deine letzten 14 Tage", "Your last 14 days")}</Text>

      <View className="flex-row gap-2 mt-5">
        <StatCard icon={<CheckCircle2 size={18} color={colors.droppiMint} />} label={t("aktive Tage", "active days")} value={`${stats.active}/14`} />
        <StatCard icon={<Clock size={18} color={colors.primary} />} label={t("Therapie gesamt", "total care")} value={`${Math.round(stats.totalCare / 60)}h`} />
        <StatCard icon={<Droplets size={18} color={colors.primary} />} label={t("Wasser gesamt", "total water")} value={`${(stats.totalWater / 1000).toFixed(1)}l`} />
        <StatCard icon={<Flame size={18} color={colors.droppiWarm} />} label={t("Serie", "streak")} value={`${store.streak}`} />
      </View>

      <View className="bg-card rounded-2xl p-4 mt-4" style={cardShadow}>
        <Text className="text-sm font-extrabold text-foreground">{t("Symptome (\u00d8 Check-in)", "Symptoms (avg check-in)")}</Text>
        <Bars values={symptomAvg} color={colors.droppiRose} max={10} />
      </View>
      <View className="bg-card rounded-2xl p-4 mt-3" style={cardShadow}>
        <Text className="text-sm font-extrabold text-foreground">{t("Therapie-Minuten", "Care minutes")}</Text>
        <Bars values={careMinutes} color={colors.primary} />
      </View>
      <View className="bg-card rounded-2xl p-4 mt-3" style={cardShadow}>
        <Text className="text-sm font-extrabold text-foreground">{t("Wasser (ml)", "Water (ml)")}</Text>
        <Bars values={waterMl} color={colors.droppiMint} max={Math.max(store.settings.waterGoalMl, ...waterMl)} />
      </View>

      <View className="bg-card rounded-2xl p-4 mt-3" style={cardShadow}>
        <Text className="text-sm font-extrabold text-foreground">{t("Check-ins", "Check-ins")}</Text>
        <Text className="text-xs text-muted-foreground font-medium mt-1">
          {stats.checkins} {t("in 14 Tagen \u2014 regelm\u00e4\u00dfige Eintr\u00e4ge machen deinen Bericht f\u00fcr \u00c4rztinnen und Krankenkasse aussagekr\u00e4ftig.", "in 14 days \u2014 regular entries make your report meaningful for doctors and insurers.")}
        </Text>
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;
