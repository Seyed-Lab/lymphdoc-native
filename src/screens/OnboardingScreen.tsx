import { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Image, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeOut, ZoomIn } from "react-native-reanimated";
import { ArrowRight, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import DroppiMascot from "@/components/DroppiMascot";
import ProfDroppi from "@/components/ProfDroppi";
import PressableScale from "@/components/PressableScale";
import SegmentButtons from "@/components/SegmentButtons";
import { useSessionState, type GoalKey, type BodyArea, type BodySide } from "@/lib/store";
import type { DroppiStore } from "@/lib/StoreContext";
import { useI18n } from "@/lib/i18n";
import { GOALS, GOAL_BY_KEY } from "@/lib/goalContent";
import { colors } from "@/lib/theme";

interface Props {
  store: DroppiStore;
  onDone: (primaryGoal?: GoalKey) => void;
}

type StepKey =
  | "welcome"
  | "goal"
  | "goalInfo"
  | "kkInfo"
  | "details"
  | "shopHype"
  | "pairing"
  | "area"
  | "side"
  | "tools"
  | "reminders";

type T = (de: string, en: string) => string;

const cardShadow = { elevation: 2, shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } as const;

const OnboardingScreen = ({ store, onDone }: Props) => {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const p = store.settings.profile;

  // Session-persisted progress (survives remounts within the app session).
  const [stepIdx, setStepIdx] = useSessionState<number>("ld.ob.step", 0);
  const [goals, setGoals] = useSessionState<GoalKey[]>("ld.ob.goals", p.goals ?? []);
  const [reminders, setReminders] = useSessionState<boolean>("ld.ob.reminders", p.remindersOptIn ?? true);
  const [area, setArea] = useSessionState<BodyArea | undefined>("ld.ob.area", p.area);
  const [side, setSide] = useSessionState<BodySide | undefined>("ld.ob.side", p.side);
  const [uses, setUses] = useSessionState("ld.ob.uses", p.uses ?? { compression: false, lymphDot: false, ipk: false, mld: false });
  const [sex, setSex] = useSessionState<"female" | "male" | "diverse" | undefined>("ld.ob.sex", p.sex);
  const [age, setAge] = useSessionState<number | "">("ld.ob.age", p.age ?? "");
  const [heightCm, setHeightCm] = useSessionState<number | "">("ld.ob.height", p.heightCm ?? "");
  const [weightKg, setWeightKg] = useSessionState<number | "">("ld.ob.weight", p.weightKg ?? "");
  const [stage, setStage] = useSessionState<1 | 2 | 3 | undefined>("ld.ob.stage", p.lipedemaStage);

  const primary: GoalKey | undefined = goals[0];

  const steps: StepKey[] = useMemo(() => {
    const out: StepKey[] = ["welcome", "goal"];
    switch (primary) {
      case "A": out.push("goalInfo"); break;
      case "B": out.push("goalInfo"); break;
      case "C": out.push("kkInfo", "details"); break;
      case "D": out.push("shopHype"); break;
      case "E": out.push("goalInfo"); break;
      case "F": out.push("pairing"); break;
      default: break;
    }
    out.push("area", "side", "tools", "reminders");
    return out;
  }, [primary]);

  const step = steps[Math.min(stepIdx, steps.length - 1)];

  const toggleGoal = (g: GoalKey) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));
  const toggleUse = (k: keyof typeof uses) => setUses((u) => ({ ...u, [k]: !u[k] }));

  const back = () => setStepIdx((s) => Math.max(0, s - 1));
  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setStepIdx((s) => Math.min(steps.length - 1, s + 1));
  };

  const canContinue: boolean = (() => {
    if (step === "goal") return goals.length > 0;
    if (step === "area") return !!area;
    if (step === "side") return !!side;
    if (step === "details") return !!sex && !!age && !!heightCm && !!weightKg && !!stage;
    return true;
  })();

  const finish = () => {
    const usesPatch = { ...uses };
    if (primary === "F") usesPatch.lymphDot = true;
    if (primary === "C") {
      usesPatch.compression = true;
      usesPatch.mld = true;
    }
    const finalArea: BodyArea = area ?? p.area ?? "both";
    const finalSide: BodySide = side ?? p.side ?? "both";

    store.updateSettings({
      profile: {
        ...store.settings.profile,
        area: finalArea,
        side: finalSide,
        uses: usesPatch,
        goals,
        primaryGoal: primary,
        remindersOptIn: reminders,
        onboarded: true,
        ...(primary === "C"
          ? {
              sex,
              age: typeof age === "number" ? age : undefined,
              heightCm: typeof heightCm === "number" ? heightCm : undefined,
              weightKg: typeof weightKg === "number" ? weightKg : undefined,
              lipedemaStage: stage,
            }
          : {}),
      },
      reminders: {
        ...store.settings.reminders,
        water: reminders,
        breaks: reminders,
        compression: reminders && usesPatch.compression,
        lymphDot: reminders && usesPatch.lymphDot,
      },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onDone(primary);
  };

  const handleCta = () => {
    if (step === "reminders") finish();
    else next();
  };

  const ctaLabel = step === "reminders" ? t("Fertig", "All set") : t("Weiter", "Continue");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <View className="flex-1 px-5" style={{ paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) }}>
        {/* Progress bar */}
        <View className="flex-row gap-1.5 mb-4">
          {steps.map((_, i) => (
            <View key={i} className={`h-1 flex-1 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-border"}`} />
          ))}
        </View>

        <Animated.View key={step + stepIdx} entering={FadeInDown.duration(220)} exiting={FadeOut.duration(120)} className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {step === "welcome" && <Welcome t={t} />}
            {step === "goal" && <GoalPicker t={t} goals={goals} onToggle={toggleGoal} />}
            {step === "goalInfo" && primary && <GoalInfo goal={primary} t={t} />}
            {step === "kkInfo" && <KKInfoCard t={t} />}
            {step === "details" && (
              <DetailsForm
                t={t}
                sex={sex} setSex={setSex}
                age={age} setAge={setAge}
                heightCm={heightCm} setHeightCm={setHeightCm}
                weightKg={weightKg} setWeightKg={setWeightKg}
                stage={stage} setStage={setStage}
              />
            )}
            {step === "shopHype" && <ShopHype t={t} />}
            {step === "pairing" && <PairingMock t={t} />}
            {step === "area" && <AreaPicker t={t} value={area} onChange={setArea} />}
            {step === "side" && <SidePicker t={t} value={side} onChange={setSide} />}
            {step === "tools" && <ToolsPicker t={t} uses={uses} onToggle={toggleUse} />}
            {step === "reminders" && <Reminders t={t} value={reminders} onChange={setReminders} />}
          </ScrollView>

          <View className="flex-row gap-2 mt-4">
            {stepIdx > 0 && (
              <PressableScale onPress={back}>
                <View className="px-4 py-3 rounded-xl bg-muted">
                  <Text className="font-bold text-sm text-muted-foreground">{t("Zurück", "Back")}</Text>
                </View>
              </PressableScale>
            )}
            <PressableScale onPress={handleCta} disabled={!canContinue} style={{ flex: 1 }}>
              <View
                className={`py-3 rounded-xl flex-row items-center justify-center gap-2 ${canContinue ? "" : "opacity-60"}`}
                style={{ backgroundColor: canContinue ? colors.primary : colors.muted }}
              >
                <Text className={`font-bold text-sm ${canContinue ? "text-white" : "text-muted-foreground"}`}>{ctaLabel}</Text>
                <ArrowRight size={16} color={canContinue ? "#fff" : colors.mutedForeground} />
              </View>
            </PressableScale>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

// =========================================================
// Step components
// =========================================================

const Welcome = ({ t }: { t: T }) => (
  <View className="items-center">
    <Animated.View entering={ZoomIn.springify().damping(12)}>
      <DroppiMascot variant="happy" size={110} />
    </Animated.View>
    <Text className="text-2xl font-extrabold text-foreground mt-4 text-center">{t("Hi, ich bin Droppi", "Hi, I'm Droppi")}</Text>
    <Text className="text-sm text-muted-foreground font-medium mt-2 text-center max-w-[280px]">
      {t(
        "Lass uns kurz herausfinden, was du brauchst — dauert weniger als eine Minute.",
        "Let's quickly figure out what you need — under a minute.",
      )}
    </Text>
  </View>
);

const GoalPicker = ({ t, goals, onToggle }: { t: T; goals: GoalKey[]; onToggle: (g: GoalKey) => void }) => (
  <View>
    <Text className="text-xl font-extrabold text-foreground text-center">
      {t("Wofür möchtest du LymphDoc nutzen?", "What will you use LymphDoc for?")}
    </Text>
    <Text className="text-[11px] text-muted-foreground font-medium text-center mt-1">
      {t("Mehrfachauswahl · das Erste ist dein Hauptziel.", "Multi-select · your first pick is the main goal.")}
    </Text>
    <View className="mt-3 gap-2">
      {GOALS.map((g, i) => {
        const on = goals.includes(g.key);
        const idx = goals.indexOf(g.key);
        const fromLeft = i % 2 === 0;
        return (
          <Animated.View key={g.key} entering={FadeInDown.delay(50 * i).duration(250)}>
            <Pressable
              onPress={() => onToggle(g.key)}
              className={`rounded-2xl px-2 py-2 flex-row items-center gap-3 ${fromLeft ? "" : "flex-row-reverse"}`}
              style={{
                backgroundColor: g.tint,
                borderWidth: on ? 2 : 1,
                borderColor: on ? colors.primary : "rgba(0,0,0,0.06)",
              }}
            >
              <Image source={g.image} style={{ width: 52, height: 52, resizeMode: "contain" }} />
              <View className="flex-1">
                <Text className={`text-sm font-extrabold text-foreground ${fromLeft ? "text-left" : "text-right"}`}>
                  {t(g.labelDe, g.labelEn)}
                </Text>
                <Text className={`text-[10.5px] text-muted-foreground font-medium mt-0.5 ${fromLeft ? "text-left" : "text-right"}`} numberOfLines={2}>
                  {t(g.descDe, g.descEn)}
                </Text>
              </View>
              {on && idx === 0 && (
                <View className="absolute top-1.5 right-2 bg-primary px-1.5 py-0.5 rounded-full">
                  <Text className="text-[8.5px] font-extrabold text-white uppercase">{t("Haupt", "Main")}</Text>
                </View>
              )}
              {on && idx > 0 && (
                <View className="absolute top-1.5 right-2 w-4 h-4 rounded-full bg-primary items-center justify-center">
                  <Check size={10} color="#fff" strokeWidth={3} />
                </View>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  </View>
);

const GoalInfo = ({ goal, t }: { goal: GoalKey; t: T }) => {
  const g = GOAL_BY_KEY[goal];
  const messages: Record<GoalKey, { de: string; en: string }> = {
    A: {
      de: "Ich helfe dir, einen begründeten Verdacht festzuhalten — und du kannst ihn direkt an eine Fachärztin senden lassen.",
      en: "I'll help you capture a well-founded suspicion — and you can send it straight to a specialist.",
    },
    B: {
      de: "Ich erkläre dir in kleinen Bildern, was bei Lipödem und Lymphödem im Gewebe passiert.",
      en: "I'll show you in small pictures what happens in the tissue with lipedema and lymphedema.",
    },
    C: { de: "", en: "" },
    D: { de: "", en: "" },
    E: {
      de: "Cool, dann geb ich dir gleich eine kurze Tour durch die wichtigsten Funktionen.",
      en: "Cool, I'll give you a short tour of the core features in a moment.",
    },
    F: { de: "", en: "" },
  };
  return (
    <View className="items-center">
      <View className="w-40 h-40 rounded-full items-center justify-center overflow-hidden" style={{ backgroundColor: g.tint }}>
        <Animated.View entering={ZoomIn.springify().damping(10)}>
          <Image source={g.image} style={{ width: 128, height: 128, resizeMode: "contain" }} />
        </Animated.View>
      </View>
      <Text className="text-lg font-extrabold text-foreground mt-4">{t(g.labelDe, g.labelEn)}</Text>
      <Text className="text-sm font-medium text-foreground mt-3 text-center max-w-[280px] leading-snug">
        {t(messages[goal].de, messages[goal].en)}
      </Text>
    </View>
  );
};

const KKInfoCard = ({ t }: { t: T }) => (
  <View>
    <Text className="text-lg font-extrabold text-foreground text-center">
      {t("Kostenübernahme Liposuktion", "Insurance — liposuction cover")}
    </Text>
    <Text className="text-xs text-muted-foreground text-center font-medium mt-1">
      {t("Was du sammeln musst — kurz erklärt.", "What you need to collect — in short.")}
    </Text>
    <View className="mt-5 gap-3">
      <ProfDroppi
        side="left"
        message={t(
          "Lipödem Stadium III gilt aktuell als regelhaft erstattungsfähig — Stadium I/II nur in Einzelfällen.",
          "Stage III lipedema is generally eligible — stage I/II only in individual cases.",
        )}
      />
      <View className="bg-card rounded-xl p-3 gap-2" style={cardShadow}>
        <Text className="text-xs text-foreground font-medium">✅ {t("6–12 Monate dokumentierte konservative Therapie (Kompression, MLD, Bewegung).", "6–12 months documented conservative therapy (compression, MLD, movement).")}</Text>
        <Text className="text-xs text-foreground font-medium">✅ {t("BMI < 35 (in vielen Fällen)", "BMI < 35 (in many cases)")}</Text>
        <Text className="text-xs text-foreground font-medium">✅ {t("Ärztliches Gutachten + Befundbericht.", "Medical assessment + findings report.")}</Text>
        <Text className="text-xs text-foreground font-medium">✅ {t("Vordrucke der Krankenkasse (z. B. MDK-Antrag).", "Insurance forms (e.g. MDK application).")}</Text>
        <Text className="text-xs text-muted-foreground font-medium">
          {t("LymphDoc hilft dir, die Doku lückenlos zu führen.", "LymphDoc helps you keep the documentation complete.")}
        </Text>
      </View>
    </View>
  </View>
);

const DetailsForm = ({
  t, sex, setSex, age, setAge, heightCm, setHeightCm, weightKg, setWeightKg, stage, setStage,
}: {
  t: T;
  sex: "female" | "male" | "diverse" | undefined; setSex: (v: "female" | "male" | "diverse") => void;
  age: number | ""; setAge: (v: number | "") => void;
  heightCm: number | ""; setHeightCm: (v: number | "") => void;
  weightKg: number | ""; setWeightKg: (v: number | "") => void;
  stage: 1 | 2 | 3 | undefined; setStage: (v: 1 | 2 | 3) => void;
}) => (
  <View>
    <Text className="text-lg font-extrabold text-foreground text-center">{t("Ein paar Eckdaten", "A few basics")}</Text>
    <Text className="text-xs text-muted-foreground font-medium text-center mt-1">
      {t("Damit dein Bericht und Verlauf aussagekräftig sind.", "So your report and history make sense.")}
    </Text>
    <View className="mt-5 gap-3">
      <View>
        <Text className="text-xs font-bold text-foreground mb-1.5">{t("Geschlecht", "Sex")}</Text>
        <SegmentButtons
          size="sm"
          options={[
            { v: "female" as const, label: t("weiblich", "female") },
            { v: "male" as const, label: t("männlich", "male") },
            { v: "diverse" as const, label: t("divers", "diverse") },
          ]}
          value={sex}
          onChange={setSex}
        />
      </View>
      <View>
        <Text className="text-xs font-bold text-foreground mb-1.5">{t("Lipödem Stadium", "Lipedema stage")}</Text>
        <SegmentButtons size="sm" options={[{ v: 1 as const, label: "1" }, { v: 2 as const, label: "2" }, { v: 3 as const, label: "3" }]} value={stage} onChange={setStage} />
      </View>
      <NumberRow label={t("Alter (Jahre)", "Age (yrs)")} value={age} onChange={setAge} />
      <NumberRow label={t("Größe (cm)", "Height (cm)")} value={heightCm} onChange={setHeightCm} />
      <NumberRow label={t("Gewicht (kg)", "Weight (kg)")} value={weightKg} onChange={setWeightKg} />
    </View>
  </View>
);

const NumberRow = ({ label, value, onChange }: { label: string; value: number | ""; onChange: (v: number | "") => void }) => (
  <View className="flex-row items-center justify-between bg-card rounded-xl px-3 py-2" style={cardShadow}>
    <Text className="text-xs font-bold text-foreground">{label}</Text>
    <TextInput
      keyboardType="number-pad"
      value={value === "" ? "" : String(value)}
      onChangeText={(v) => onChange(v === "" ? "" : Number(v.replace(/[^0-9]/g, "")))}
      className="w-20 text-right text-sm font-bold text-foreground"
      placeholder="–"
      placeholderTextColor={colors.mutedForeground}
    />
  </View>
);

const ShopHype = ({ t }: { t: T }) => (
  <View className="items-center">
    <DroppiMascot variant="celebrate" size={120} />
    <Text className="text-lg font-extrabold text-foreground mt-3">{t("Stilvoll, passgenau, entspannt.", "Stylish, perfect fit, easy.")}</Text>
    <Text className="text-sm font-medium text-foreground mt-3 text-center max-w-[280px] leading-snug">
      {t(
        "Gleich Maße eingeben oder per Foto-Scan auslesen und entspannt shoppen mit unserer Wohlfühl-Garantie.",
        "Enter measurements or scan them by photo and shop with our comfort guarantee.",
      )}
    </Text>
    <Text className="text-[11px] text-muted-foreground mt-3 text-center">
      {t("(Foto-Scan kommt bald — Knopf ist oben rechts im Körper-Tab.)", "(Photo scan coming soon — the button lives in the Body tab.)")}
    </Text>
  </View>
);

const PairingMock = ({ t }: { t: T }) => {
  const [phase, setPhase] = useState<"scan" | "found" | "paired">("scan");
  return (
    <View className="items-center">
      <Text className="text-lg font-extrabold text-foreground">{t("LymphDot koppeln", "Pair your LymphDot")}</Text>
      <View className="mt-6 bg-card rounded-2xl p-5 w-full items-center" style={cardShadow}>
        {phase === "scan" && (
          <>
            <View className="w-24 h-24 rounded-full bg-droppi-sky-light items-center justify-center">
              <Text className="text-3xl">📡</Text>
            </View>
            <Text className="text-sm font-bold text-foreground mt-3">{t("Suche nach Geräten…", "Searching for devices…")}</Text>
            <Pressable onPress={() => setPhase("found")} className="mt-3 px-3 py-2 rounded-lg bg-muted">
              <Text className="text-xs font-bold text-muted-foreground">{t("Demo: Gerät gefunden", "Demo: device found")}</Text>
            </Pressable>
          </>
        )}
        {phase === "found" && (
          <>
            <View className="w-24 h-24 rounded-full bg-droppi-mint-light items-center justify-center">
              <Text className="text-3xl">🔵</Text>
            </View>
            <Text className="text-sm font-bold text-foreground mt-3">LymphDot · #A1B2</Text>
            <Pressable onPress={() => setPhase("paired")} className="mt-3 px-4 py-2 rounded-lg" style={{ backgroundColor: colors.primary }}>
              <Text className="text-xs font-bold text-white">{t("Koppeln", "Pair")}</Text>
            </Pressable>
          </>
        )}
        {phase === "paired" && (
          <>
            <View className="w-24 h-24 rounded-full bg-droppi-mint-light items-center justify-center">
              <Text className="text-3xl">✅</Text>
            </View>
            <Text className="text-sm font-bold text-foreground mt-3">{t("Verbunden", "Connected")}</Text>
            <Text className="text-[11px] text-muted-foreground mt-2 text-center leading-snug">
              {t(
                "Tipp: Den Dot auf saubere, trockene Haut entlang der großen Lymphbahnen kleben — z. B. Innenseite Oberschenkel oder Unterarm.",
                "Tip: Place the dot on clean, dry skin along major lymph routes — e.g. inner thigh or forearm.",
              )}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const Reminders = ({ t, value, onChange }: { t: T; value: boolean; onChange: (v: boolean) => void }) => (
  <View>
    <View className="items-center">
      <DroppiMascot variant="happy" size={88} />
    </View>
    <Text className="text-xl font-extrabold text-foreground text-center mt-3">{t("Sanfte Erinnerungen?", "Gentle reminders?")}</Text>
    <Text className="text-sm text-muted-foreground font-medium text-center mt-1">
      {t("Kleine Hinweise für Wasser, Pausen und Behandlung.", "Soft nudges for water, breaks and treatment.")}
    </Text>
    <SegmentButtons
      cols={2}
      options={[
        { v: "yes", label: t("Ja, gerne", "Yes please") },
        { v: "no", label: t("Jetzt nicht", "Not now") },
      ]}
      value={value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
    />
  </View>
);

const AreaPicker = ({ t, value, onChange }: { t: T; value: BodyArea | undefined; onChange: (v: BodyArea) => void }) => (
  <View>
    <Text className="text-xl font-extrabold text-foreground text-center">{t("Wo brauchst du Behandlung?", "Where do you need treatment?")}</Text>
    <Text className="text-xs text-muted-foreground font-medium text-center mt-1">{t("Du kannst das später jederzeit ändern.", "You can change this anytime.")}</Text>
    <SegmentButtons
      options={[
        { v: "arm" as BodyArea, label: t("Arme", "Arms") },
        { v: "leg" as BodyArea, label: t("Beine", "Legs") },
        { v: "both" as BodyArea, label: t("Beides", "Both") },
      ]}
      value={value}
      onChange={onChange}
    />
  </View>
);

const SidePicker = ({ t, value, onChange }: { t: T; value: BodySide | undefined; onChange: (v: BodySide) => void }) => (
  <View>
    <Text className="text-xl font-extrabold text-foreground text-center">{t("Welche Seite?", "Which side?")}</Text>
    <Text className="text-xs text-muted-foreground font-medium text-center mt-1">{t("Damit wir Sessions richtig zuordnen.", "So we can map your sessions correctly.")}</Text>
    <SegmentButtons
      options={[
        { v: "left" as BodySide, label: t("Links", "Left") },
        { v: "right" as BodySide, label: t("Rechts", "Right") },
        { v: "both" as BodySide, label: t("Beides", "Both") },
      ]}
      value={value}
      onChange={onChange}
    />
  </View>
);

const ToolsPicker = ({
  t, uses, onToggle,
}: {
  t: T;
  uses: { compression: boolean; lymphDot: boolean; ipk: boolean; mld: boolean };
  onToggle: (k: "compression" | "lymphDot" | "ipk" | "mld") => void;
}) => {
  const items: { k: "compression" | "lymphDot" | "ipk" | "mld"; label: string }[] = [
    { k: "compression", label: t("Kompression", "Compression") },
    { k: "lymphDot", label: "LymphDot" },
    { k: "ipk", label: t("Pumpe (IPK)", "Pump (IPK)") },
    { k: "mld", label: t("Lymphdrainage", "MLD") },
  ];
  return (
    <View>
      <Text className="text-xl font-extrabold text-foreground text-center">{t("Welche Behandlung nutzt du?", "Which treatments do you use?")}</Text>
      <Text className="text-xs text-muted-foreground font-medium text-center mt-1">
        {t("Mehrfachauswahl möglich — keine Pflicht.", "Multi-select — none is fine too.")}
      </Text>
      <View className="flex-row flex-wrap -m-1 mt-4">
        {items.map((i) => {
          const on = uses[i.k];
          return (
            <View key={i.k} style={{ width: "50%" }} className="p-1">
              <Pressable
                onPress={() => onToggle(i.k)}
                className={`py-4 rounded-xl items-center justify-center border ${on ? "bg-droppi-sky-light border-primary/30" : "bg-muted border-transparent"}`}
              >
                <Text className={`text-sm font-bold ${on ? "text-primary" : "text-muted-foreground"}`}>{i.label}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default OnboardingScreen;
