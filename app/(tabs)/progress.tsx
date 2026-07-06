import ProgressScreen from "@/screens/ProgressScreen";
import { useStore } from "@/lib/StoreContext";

export default function ProgressTab() {
  const store = useStore();
  return <ProgressScreen store={store} />;
}
