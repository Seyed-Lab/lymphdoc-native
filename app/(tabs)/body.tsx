import BodyScreen from "@/screens/BodyScreen";
import { useStore } from "@/lib/StoreContext";

export default function BodyTab() {
  const store = useStore();
  return <BodyScreen store={store} />;
}
