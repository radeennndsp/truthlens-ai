import React, { Suspense } from "react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import NeuralNetwork3D from "./NeuralNetwork3D";

export default function BackgroundEffects() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 3D Neural Network Animation */}
      <Suspense fallback={null}>
        <NeuralNetwork3D />
      </Suspense>

      {/* Moving Ambient Orbs */}
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 0.8, 1],
          opacity: theme === "dark" ? [0.03, 0.08, 0.03] : [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500 blur-[120px]"
      />
      
      <motion.div
        animate={{
          x: [0, -120, 120, 0],
          y: [0, 120, -120, 0],
          scale: [0.8, 1.1, 0.9, 0.8],
          opacity: theme === "dark" ? [0.02, 0.05, 0.02] : [0.03, 0.07, 0.03],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500 blur-[100px]"
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.02]" 
        style={{ 
          backgroundImage: `linear-gradient(var(--resend-hairline-strong) 1px, transparent 1px), linear-gradient(90deg, var(--resend-hairline-strong) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} 
      />

      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' h='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Scanline Effect - Extremely subtle */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-[0.02] dark:opacity-[0.05]" />
    </div>
  );
}
