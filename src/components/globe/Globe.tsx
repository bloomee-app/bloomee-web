'use client'

import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'

// Starfield component
function Starfield() {
  const starSprite = useTexture('/textures/circle.png')
  
  const points = useMemo(() => {
    function randomSpherePoint() {
      const radius = Math.random() * 25 + 25
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      let x = radius * Math.sin(phi) * Math.cos(theta)
      let y = radius * Math.sin(phi) * Math.sin(theta)
      let z = radius * Math.cos(phi)

      return {
        pos: new THREE.Vector3(x, y, z),
        hue: 0.6,
        minDist: radius,
      }
    }

    const verts = []
    const colors = []
    const positions = []
    let col
    for (let i = 0; i < 4500; i += 1) {
      let p = randomSpherePoint()
      const { pos, hue } = p
      positions.push(p)
      col = new THREE.Color().setHSL(hue, 0.1, Math.random() * 0.5 + 0.5)
      verts.push(pos.x, pos.y, pos.z)
      colors.push(col.r, col.g, col.b)
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    
    const mat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      map: starSprite,
      transparent: true,
      opacity: 0.8
    })
    
    return new THREE.Points(geo, mat)
  }, [starSprite])

  return <primitive object={points} />
}

// Earth Globe component with custom shaders and mouse interactivity
function EarthGlobe() {
  const globeGroupRef = useRef<THREE.Group>(null)
  const wireframeRef = useRef<THREE.Mesh>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const pointerPosRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const globeUVRef = useRef<THREE.Vector2>(new THREE.Vector2())
  
  // Load textures - EXACT paths from original vertex-earth
  const colorMap = useTexture('/textures/00_earthmap1k.jpg')
  const otherMap = useTexture('/textures/04_rainbow1k.jpg')
  const elevMap = useTexture('/textures/01_earthbump1k.jpg')
  const alphaMap = useTexture('/textures/02_earthspec1k.jpg')
  
  // Shader uniforms - EXACT from original vertex-earth
  const uniforms = useMemo(() => ({
    size: { value: 4.0 },
    colorTexture: { value: colorMap },
    otherTexture: { value: otherMap },
    elevTexture: { value: elevMap },
    alphaTexture: { value: alphaMap },
    mouseUV: { value: new THREE.Vector2(0.0, 0.0) }
  }), [colorMap, otherMap, elevMap, alphaMap])

  // Vertex shader - EXACT from original vertex-earth with mouse interactivity
  const vertexShader = `
    uniform float size;
    uniform sampler2D elevTexture;
    uniform vec2 mouseUV;

    varying vec2 vUv;
    varying float vVisible;
    varying float vDist;

    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      float elv = texture2D(elevTexture, vUv).r;
      vec3 vNormal = normalMatrix * normal;
      vVisible = step(0.0, dot( -normalize(mvPosition.xyz), normalize(vNormal)));
      mvPosition.z += 0.35 * elv;

      float dist = distance(mouseUV, vUv);
      float zDisp = 0.0;
      float thresh = 0.04;
      if (dist < thresh) {
        zDisp = (thresh - dist) * 10.0;
      }
      vDist = dist;
      mvPosition.z += zDisp;

      gl_PointSize = size;
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  // Fragment shader - Modified to focus on land areas only
  const fragmentShader = `
    uniform sampler2D colorTexture;
    uniform sampler2D alphaTexture;
    uniform sampler2D otherTexture;

    varying vec2 vUv;
    varying float vVisible;
    varying float vDist;

    void main() {
      if (floor(vVisible + 0.1) == 0.0) discard;
      
      vec3 color = texture2D(colorTexture, vUv).rgb;
      vec3 other = texture2D(otherTexture, vUv).rgb;
      
      // Check if this is land (not ocean)
      float blue = color.b;
      float green = color.g;
      float red = color.r;
      float brightness = dot(color, vec3(0.299, 0.587, 0.114));
      
      // Skip ocean areas (let solid ocean layer handle them)
      if (blue > red && blue > green && (blue + green + red) < 1.2) {
        discard; // Don't render ocean areas as points
      }
      
      // This is land - render with transparency
      float alpha = 1.0 - texture2D(alphaTexture, vUv).r;
      alpha = alpha * 0.8; // Make land slightly transparent
      
      // Apply hover effect
      float thresh = 0.04;
      if (vDist < thresh) {
        color = mix(color, other, (thresh - vDist) * 50.0);
        alpha = 1.0; // Make hovered area fully opaque
      }
      
      gl_FragColor = vec4(color, alpha);
    }
  `

  // Create geometries - EXACT from original vertex-earth
  const wireframeGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 16), [])
  const pointsGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 120), [])
  
  // Create materials - EXACT from original vertex-earth
  const wireframeMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: 0x0099ff,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  }), [])
  
  const pointsMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true
  }), [uniforms])

  // Raycasting function for mouse interaction and cursor effects
  const handleRaycast = (camera: THREE.Camera) => {
    if (!raycasterRef.current || !pointerPosRef.current || !globeUVRef.current || !wireframeRef.current) return
    
    raycasterRef.current.setFromCamera(pointerPosRef.current, camera)
    const intersects = raycasterRef.current.intersectObjects([wireframeRef.current], false)
    
    // Handle UV mapping for shader effects
    if (intersects.length > 0) {
      if (intersects[0].uv) {
        globeUVRef.current.copy(intersects[0].uv)
      }
    }
    
    uniforms.mouseUV.value = globeUVRef.current
  }

  // Animation loop - EXACT from original vertex-earth
  useFrame((state) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += 0.002
    }
    handleRaycast(state.camera)
  })

  // Cursor hover state
  const isHoveringRef = useRef(false)
  const isDraggingRef = useRef(false)
  
  // Mouse event handler with cursor effects
  useEffect(() => {
    const handleMouseMove = (evt: MouseEvent) => {
      if (!pointerPosRef.current) return
      pointerPosRef.current.set(
        (evt.clientX / window.innerWidth) * 2 - 1,
        -(evt.clientY / window.innerHeight) * 2 + 1
      )
      
      // Simple distance-based detection for cursor changes
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const distance = Math.sqrt(
        Math.pow(evt.clientX - centerX, 2) + Math.pow(evt.clientY - centerY, 2)
      )
      
      // Earth radius in screen coordinates (roughly) - make it larger for easier detection
      const earthRadius = Math.min(window.innerWidth, window.innerHeight) * 0.4
      
      if (distance < earthRadius && !isDraggingRef.current) {
        if (!isHoveringRef.current) {
          isHoveringRef.current = true
          console.log('🖱️ Cursor changed to pointer')
          document.body.className = 'cursor-pointer'
        }
      } else {
        if (isHoveringRef.current && !isDraggingRef.current) {
          isHoveringRef.current = false
          console.log('🖱️ Cursor changed to default')
          document.body.className = ''
        }
      }
    }

    const handleMouseDown = (evt: MouseEvent) => {
      if (isHoveringRef.current) {
        isDraggingRef.current = true
        console.log('🖱️ Cursor changed to grabbing')
        document.body.className = 'cursor-grabbing'
      }
    }

    const handleMouseUp = (evt: MouseEvent) => {
      isDraggingRef.current = false
      if (isHoveringRef.current) {
        console.log('🖱️ Cursor changed to pointer')
        document.body.className = 'cursor-pointer'
      } else {
        console.log('🖱️ Cursor changed to default')
        document.body.className = ''
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.className = '' // Reset cursor on cleanup
    }
  }, [])

  // Load textures at component level (not inside useMemo)
  const oceanTexture = useTexture('/textures/00_earthmap1k.jpg')

  // Ocean material for solid layer with better ocean detection
  const oceanMat = useMemo(() => {
    
    // Create ocean shader material
    const oceanVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    
    const oceanFragmentShader = `
      uniform sampler2D oceanTexture;
      varying vec2 vUv;
      
      void main() {
        vec3 color = texture2D(oceanTexture, vUv).rgb;
        
        // Ocean detection based on color (blue/dark areas)
        float blue = color.b;
        float green = color.g;
        float red = color.r;
        
        // If it's predominantly blue/dark (ocean), make it solid
        if (blue > red && blue > green && (blue + green + red) < 1.2) {
          // Ocean area - solid blue
          gl_FragColor = vec4(mix(vec3(0.0, 0.1, 0.3), vec3(0.0, 0.4, 0.8), blue), 1.0);
        } else {
          // Land area - discard to show points underneath
          discard;
        }
      }
    `
    
    const oceanUniforms = {
      oceanTexture: { value: oceanTexture }
    }
    
    return new THREE.ShaderMaterial({
      uniforms: oceanUniforms,
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      transparent: true
    })
  }, [oceanTexture])

  return (
    <group ref={globeGroupRef}>
      {/* Wireframe globe */}
      <mesh ref={wireframeRef} geometry={wireframeGeo} material={wireframeMat} />
      
      {/* Solid Ocean Layer */}
      <mesh geometry={wireframeGeo} material={oceanMat} />
      
      {/* Points globe with custom shaders (mainly for land) */}
      <points ref={pointsRef} geometry={pointsGeo} material={pointsMat} />
    </group>
  )
}

// Loading component for Suspense
function GlobeLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  )
}

// Main Globe component
interface GlobeProps {
  className?: string
}

export default function Globe({ className }: GlobeProps) {
  const { cameraPosition } = useAppStore()

  return (
    <div 
      className={className}
      style={{
        cursor: 'default'
      }}
    >
      <Suspense fallback={<GlobeLoading />}>
        <Canvas
          camera={{ 
            position: [0, 0, 4], // EXACT from original vertex-earth
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{ antialias: true }}
          style={{ 
            background: 'black',
            cursor: 'inherit' // Let parent handle cursor
          }}
        >
          {/* Lighting */}
          <hemisphereLight args={[0xffffff, 0x080820, 3]} />
          
          {/* Starfield */}
          <Starfield />
          
          {/* Earth Globe */}
          <EarthGlobe />
          
          {/* Orbit Controls */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2.5}  // Batasan zoom in - tidak bisa terlalu dekat
            maxDistance={26.0}  
          />
        </Canvas>
      </Suspense>
    </div>
  )
}