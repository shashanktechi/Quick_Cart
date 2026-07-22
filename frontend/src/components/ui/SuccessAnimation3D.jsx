import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

function CheckmarkScene({ onAnimationComplete }) {
  const groupRef = useRef();
  const time = useRef(0);
  const [animationFinished, setAnimationFinished] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    time.current += delta;
    
    // Bounce and Scale In Animation
    if (time.current < 0.6) {
      // Pop in with elastic bounce
      const progress = time.current / 0.6;
      // Simple elastic ease out math
      const scale = Math.sin(-13 * (progress + 1) * Math.PI / 2) * Math.pow(2, -10 * progress) + 1;
      groupRef.current.scale.set(scale, scale, scale);
      
      // Rotate in
      groupRef.current.rotation.y = (1 - progress) * Math.PI;
    } else {
      groupRef.current.scale.set(1, 1, 1);
      groupRef.current.rotation.y = 0;
      
      // Start exit animation after 1.2s
      if (time.current > 1.2 && !animationFinished) {
        setAnimationFinished(true);
        if (onAnimationComplete) onAnimationComplete();
      }
    }
    
    // Exit animation (scale down)
    if (time.current > 1.2 && time.current < 1.5) {
      const exitProgress = (time.current - 1.2) / 0.3;
      const easeInScale = 1 - Math.pow(exitProgress, 3);
      groupRef.current.scale.set(easeInScale, Math.max(0.01, easeInScale), easeInScale);
    }
  });

  return (
    <group ref={groupRef} scale={[0.01, 0.01, 0.01]}>
      {/* 3D Checkmark (Built from two extruded planes forming a V) */}
      <mesh position={[-0.3, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#0F9D6E" roughness={0.2} metalness={0.1} />
      </mesh>
      
      <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.2, 1.4, 0.2]} />
        <meshStandardMaterial color="#0F9D6E" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Halo behind the checkmark */}
      <mesh position={[0, 0, -0.2]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#D1FAE5" transparent opacity={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function SuccessAnimation3D({ onComplete }) {
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setIsWebGLSupported(false);
    } catch (e) {
      setIsWebGLSupported(false);
    }

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionMq.matches);
  }, []);

  if (!isWebGLSupported || prefersReducedMotion) {
    // Basic 2D fallback
    useEffect(() => {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }, [onComplete]);

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm">
        <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center shadow-lg text-4xl">
          ✓
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm pointer-events-none">
      <div className="w-full h-full max-w-lg aspect-square">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
            <directionalLight position={[-5, -5, 5]} intensity={0.5} />
            
            <CheckmarkScene onAnimationComplete={onComplete} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
