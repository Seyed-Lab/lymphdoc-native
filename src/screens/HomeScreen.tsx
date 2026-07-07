import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Droplets, Wind, Zap, Clock, Flame, Award, Sparkles, Plus, Play, Stethoscope, Check, Heart, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import DroppiMascot from "@/components/DroppiMascot";
import Ring from "@/components/Ring";
import CheerPopup from "@/components/CheerPopup";
import BottomSheet from "@/components/BottomSheet";
import SegmentButtons from "@/components/SegmentButtons";
import DailyCheckinSheet from "@/components/DailyCheckinSheet";
import DailyCheckSheet from "@/components/DailyCheckSheet";
import TherapySetupSheet, { type TherapyKind } from "@/components/TherapySetupSheet";
import { useI18n } from "@/lib/i18n";
import { syncEveningReminder } from "@/lib/notifications";
import { compressionDropsForMinutes, ipkDropsForMinutes } from "@/lib/store";
import type { DroppiStore } from "@/lib/StoreContext";
import { colors } from "@/lib/theme";

const CHEER: Record<"compression" | "lymphdot" | "pump" | "mld", string[]> = {
  compression: [
    "Super, so hältst du die Beine in Form!",
    "Compression on — your vessels say thank you.",
    "Steady pressure, smoother flow. Nice!",
  ],
  lymphdot: [
    "LymphDot logged — pumping boosted!",
    "Tiny dot, huge effect. Keep it up!",
    "Documented and done — proud of you.",
  ],
  pump: [
    "Pump session logged. Lymph is moving!",
    "Gentle waves, big results. Lovely!",
    "Your tissues are getting the spa treatment.",
  ],
  mld: [
    "Beautiful work — your lymph thanks you!",
    "Gentle hands, big impact. Keep going!",
    "Slow strokes, strong results. Well done!",
  ],
};
const pickCheer = (k: keyof typeof CHEER) => CHEER[k][Math.floor(Math.random() * CHEER[k].length)];

const cardShadow = { elevation: 2, shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } as const;

interface Props {
  store: DroppiStore;
}

