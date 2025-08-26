import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Line } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { trajectories, type Trajectory } from '@/data/missionData';

interface EarthProps {
  position: [number, number, number];
}

function Earth({ position }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Earth */}
      <Sphere ref={earthRef} args={[2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4A90E2" />
      </Sphere>
      
      {/* Earth atmosphere glow */}
      <Sphere args={[2.2]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#87CEEB" transparent opacity={0.3} />
      </Sphere>
      
      {/* Earth label */}
      <mesh position={[0, -3, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

interface MoonProps {
  position: [number, number, number];
}

function Moon({ position }: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Moon */}
      <Sphere ref={moonRef} args={[0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#C0C0C0" />
      </Sphere>
      
      {/* Moon label */}
      <mesh position={[0, -1.5, 0]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

interface TrajectoryLineProps {
  trajectory: Trajectory;
  color: string;
  isActive: boolean;
}

function TrajectoryLine({ trajectory, color, isActive }: TrajectoryLineProps) {
  const points = trajectory.points.map(point => 
    [point.x * 0.1, point.y * 0.1, point.z * 0.1] as [number, number, number]
  );
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={isActive ? 3 : 2}
      transparent
      opacity={isActive ? 1 : 0.7}
    />
  );
}

interface SpacecraftProps {
  position: [number, number, number];
}

function Spacecraft({ position }: SpacecraftProps) {
  const spacecraftRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (spacecraftRef.current) {
      spacecraftRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group ref={spacecraftRef} position={position}>
      {/* Spacecraft body */}
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Solar panels */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.05]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.05]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      
      {/* Thruster glow */}
      <mesh position={[-0.2, 0, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#FF4500" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

interface TrajectoryView3DProps {
  activeTrajectory: string;
  onTrajectorySelect?: (trajectoryId: string) => void;
}

export default function TrajectoryView3D({ activeTrajectory, onTrajectorySelect }: TrajectoryView3DProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const activeTrajectoryData = trajectories.find(t => t.id === activeTrajectory) || trajectories[0];
  const spacecraftPosition = activeTrajectoryData.points[Math.floor(animationProgress * (activeTrajectoryData.points.length - 1))];
  
  return (
    <div className="w-full h-full bg-gradient-cosmic relative">
      <Canvas camera={{ position: [30, 20, 30], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#FFE4B5" />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#FFFFFF" />
        
        {/* Background stars */}
        <Stars radius={300} depth={60} count={3000} factor={7} saturation={0.8} fade />
        
        {/* Earth-Moon system */}
        <Earth position={[0, 0, 0]} />
        <Moon position={[20, 6, 2]} />
        
        {/* Trajectory lines */}
        {trajectories.map((trajectory) => (
          <TrajectoryLine
            key={trajectory.id}
            trajectory={trajectory}
            color={
              trajectory.id === activeTrajectory ? '#00FFFF' :
              trajectory.risk === 'Low' ? '#00FF00' :
              trajectory.risk === 'High' ? '#FF4500' : '#FFFF00'
            }
            isActive={trajectory.id === activeTrajectory}
          />
        ))}
        
        {/* Spacecraft */}
        <Spacecraft position={[
          spacecraftPosition.x * 0.1,
          spacecraftPosition.y * 0.1,
          spacecraftPosition.z * 0.1
        ]} />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={80}
        />
      </Canvas>
      
      {/* 3D View overlay controls */}
      <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3">
        <h3 className="text-sm font-mono-mission text-primary mb-2">TRAJECTORY SELECTION</h3>
        {trajectories.map((trajectory) => (
          <button
            key={trajectory.id}
            onClick={() => onTrajectorySelect?.(trajectory.id)}
            className={`block w-full text-left text-xs py-1 px-2 rounded mb-1 font-mono-mission transition-colors ${
              trajectory.id === activeTrajectory 
                ? 'bg-primary text-primary-foreground glow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {trajectory.name}
          </button>
        ))}
      </div>
      
      {/* Animation progress */}
      <div className="absolute bottom-4 left-4 right-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono-mission text-muted-foreground">Mission Progress</span>
          <span className="text-xs font-mono-mission text-primary">{Math.round(animationProgress * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={animationProgress}
          onChange={(e) => setAnimationProgress(parseFloat(e.target.value))}
          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}