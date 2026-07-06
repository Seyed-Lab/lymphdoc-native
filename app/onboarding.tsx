import { useRouter } from "expo-router";
import OnboardingScreen from "@/screens/OnboardingScreen";
import { useStore } from "@/lib/StoreContext";
import { GOAL_BY_KEY } from "@/lib/goalContent";
import type { GoalKey } from "@/lib/store";

export default function OnboardingRoute() {
  const store = useStore();
  const router = useRouter();

  const handleDone = (primaryGoal?: GoalKey) => {
    const goal = primaryGoal ?? store.settings.profile.primaryGoal;
    const startTab = goal ? GOAL_BY_KEY[goal].startTab : "home";
    router.replace(`/(tabs)/${startTab}` as never);
  };

  return <OnboardingScreen store={store} onDone={handleDone} />;
}
