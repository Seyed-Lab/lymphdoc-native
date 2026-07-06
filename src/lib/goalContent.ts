import type { ImageSourcePropType } from "react-native";
import type { GoalKey } from "./store";

// NOTE: copy the PNGs from the web repo (src/assets/) into assets/droppi/ — see README step 2.
const droppiDetective = require("../../assets/droppi/droppi-detective.png");
const profDroppi = require("../../assets/droppi/prof-droppi.png");
const droppiClipboard = require("../../assets/droppi/droppi-clipboard.png");
const droppiShopping = require("../../assets/droppi/droppi-shopping.png");
const droppiWave = require("../../assets/droppi/droppi-wave.png");
const droppiDevice = require("../../assets/droppi/droppi-device.png");

export interface GoalDef {
  key: GoalKey;
  image: ImageSourcePropType;
  /** Background tint for the goal card (solid fallback of the web gradient). */
  tint: string;
  labelDe: string;
  labelEn: string;
  descDe: string;
  descEn: string;
  /** First tab the intro tour should land on after onboarding. */
  startTab: "home" | "body" | "knowledge" | "medical" | "progress" | "profile";
}

export const GOALS: GoalDef[] = [
  {
    key: "A",
    image: droppiDetective,
    tint: "hsl(199, 89%, 92%)",
    labelDe: "Verdacht pr\u00fcfen",
    labelEn: "Check a suspicion",
    descDe: "Symptome dokumentieren und f\u00fcr die \u00c4rztin aufbereiten.",
    descEn: "Document symptoms and prepare a report for a doctor.",
    startTab: "medical",
  },
  {
    key: "B",
    image: profDroppi,
    tint: "hsl(270, 50%, 94%)",
    labelDe: "Diagnose verstehen",
    labelEn: "Understand my diagnosis",
    descDe: "Lip\u00f6dem oder Lymph\u00f6dem einfach erkl\u00e4rt.",
    descEn: "Lipedema or lymphedema, clearly explained.",
    startTab: "knowledge",
  },
  {
    key: "C",
    image: droppiClipboard,
    tint: "hsl(160, 50%, 93%)",
    labelDe: "Therapie dokumentieren",
    labelEn: "Document my therapy",
    descDe: "F\u00fcr den Antrag auf Liposuktion bei der Krankenkasse.",
    descEn: "To support insurance approval for liposuction.",
    startTab: "body",
  },
  {
    key: "D",
    image: droppiShopping,
    tint: "hsl(20, 90%, 94%)",
    labelDe: "Kompression shoppen",
    labelEn: "Shop compression",
    descDe: "Ma\u00dfe aufnehmen und modische Versorgung finden.",
    descEn: "Capture measurements and find stylish garments.",
    startTab: "body",
  },
  {
    key: "E",
    image: droppiWave,
    tint: "hsl(199, 89%, 92%)",
    labelDe: "LymphDoc kennenlernen",
    labelEn: "Get to know LymphDoc",
    descDe: "Schnelle Tour durch die wichtigsten Funktionen.",
    descEn: "A quick tour through the core features.",
    startTab: "home",
  },
  {
    key: "F",
    image: droppiDevice,
    tint: "hsl(270, 50%, 94%)",
    labelDe: "LymphDot in Betrieb nehmen",
    labelEn: "Set up my LymphDot",
    descDe: "Ger\u00e4te koppeln und richtig platzieren.",
    descEn: "Pair your devices and place them correctly.",
    startTab: "home",
  },
];

export const GOAL_BY_KEY: Record<GoalKey, GoalDef> = GOALS.reduce(
  (acc, g) => ({ ...acc, [g.key]: g }),
  {} as Record<GoalKey, GoalDef>,
);

// =====================================================
// Intro/Spotlight scripts per primary goal
// =====================================================
export interface IntroStep {
  targetId: string;
  tab: "home" | "body" | "knowledge" | "medical" | "progress" | "profile";
  messageDe: string;
  messageEn: string;
}

