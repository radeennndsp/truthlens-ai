import React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}

export const Counter = ({ value, suffix = "", prefix = "", duration = 2, decimals = 0 }: CounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));
  const [displayValue, setDisplayValue] = React.useState("0");

  React.useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded, duration, decimals]);

  return <>{prefix}{displayValue}{suffix}</>;
};
