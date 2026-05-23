import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "../context/ThemeContext";

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const { theme } = useTheme();
  const { mouse } = useThree();
  
  // Generate particles with slightly more density
  const [positions] = useMemo(() => {
    const positions = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return [positions];
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      // Gentle rotation
      ref.current.rotation.y = t * 0.02;
      
      // Cursor Parallax - limited for smoothness
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouse.x * 1.5, 0.03);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, mouse.y * 1.5, 0.03);
    }
  });

  const color = theme === "dark" ? "#ffffff" : "#000000";

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={theme === "dark" ? 0.35 : 0.45}
      />
    </Points>
  );
}

function MorphingCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.rotation.x = t * 0.05;
      meshRef.current.rotation.y = t * 0.08;
      
      // Follow cursor tilt - dampened
      meshRef.current.rotation.x += mouse.y * 0.1;
      meshRef.current.rotation.y += mouse.x * 0.1;
      
      meshRef.current.position.y = Math.sin(t / 2) * 0.05;
    }
  });

  const color = theme === "dark" ? "#ffffff" : "#000000";

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusKnotGeometry args={[3, 0.7, 64, 16]} />
      <meshStandardMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={theme === "dark" ? 0.12 : 0.06}
        emissive={theme === "dark" ? color : "#000000"}
        emissiveIntensity={theme === "dark" ? 0.5 : 0}
      />
    </mesh>
  );
}

function SceneContent() {
  const { theme } = useTheme();
  return (
    <>
      <ambientLight intensity={theme === "dark" ? 1.0 : 1.2} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1} color={theme === "dark" ? "#60a5fa" : "#3b82f6"} />
      <Suspense fallback={null}>
        <ParticleField />
        <MorphingCore />
      </Suspense>
    </>
  );
}

export default function NeuralNetwork3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[0] w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }} 
        dpr={typeof window !== "undefined" ? window.devicePixelRatio : 1}
        gl={{ alpha: true, antialias: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