export const INTRO_SCRIPTS: Record<GoalKey, IntroStep[]> = {
  A: [
    { targetId: "nav-medical", tab: "medical", messageDe: "Hier pr\u00fcfen wir gemeinsam deinen Verdacht \u2014 gef\u00fchrt und einfach.", messageEn: "We'll check your suspicion together here \u2014 guided and simple." },
    { targetId: "medical-intro", tab: "medical", messageDe: "Am Ende bekommst du einen sauberen Bericht f\u00fcr deine \u00c4rztin.", messageEn: "At the end you'll get a clean report for your doctor." },
    { targetId: "nav-body", tab: "body", messageDe: "Symptome und Ma\u00dfe kannst du jederzeit hier erg\u00e4nzen.", messageEn: "Add symptoms and measurements here anytime." },
  ],
  B: [
    { targetId: "nav-knowledge", tab: "knowledge", messageDe: "Im Wissen-Bereich erkl\u00e4ren wir Lip\u00f6dem & Lymph\u00f6dem in Bildern.", messageEn: "Here we explain lipedema & lymphedema in pictures." },
    { targetId: "knowledge-intro", tab: "knowledge", messageDe: "Tippe auf eine Lektion \u2014 ich poppe als Prof. Droppi dazu auf.", messageEn: "Tap a lesson \u2014 I'll pop in as Prof. Droppi." },
  ],
  C: [
    { targetId: "nav-body", tab: "body", messageDe: "Hier dokumentierst du Umf\u00e4nge und Symptome \u2014 wichtig f\u00fcr den KK-Antrag.", messageEn: "Document circumferences and symptoms here \u2014 key for the insurance claim." },
    { targetId: "nav-medical", tab: "medical", messageDe: "Medizin sammelt die Befunde und erzeugt deinen Bericht.", messageEn: "Medical collects findings and generates your report." },
    { targetId: "nav-progress", tab: "progress", messageDe: "Verlauf zeigt deine konservative Therapie \u00fcber Wochen und Monate.", messageEn: "Progress shows your conservative therapy over weeks and months." },
  ],
  D: [
    { targetId: "nav-body", tab: "body", messageDe: "Hier nimmst du deine Ma\u00dfe auf \u2014 gleich oder per Foto-Scan.", messageEn: "Capture your measurements here \u2014 manually or by photo scan." },
    { targetId: "body-scan-btn", tab: "body", messageDe: "Foto-Scan kommt bald \u2014 bis dahin tippst du die Werte einfach ein.", messageEn: "Photo scan is coming soon \u2014 for now just type in the values." },
  ],
  E: [
    { targetId: "nav-home", tab: "home", messageDe: "Start ist deine Tages\u00fcbersicht: Mood, Wasser, Pflege.", messageEn: "Home is your daily overview: mood, water, care." },
    { targetId: "nav-knowledge", tab: "knowledge", messageDe: "Wissen erkl\u00e4rt dir das Lymphsystem in kleinen H\u00e4ppchen.", messageEn: "Learn explains the lymph system in small bites." },
    { targetId: "nav-progress", tab: "progress", messageDe: "Verlauf zeigt deine Erfolge \u00fcber Zeit.", messageEn: "Progress shows your wins over time." },
  ],
  F: [
    { targetId: "nav-home", tab: "home", messageDe: "Tippe auf LymphDot, um die erste Session zu starten.", messageEn: "Tap LymphDot to start your first session." },
    { targetId: "nav-knowledge", tab: "knowledge", messageDe: "Im Wissen-Bereich findest du Tipps zur Platzierung.", messageEn: "Find placement tips in the Learn section." },
  ],
};

