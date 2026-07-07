# LymphDoc Native \ud83d\udca7

Native iOS/Android-App (Expo / React Native), portiert aus der LymphDoc Web-App
([`Seyed-Lab/my-droppi-moment`](https://github.com/Seyed-Lab/my-droppi-moment)).

## Stack

- **Expo SDK 52** + TypeScript, **Expo Router** (Tabs), **NativeWind 4** (Tailwind-Klassen)
- **AsyncStorage** hinter einem synchronen Cache \u2014 identische Semantik wie `localStorage` der Web-App
- **Reanimated** (Animationen), **expo-haptics**, **expo-notifications** (20:30 Daily-Reminder), **react-native-svg** (Ringe)
- Store-Logik (Rewards, Streaks, Level, Goals) 1:1 aus der Web-App \u00fcbernommen \u2014 `src/lib/store.ts`

## Setup (einmalig)

```bash
git clone https://github.com/Seyed-Lab/lymphdoc-native.git
cd lymphdoc-native
npm install
```

**Schritt 2 \u2014 Assets kopieren (Pflicht, sonst startet der Bundler nicht):**
Die Droppi-PNGs liegen im Web-Repo und werden nicht doppelt versioniert.

```bash
# Web-Repo daneben klonen (falls noch nicht vorhanden)
git clone https://github.com/Seyed-Lab/my-droppi-moment.git ../my-droppi-moment

# PNGs kopieren
mkdir -p assets/droppi
cp ../my-droppi-moment/src/assets/*.png assets/droppi/

# App-Icon (vorerst Droppi happy als Platzhalter)
cp assets/droppi/droppi-happy.png assets/icon.png
```

Windows (PowerShell):
```powershell
New-Item -ItemType Directory -Force assets\\droppi
Copy-Item ..\\my-droppi-moment\\src\\assets\\*.png assets\\droppi\\
Copy-Item assets\\droppi\\droppi-happy.png assets\\icon.png
```

## Starten

```bash
npx expo start
```

Dann **Expo Go** auf dem iPhone/Android installieren und den QR-Code scannen \u2014
die App l\u00e4uft sofort auf deinem Ger\u00e4t. F\u00fcr Simulator: `i` (iOS, nur macOS) oder `a` (Android).

## Struktur

```
app/                 Expo-Router-Routen
  _layout.tsx        Provider (Storage-Hydration, i18n, Store) + Stack
  onboarding.tsx     Onboarding-Route
  (tabs)/            6 Tabs: home, body, knowledge, medical, progress, profile
src/
  lib/               store, storage, i18n, theme, goalContent, notifications
  components/        Mascot, Ring, Sheets, SegmentButtons, CheerPopup, ...
  screens/           Screen-Implementierungen
```

## Native UX-Verbesserungen ggü. Web

- Echte **Push-Reminder** um 20:30 (feuert auch bei geschlossener App)
- **Haptisches Feedback** bei Logs, Check-ins, Navigation
- Safe-Area-korrektes Layout (Notch/Home-Indicator)
- Onboarding-Fortschritt \u00fcbersteht Remounts (Session-Cache statt sessionStorage-Hydration-Bug)

## Roadmap / bewusst noch offen

1. **Medical**: gef\u00fchrte Anamnese, PDF-Bericht + Versand (Web-Feature-Parit\u00e4t)
2. **Knowledge**: vollst\u00e4ndiger Port von `knowledgeContent.ts` inkl. Soforthilfe & Wetter/UV
3. **Supabase-Sync** (Client ist installiert, `src/integrations` folgt)
4. **LymphDot BLE-Pairing** (echtes Bluetooth statt Demo \u2014 nur nativ m\u00f6glich)
5. Store-Releases via **EAS Build** (`npx eas build`)

> **Hinweis MDR**: F\u00fcr den produktiven Einsatz als Medizinprodukt (Class 2a) m\u00fcssen
> Datenschutz (Gesundheitsdaten!), Zweckbestimmung und technische Doku vor dem
> Store-Release stehen. Die App speichert aktuell ausschlie\u00dflich lokal.
