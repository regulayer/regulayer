"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AnimatedOrb() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
        }
        if (materialRef.current) {
            materialRef.current.distort = 0.3 + Math.sin(clock.getElapsedTime()) * 0.1;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 128, 128]} scale={2.2}>
            <MeshDistortMaterial
                ref={materialRef}
                color="#00D4AA"
                attach="material"
                distort={0.4}
                speed={1.5}
                roughness={0.2}
                metalness={0.8}
                emissive="#00D4AA"
                emissiveIntensity={0.3}
            />
        </Sphere>
    );
}

function ParticleField() {
    const pointsRef = useRef<THREE.Points>(null);
    const particleCount = 1000;

    useEffect(() => {
        if (!pointsRef.current) return;
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i3] = 0; colors[i3 + 1] = 0.83; colors[i3 + 2] = 0.67; // Teal
            } else if (colorChoice < 0.66) {
                colors[i3] = 0.29; colors[i3 + 1] = 0.44; colors[i3 + 2] = 1; // Blue
            } else {
                colors[i3] = 0.66; colors[i3 + 1] = 0.23; colors[i3 + 2] = 0.93; // Purple
            }
        }
        
        pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }, []);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
            pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.2;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry />
            <pointsMaterial
                size={0.015}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export function CryptographicOrb() {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00D4AA" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4B6FFF" />
                <spotLight position={[0, 5, 0]} intensity={0.5} color="#A855F7" />
                
                <AnimatedOrb />
                <ParticleField />
                
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                />
            </Canvas>
        </div>
    );
}
