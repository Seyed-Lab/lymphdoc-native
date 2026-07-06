import { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "@/lib/theme";

interface Props {
  progress: number; // 0..100
  size?: number;
  stroke?: number;
  gradient?: boolean;
  active?: boolean;
  content?: ReactNode;
}

/** Progress ring ported from the web HomeScreen (SVG dasharray technique). */
const Ring = ({ progress, size = 86, stroke = 7, gradient = true, content }: Props) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, progress)) / 100) * c;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="hsl(199, 89%, 70%)" />
            <Stop offset="100%" stopColor="hsl(330, 80%, 78%)" />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={gradient ? "url(#ringGrad)" : colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        {content}
      </View>
    </View>
  );
};

export default Ring;
