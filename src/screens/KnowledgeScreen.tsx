import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import ProfDroppi from "@/components/ProfDroppi";
import { useI18n } from "@/lib/i18n";

const cardShadow = { elevation: 2, shadowColor: "#141a2a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } as const;

interface Lesson {
  id: string;
  emoji: string;
  titleDe: string;
  titleEn: string;
  bodyDe: string;
  bodyEn: string;
}

/**
 * Condensed lesson set for v1. The full knowledgeContent.ts from the web app
 * (incl. Soforthilfe, weather/UV hints) is ported in a follow-up \u2014 see README roadmap.
 */
const LESSONS: Lesson[] = [
  {
    id: "lymph-system",
    emoji: "\ud83c\udf0a",
    titleDe: "Was macht das Lymphsystem?",
    titleEn: "What does the lymph system do?",
    bodyDe: "Dein Lymphsystem ist die Kl\u00e4ranlage deines K\u00f6rpers: Es sammelt Fl\u00fcssigkeit, Eiwei\u00dfe und Abfallstoffe aus dem Gewebe und transportiert sie zur\u00fcck in den Blutkreislauf. Anders als das Herz hat es keine eigene Pumpe \u2014 es lebt von Muskelbewegung, Atmung und \u00e4u\u00dferen Impulsen wie Kompression.",
    bodyEn: "Your lymph system is your body's water treatment plant: it collects fluid, proteins and waste from the tissue and returns them to the bloodstream. Unlike the heart it has no pump of its own \u2014 it relies on muscle movement, breathing and external support like compression.",
  },
  {
    id: "lipedema",
    emoji: "\ud83e\udd8b",
    titleDe: "Lip\u00f6dem verstehen",
    titleEn: "Understanding lipedema",
    bodyDe: "Das Lip\u00f6dem ist eine chronische Fettverteilungsst\u00f6rung, fast immer symmetrisch an Beinen und/oder Armen. Typisch: Druckschmerz, schnelle blaue Flecken, Schwere. Es ist keine Folge von \u00dcbergewicht \u2014 Di\u00e4ten \u00e4ndern die Proportionen kaum. Stadien I\u2013III beschreiben die Gewebever\u00e4nderung.",
    bodyEn: "Lipedema is a chronic fat distribution disorder, almost always symmetric in legs and/or arms. Typical: pain on pressure, easy bruising, heaviness. It is not caused by excess weight \u2014 diets barely change the proportions. Stages I\u2013III describe the tissue changes.",
  },
  {
    id: "lymphedema",
    emoji: "\ud83d\udca7",
    titleDe: "Lymph\u00f6dem verstehen",
    titleEn: "Understanding lymphedema",
    bodyDe: "Beim Lymph\u00f6dem staut sich eiwei\u00dfreiche Fl\u00fcssigkeit im Gewebe, weil der Abtransport gest\u00f6rt ist \u2014 prim\u00e4r (angeboren) oder sekund\u00e4r (z. B. nach OP/Bestrahlung). Fr\u00fche Zeichen: einseitige Schwellung, Spannungsgef\u00fchl, positive Stemmer-Falte. Fr\u00fche Therapie verhindert Gewebeumbau.",
    bodyEn: "In lymphedema, protein-rich fluid accumulates because drainage is impaired \u2014 primary (congenital) or secondary (e.g. after surgery/radiation). Early signs: one-sided swelling, tension, positive Stemmer sign. Early therapy prevents tissue remodeling.",
  },
  {
    id: "kpe",
    emoji: "\ud83e\uddf5",
    titleDe: "Die 4 S\u00e4ulen der KPE",
    titleEn: "The 4 pillars of CDT",
    bodyDe: "Komplexe Physikalische Entstauungstherapie = Manuelle Lymphdrainage + Kompression + Bewegung + Hautpflege. Die Kombination macht den Effekt: MLD mobilisiert, Kompression h\u00e4lt das Ergebnis, Bewegung pumpt, Hautpflege sch\u00fctzt vor Infekten wie dem Erysipel.",
    bodyEn: "Complete Decongestive Therapy = manual lymph drainage + compression + movement + skin care. The combination does the work: MLD mobilises, compression maintains the result, movement pumps, skin care protects against infections such as erysipelas.",
  },
  {
    id: "compression",
    emoji: "\ud83e\udde6",
    titleDe: "Warum Kompression wirkt",
    titleEn: "Why compression works",
    bodyDe: "Flachstrick-Kompression erh\u00f6ht den Gewebedruck und verbessert die Pumpwirkung jeder Muskelbewegung. Wichtig: t\u00e4glich tragen, passgenau versorgt, alle 6 Monate neu verordnen lassen. In LymphDoc dokumentierst du deine Tragezeit \u2014 wichtig f\u00fcr KK-Antr\u00e4ge.",
    bodyEn: "Flat-knit compression raises tissue pressure and boosts the pumping effect of every muscle movement. Key: wear daily, properly fitted, re-prescribed every 6 months. LymphDoc documents your wear time \u2014 important for insurance claims.",
  },
  {
    id: "emergency",
    emoji: "\ud83d\udea8",
    titleDe: "Warnzeichen: Wann zur \u00c4rztin?",
    titleEn: "Red flags: when to see a doctor",
    bodyDe: "Sofort abkl\u00e4ren lassen: pl\u00f6tzliche starke Schwellung, R\u00f6tung mit Fieber (Verdacht Erysipel), starker Schmerz, \u00fcberw\u00e4rmte Haut. Ein Erysipel ist ein Notfall und braucht schnell Antibiotika \u2014 lieber einmal zu viel zur \u00c4rztin als einmal zu wenig.",
    bodyEn: "Get checked immediately for: sudden severe swelling, redness with fever (suspected erysipelas), strong pain, overheated skin. Erysipelas is an emergency needing rapid antibiotics \u2014 better one doctor visit too many than one too few.",
  },
];

const KnowledgeScreen = () => {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-extrabold text-foreground">{t("Wissen", "Learn")}</Text>
      <Text className="text-xs text-muted-foreground font-medium mt-1">{t("Kurze Lektionen mit Prof. Droppi", "Short lessons with Prof. Droppi")}</Text>

      <View className="mt-4">
        <ProfDroppi message={t("Tippe eine Lektion an \u2014 ich erkl\u00e4re dir alles in kleinen H\u00e4ppchen.", "Tap a lesson \u2014 I'll explain everything in small bites.")} />
      </View>

      <View className="gap-2 mt-4">
        {LESSONS.map((l) => {
          const isOpen = open === l.id;
          return (
            <Pressable key={l.id} onPress={() => setOpen(isOpen ? null : l.id)} className="bg-card rounded-2xl p-4" style={cardShadow}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">{l.emoji}</Text>
                <Text className="flex-1 text-sm font-extrabold text-foreground">{t(l.titleDe, l.titleEn)}</Text>
                {isOpen ? <ChevronUp size={16} color="#8890a0" /> : <ChevronDown size={16} color="#8890a0" />}
              </View>
              {isOpen && (
                <Text className="text-xs text-foreground font-medium leading-relaxed mt-3">{t(l.bodyDe, l.bodyEn)}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default KnowledgeScreen;