// Per-screen mini intros — triggered automatically the first time a screen is opened.
export const SCREEN_INTROS: Record<IntroStep["tab"], IntroStep[]> = {
  home: [
    { targetId: "quick-checkin", tab: "home", messageDe: "Dein Quick Check-in \u2014 morgens Mood & Symptome, abends ab 18 Uhr dein Daily-Check.", messageEn: "Your Quick Check-in \u2014 mood & symptoms in the morning, Daily-Check from 6 pm." },
    { targetId: "nav-home", tab: "home", messageDe: "\u00dcber den Home-Button kommst du jederzeit hierher zur\u00fcck.", messageEn: "The Home button always brings you back here." },
    { targetId: "home-level", tab: "home", messageDe: "Level & Rewards \u2014 plus Wasser und Pausen mit einem Tipp.", messageEn: "Level & rewards \u2014 plus water and breaks with one tap." },
    { targetId: "home-therapy", tab: "home", messageDe: "Die 4 Therapie-Sektionen: Tippe das Symbol zum Starten und Stoppen \u2014 oder \u201eLog\u201c f\u00fcr manuelle Eintr\u00e4ge.", messageEn: "Your 4 therapy sections: tap the icon to start/stop \u2014 or use \"Log\" for manual entries." },
  ],
  body: [
    { targetId: "nav-body", tab: "body", messageDe: "Der K\u00f6rper-Bereich \u2014 hier lebt alles \u00fcber dich.", messageEn: "The Body area \u2014 everything about you lives here." },
    { targetId: "body-data-btn", tab: "body", messageDe: "Deine K\u00f6rperdaten tr\u00e4gst du hier ein und pflegst sie.", messageEn: "Enter and update your body data here." },
    { targetId: "body-region-example", tab: "body", messageDe: "Tippe eine betroffene Region, um Symptome und Umf\u00e4nge festzuhalten.", messageEn: "Tap an affected region to capture symptoms and circumferences." },
  ],
  knowledge: [
    { targetId: "nav-knowledge", tab: "knowledge", messageDe: "Wissen \u2014 kurze Lektionen mit Prof. Droppi.", messageEn: "Learn \u2014 short lessons with Prof. Droppi." },
    { targetId: "knowledge-location", tab: "knowledge", messageDe: "Standort teilen f\u00fcr Wetter- und UV-Hinweise, die deine Lymphe beeinflussen.", messageEn: "Share your location for weather & UV hints that affect your lymph." },
    { targetId: "knowledge-understand", tab: "knowledge", messageDe: "Unter \u201eVerstehen lernen\u201c findest du auch die Soforthilfema\u00dfnahmen.", messageEn: "Under \"Understand more\" you'll also find the emergency measures." },
  ],
  medical: [
    { targetId: "nav-medical", tab: "medical", messageDe: "Medizin \u2014 deine gef\u00fchrte Bewertung.", messageEn: "Medical \u2014 your guided assessment." },
    { targetId: "medical-findings", tab: "medical", messageDe: "Im Befund-Bereich landet alles, was du mit deiner \u00c4rztin teilen kannst.", messageEn: "The Findings section collects everything you can share with your doctor." },
  ],
  progress: [
    { targetId: "nav-progress", tab: "progress", messageDe: "Verlauf \u2014 sieh deine Fortschritte \u00fcber die Zeit.", messageEn: "Progress \u2014 see how you're doing over time." },
    { targetId: "progress-month", tab: "progress", messageDe: "\u201eDiesen Monat\u201c fasst deine wichtigsten Zahlen zusammen.", messageEn: "\"This month\" sums up your key numbers." },
    { targetId: "progress-charts", tab: "progress", messageDe: "Die drei Verl\u00e4ufe zeigen Symptome, Therapie und Wasser.", messageEn: "The three charts show symptoms, therapy and hydration." },
    { targetId: "progress-dropdowns", tab: "progress", messageDe: "In den Drop-Downs findest du Details und Korrelationen.", messageEn: "The drop-downs reveal details and correlations." },
  ],
  profile: [
    { targetId: "nav-profile", tab: "profile", messageDe: "Dein Profil \u2014 Level, Setup, Ziele und Einstellungen.", messageEn: "Your profile \u2014 level, setup, goals and settings." },
    { targetId: "profile-level", tab: "profile", messageDe: "Die Level-Kachel zeigt deinen Fortschritt und Rewards.", messageEn: "The Level card shows your progress and rewards." },
    { targetId: "profile-setup", tab: "profile", messageDe: "\u201eDein Setup\u201c \u2014 K\u00f6rper, Therapien und Ger\u00e4te.", messageEn: "\"Your setup\" \u2014 body, therapies and devices." },
    { targetId: "profile-goals", tab: "profile", messageDe: "Tagesziele passt du hier an dein Leben an.", messageEn: "Adjust daily goals to fit your life here." },
    { targetId: "profile-settings", tab: "profile", messageDe: "Einstellungen, Sprache und Erinnerungen.", messageEn: "Settings, language and reminders." },
  ],
};
