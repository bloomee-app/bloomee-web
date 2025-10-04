import { useAppStore } from '@/lib/store';
import { hotspots, latLonToVector3 } from '@/lib/data';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

// Komponen untuk satu Hotspot interaktif
function InteractiveHotspot({ hotspot, onHotspotClick }: { hotspot: any, onHotspotClick: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { setHoveredHotspot } = useAppStore();

  const position = latLonToVector3(hotspot.latitude, hotspot.longitude, 1.01);

  // Animasi untuk hotspot
  useFrame(() => {
    if (meshRef.current) {
      // const time = Date.now() * 0.001;
      // const pulse = 0.5 + Math.sin(time) * 2;

      const scaleFactor = hovered ? 2 : 1.5;
      meshRef.current.scale.setScalar(scaleFactor);
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[0.015, 16, 16]}
      position={[position.x, position.y, position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onHotspotClick(hotspot);
        // console.log(`Hotspot ${hotspot.name} diklik!`); 
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHoveredHotspot(hotspot);
      }}
      onPointerOut={() => {
        setHovered(false);
        setHoveredHotspot(null);
      }}
    >
      <meshBasicMaterial color={hotspot.color} transparent opacity={hovered ? 1 : 0.6} />
    </Sphere>
  );
}

// Komponen utama yang memetakan semua Hotspot
export default function Hotspots({ onHotspotClick }: { onHotspotClick: any }) {
  return (
    <>
      {hotspots.map((hotspot) => (
        <InteractiveHotspot key={hotspot.id} hotspot={hotspot} onHotspotClick={onHotspotClick} />
      ))}
    </>
  );
}