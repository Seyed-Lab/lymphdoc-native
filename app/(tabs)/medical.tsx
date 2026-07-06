import MedicalScreen from "@/screens/MedicalScreen";
import { useStore } from "@/lib/StoreContext";

export default function MedicalTab() {
  const store = useStore();
  return <MedicalScreen store={store} />;
}