const HomeScreen = ({ store }: Props) => {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [cheer, setCheer] = useState<{ text: string; key: number } | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [dailyCheckOpen, setDailyCheckOpen] = useState(false);
  const [therapySetup, setTherapySetup] = useState<TherapyKind | null>(null);
  const [logKind, setLogKind] = useState<TherapyKind | null>(null);

  // Active session timers
  const [activeKind, setActiveKind] = useState<Exclude<TherapyKind, "mld"> | null>(null);
  const startRef = useRef<number | null>(null);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!activeKind) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [activeKind]);

  // Break timer
  const [breakActive, setBreakActive] = useState(false);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(0);
  const breakTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakCancelled = useRef(false);

  // Keep the 20:30 native reminder in sync with the opt-in
  useEffect(() => {
    syncEveningReminder(store.settings.profile.remindersOptIn);
  }, [store.settings.profile.remindersOptIn]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 1800);
  };
  const triggerCheer = useCallback((k: keyof typeof CHEER) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCheer({ text: pickCheer(k), key: Date.now() });
  }, []);

  // ---- Break flow (breathing overlay) ----
  const completeBreak = useCallback(() => {
    if (breakTimer.current) clearInterval(breakTimer.current);
    breakTimer.current = null;
    setBreakActive(false);
    setBreakSecondsLeft(0);
    if (!breakCancelled.current) {
      store.addBreak();
      showFeedback(t("Pause geschafft! +5 💧", "Break complete! +5 💧"));
    }
  }, [store, t]);

  const toggleBreak = () => {
    if (breakActive) {
      breakCancelled.current = true;
      const elapsed = store.settings.breakDurationSeconds - breakSecondsLeft;
      if (breakTimer.current) clearInterval(breakTimer.current);
      breakTimer.current = null;
      setBreakActive(false);
      setBreakSecondsLeft(0);
      store.cancelBreak(elapsed);
      return;
    }
    breakCancelled.current = false;
    const duration = store.settings.breakDurationSeconds;
    setBreakSecondsLeft(duration);
    setBreakActive(true);
    breakTimer.current = setInterval(() => {
      setBreakSecondsLeft((prev) => {
        if (prev <= 1) {
          completeBreak();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  useEffect(() => () => { if (breakTimer.current) clearInterval(breakTimer.current); }, []);

  // ---- Therapy session flow ----
  const startSession = (kind: Exclude<TherapyKind, "mld">) => {
    setActiveKind(kind);
    startRef.current = Date.now();
  };
  const stopSession = () => {
    if (!activeKind || !startRef.current) return;
    const elapsedMin = Math.floor((Date.now() - startRef.current) / 60000);
    const kind = activeKind;
    setActiveKind(null);
    startRef.current = null;
    if (elapsedMin <= 0) return;
    if (kind === "lymphdot") {
      const r = store.applyAction({ type: "lymphDotSession", minutes: elapsedMin, mode: store.settings.lymphDotDefaultMode });
      showFeedback(`${elapsedMin} min · +${r.drops} 💧${r.dots ? ` · +${r.dots} ⭐` : ""}`);
      triggerCheer("lymphdot");
    } else if (kind === "compression") {
      const r = store.applyAction({ type: "compressionSession", minutes: elapsedMin });
      showFeedback(`${elapsedMin} min · ${r.drops > 0 ? `+${r.drops} 💧` : t("noch kein neuer Block", "no new block yet")}`);
      triggerCheer("compression");
    } else {
      const r = store.applyAction({ type: "ipkSession", minutes: elapsedMin });
      showFeedback(`${elapsedMin} min · +${r.drops} 💧`);
      triggerCheer("pump");
    }
  };
  const handleCardPress = (kind: TherapyKind) => {
    if (kind !== "mld" && activeKind === kind) stopSession();
    else if (kind === "mld") setTherapySetup("mld");
    else if (activeKind) showFeedback(t("Erst die laufende Session stoppen.", "Stop the running session first."));
    else setTherapySetup(kind);
  };

  const liveSec = activeKind && startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0;
  const fmtElapsed = (s: number) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
  };

  // ---- Derived display data ----
  const now = new Date();
  const minutesOfDay = now.getHours() * 60 + now.getMinutes();
  const eveningMode = minutesOfDay >= 18 * 60;
  const checkDone = eveningMode ? store.dailyCheckDoneToday : store.checkinDoneToday;
  const waterPct = Math.min(100, store.waterProgress);
  const breakPct = breakActive
    ? ((store.settings.breakDurationSeconds - breakSecondsLeft) / store.settings.breakDurationSeconds) * 100
    : Math.min(100, (store.todayData.breaksTaken / 3) * 100);

  const compressionDropsToday = compressionDropsForMinutes(store.todayData.compressionMinutes);
  const lymphDotMinutesToday = store.todayData.lymphDotSessions.reduce((s, x) => s + x.minutes, 0);
  const pumpMinutesToday = store.todayData.ipkSessions.reduce((s, x) => s + x.minutes, 0);
  const pumpDropsToday = ipkDropsForMinutes(pumpMinutesToday);
  const mldSessionsToday = store.todayData.mldSessions.length;

  const openCheckin = () => {
    if (checkDone) return;
    if (eveningMode) setDailyCheckOpen(true);
    else setCheckinOpen(true);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header: check-in bar + reward chips */}
        <View className="flex-row items-stretch justify-between gap-2">
          <Pressable
            onPress={openCheckin}
            disabled={checkDone}
            className="flex-1 rounded-2xl px-2.5 py-1.5 flex-row items-center gap-2"
            style={{ backgroundColor: checkDone ? "hsl(140, 50%, 92%)" : "hsl(140, 60%, 86%)" }}
          >
            <View className="w-7 h-7 rounded-full bg-white/70 items-center justify-center">
              {checkDone ? <Check size={16} color={colors.droppiMint} strokeWidth={3} /> : eveningMode ? <Clock size={16} color={colors.foreground} /> : <Stethoscope size={16} color={colors.foreground} />}
            </View>
            <View className="flex-1">
              <Text className="text-[12px] font-extrabold text-foreground" numberOfLines={1}>
                {eveningMode ? "Daily-Check" : "Quick Check-in"}
              </Text>
              <Text className="text-[10px] text-foreground/70 font-medium" numberOfLines={1}>
                {checkDone ? t("Erledigt ✓", "Done ✓") : eveningMode ? t("Therapie · 10 Sek.", "Therapy · 10 sec") : t("10 Sek. · jetzt", "10 sec · tap")}
              </Text>
            </View>
          </Pressable>
          <View className="flex-row items-center gap-1">
            <View className="flex-row items-center gap-1 bg-droppi-sky-light px-2 py-1 rounded-full">
              <Award size={12} color={colors.primary} />
              <Text className="text-[11px] font-bold text-foreground">{store.totalDrops}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-droppi-lavender-light px-2 py-1 rounded-full">
              <Sparkles size={12} color={colors.droppiLavender} />
              <Text className="text-[11px] font-bold text-foreground">{store.totalDots}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-droppi-peach-light px-2 py-1 rounded-full">
              <Flame size={12} color={colors.droppiWarm} />
              <Text className="text-[11px] font-bold text-foreground">{store.streak}</Text>
            </View>
          </View>
        </View>

        {feedbackMsg && (
          <Text className="text-center text-sm font-bold text-primary mt-3">{feedbackMsg}</Text>
        )}

        {/* Rings: Level / Water / Break */}
        <View className="flex-row justify-between mt-5">
          <View className="items-center gap-1.5">
            <Ring
              progress={store.levelProgress}
              content={
                <View className="items-center">
                  <Award size={16} color={colors.primary} />
                  <Text className="text-base font-extrabold text-foreground">{store.level}</Text>
                </View>
              }
            />
            <Text className="text-[11px] font-bold text-foreground">Level</Text>
            <Text className="text-[10px] text-muted-foreground font-medium -mt-1">
              {store.dropsToNextLevel} {t("bis nächstes", "to next")}
            </Text>
          </View>

          <View className="items-center gap-1.5">
            <Pressable onPress={() => { store.addWater(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); }}>
              <Ring
                progress={waterPct}
                content={
                  <View className="items-center">
                    <Droplets size={16} color={colors.primary} />
                    <Text className="text-[10px] font-bold text-foreground">+{store.settings.waterGlassMl}</Text>
                    <Plus size={12} color={colors.primary} />
                  </View>
                }
              />
            </Pressable>
            <Text className="text-[11px] font-bold text-foreground">{t("Wasser", "Water")}</Text>
            <Text className="text-[10px] text-muted-foreground font-medium -mt-1">
              {store.todayData.waterMl}/{store.settings.waterGoalMl} ml
            </Text>
          </View>

          <View className="items-center gap-1.5">
            <Pressable onPress={toggleBreak}>
              <Ring
                progress={breakPct}
                content={
                  <View className="items-center">
                    <Wind size={16} color={colors.primary} />
                    <Play size={12} color={colors.primary} fill={colors.primary} />
                  </View>
                }
              />
            </Pressable>
            <Text className="text-[11px] font-bold text-foreground">{t("Pause", "Break")}</Text>
            <Text className="text-[10px] text-muted-foreground font-medium -mt-1">
              {store.todayData.breaksTaken} {t("erledigt", "done")}
            </Text>
          </View>
        </View>

        {/* Therapy cards */}
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-6 mb-1">
          {t("Therapie", "Care tools")}
        </Text>

        <TherapyCard
          title="LymphDot"
          subtitle={activeKind === "lymphdot" ? t("Sitzung läuft", "Session in progress") : t("Smarte Lymphtherapie", "Smart lymph care")}
          icon={<Zap size={22} color="#fff" />}
          active={activeKind === "lymphdot"}
          liveLabel={fmtElapsed(liveSec)}
          drops={lymphDotMinutesToday}
          onPress={() => handleCardPress("lymphdot")}
          onLog={() => setLogKind("lymphdot")}
        />
        <TherapyCard
          title={t("Kompression", "Compression")}
          subtitle={activeKind === "compression" ? t("Wird getragen", "Wearing now") : t("Tägliche Unterstützung", "Daily support garment")}
          icon={<Clock size={22} color="#fff" />}
          active={activeKind === "compression"}
          liveLabel={fmtElapsed(liveSec)}
          drops={compressionDropsToday}
          onPress={() => handleCardPress("compression")}
          onLog={() => setLogKind("compression")}
        />
        <TherapyCard
          title={t("Pumpe", "Pump")}
          subtitle={activeKind === "pump" ? t("Sitzung läuft", "Session in progress") : t("Pneumatische Kompression", "Pneumatic compression")}
          icon={<Heart size={22} color="#fff" />}
          active={activeKind === "pump"}
          liveLabel={fmtElapsed(liveSec)}
          drops={pumpDropsToday}
          onPress={() => handleCardPress("pump")}
          onLog={() => setLogKind("pump")}
        />
        <TherapyCard
          title={t("Lymphdrainage", "Manual lymph drainage")}
          subtitle={mldSessionsToday > 0 ? `${mldSessionsToday} ${t("heute", "today")}` : t("Manuelle Lymphdrainage", "By your therapist")}
          icon={<Sparkles size={22} color="#fff" />}
          drops={mldSessionsToday > 0 ? 10 : 0}
          onPress={() => handleCardPress("mld")}
          onLog={() => setLogKind("mld")}
        />
      </ScrollView>

      {/* Overlays & sheets */}
      {cheer && <CheerPopup key={cheer.key} text={cheer.text} onDone={() => setCheer(null)} />}

      <Modal visible={breakActive} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-background/95 px-6">
          <Pressable onPress={toggleBreak} className="absolute top-16 right-6 w-10 h-10 rounded-full bg-card items-center justify-center" style={cardShadow}>
            <X size={20} color={colors.mutedForeground} />
          </Pressable>
          <Ring
            size={220}
            stroke={8}
            progress={((store.settings.breakDurationSeconds - breakSecondsLeft) / store.settings.breakDurationSeconds) * 100}
            content={<DroppiMascot variant="happy" size={128} />}
          />
          <Text className="mt-6 text-sm font-bold text-foreground">Breathe with Droppi</Text>
          <Text className="text-xs text-muted-foreground font-medium mt-1">
            {breakSecondsLeft}s · {t("Tippe × zum Abbrechen", "tap × to cancel")}
          </Text>
        </View>
      </Modal>

      <DailyCheckinSheet open={checkinOpen} onClose={() => setCheckinOpen(false)} store={store} onSaved={() => triggerCheer("mld")} />
      <DailyCheckSheet open={dailyCheckOpen} onClose={() => setDailyCheckOpen(false)} store={store} onSaved={() => triggerCheer("mld")} />
      <TherapySetupSheet
        kind={therapySetup}
        onClose={() => setTherapySetup(null)}
        onConfirm={() => {
          const k = therapySetup;
          setTherapySetup(null);
          if (k && k !== "mld") startSession(k);
        }}
      />
      <ManualLogSheet
        kind={logKind}
        onClose={() => setLogKind(null)}
        store={store}
        onLogged={(k) => triggerCheer(k === "lymphdot" ? "lymphdot" : k === "pump" ? "pump" : k === "mld" ? "mld" : "compression")}
      />
    </View>
  );
};

// ===== Therapy card =====
const TherapyCard = ({
  title, subtitle, icon, active, liveLabel, drops, onPress, onLog,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  active?: boolean;
  liveLabel?: string;
  drops?: number;
  onPress: () => void;
  onLog: () => void;
}) => (
  <View
    className="rounded-3xl p-5 mt-3"
    style={[{ backgroundColor: active ? "hsl(199, 89%, 62%)" : "hsl(219, 85%, 72%)" }, cardShadow]}
  >
    <View className="flex-row items-center gap-4">
      <Pressable onPress={onPress} className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
        {active ? <Text className="text-sm font-extrabold text-white">{liveLabel}</Text> : icon}
      </Pressable>
      <View className="flex-1">
        <Text className="text-base font-extrabold text-white">{title}</Text>
        <Text className="text-[11px] text-white/80 font-medium">{subtitle}</Text>
        {active && (
          <View className="self-start mt-1 bg-white/25 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] font-bold text-white">LIVE · tap to stop</Text>
          </View>
        )}
      </View>
      <View className="items-end gap-1.5">
        {typeof drops === "number" && (
          <View className="flex-row items-center gap-1 bg-white/25 rounded-full px-2 py-0.5">
            <Droplets size={12} color="#fff" />
            <Text className="text-[11px] font-extrabold text-white">{drops}</Text>
          </View>
        )}
        <Pressable onPress={onLog} className="h-6 px-2.5 rounded-full bg-white items-center justify-center">
          <Text className="text-[10px] font-extrabold text-primary uppercase">Log</Text>
        </Pressable>
      </View>
    </View>
  </View>
);

// ===== Manual log sheet =====
const ManualLogSheet = ({
  kind, onClose, store, onLogged,
}: {
  kind: TherapyKind | null;
  onClose: () => void;
  store: DroppiStore;
  onLogged: (k: TherapyKind) => void;
}) => {
  const { t } = useI18n();
  const [minutes, setMinutes] = useState<number>(30);
  const [sessions, setSessions] = useState<number>(1);
  if (!kind) return null;

  const durations = kind === "mld" ? [30, 45, 60] : kind === "compression" ? [30, 60, 120, 240, 480] : [15, 20, 30, 45, 60];

  const submit = () => {
    if (kind === "compression") {
      store.addCompressionMinutes(minutes);
    } else if (kind === "lymphdot") {
      for (let i = 0; i < sessions; i++) store.addLymphDotMinutes(minutes);
    } else if (kind === "pump") {
      for (let i = 0; i < sessions; i++) store.addIPKMinutes(minutes);
    } else {
      for (let i = 0; i < sessions; i++) store.addMLDSession(minutes as 30 | 45 | 60);
    }
    onClose();
    onLogged(kind);
  };

  return (
    <BottomSheet open={!!kind} onClose={onClose} title={t("Manuell eintragen", "Manual entry")}>
      <Text className="text-xs font-bold text-foreground">{t("Dauer (Minuten)", "Duration (minutes)")}</Text>
      <SegmentButtons size="sm" cols={durations.length > 4 ? 5 : durations.length} options={durations.map((d) => ({ v: d, label: `${d}m` }))} value={minutes} onChange={setMinutes} />
      {kind !== "compression" && (
        <>
          <Text className="text-xs font-bold text-foreground mt-3">{t("Anzahl Sitzungen", "Sessions")}</Text>
          <SegmentButtons size="sm" cols={5} options={[1, 2, 3, 4, 5].map((n) => ({ v: n, label: `×${n}` }))} value={sessions} onChange={setSessions} />
        </>
      )}
      <Pressable onPress={submit} className="mt-5 py-3 rounded-xl items-center" style={{ backgroundColor: colors.primary }}>
        <Text className="text-sm font-extrabold text-white">{t("Eintragen", "Log it")}</Text>
      </Pressable>
      <View className="h-4" />
    </BottomSheet>
  );
};

export default HomeScreen;
