'use client'

import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '@/lib/store'
import { calculateBloomIntensity, pointToLatLng } from '@/lib/bloomUtils'
import { intensityToColor } from '@/lib/colorMapping'
import { normalizeCoordinates } from '@/lib/bloomingApi'

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

  // Store hook untuk update selected location
  const { 
    setSelectedLocation, 
    setPanelOpen, 
    setIsMinimized,
    setIsLandsatModalOpen,
    setLandsatModalMinimized,
    currentDate,
    bloomMode
  } = useAppStore()
  
  // Load textures - EXACT paths from original vertex-earth
  const colorMap = useTexture('/textures/00_earthmap1k.jpg')
  const otherMap = useTexture('/textures/04_rainbow1k.jpg')
  const elevMap = useTexture('/textures/01_earthbump1k.jpg')
  const alphaMap = useTexture('/textures/02_earthspec1k.jpg')
  
  // Shader uniforms - EXACT from original vertex-earth with bloom support
  const uniforms = useMemo(() => ({
    size: { value: 4.0 },
    colorTexture: { value: colorMap },
    otherTexture: { value: otherMap },
    elevTexture: { value: elevMap },
    alphaTexture: { value: alphaMap },
    mouseUV: { value: new THREE.Vector2(0.0, 0.0) },
    currentDate: { value: currentDate.getTime() / (1000 * 60 * 60 * 24) }, // Days since epoch
    currentYear: { value: currentDate.getFullYear() }, // Year for seasonal variations
    currentMonth: { value: currentDate.getMonth() }, // Month (0-11)
    currentDay: { value: currentDate.getDate() }, // Day of month
    bloomEnabled: { value: bloomMode ? 1.0 : 0.0 } // Enable bloom coloring
  }), [colorMap, otherMap, elevMap, alphaMap, currentDate, bloomMode])

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

  // Fragment shader - Enhanced bloom coloring with year-based variations
  const fragmentShader = `
    uniform sampler2D colorTexture;
    uniform sampler2D alphaTexture;
    uniform sampler2D otherTexture;
    uniform float currentDate;
    uniform float currentYear;
    uniform float currentMonth;
    uniform float currentDay;
    uniform float bloomEnabled;

    varying vec2 vUv;
    varying float vVisible;
    varying float vDist;

    // Enhanced bloom calculation with year-based seasonal variations
    vec3 calculateBloomColor(vec2 uv) {
      // Convert UV to approximate lat/lng
      float lat = (uv.y - 0.5) * 180.0; // -90 to 90
      float lng = (uv.x - 0.5) * 360.0; // -180 to 180
      
      // Year-based seasonal shift (each year can have slightly different bloom timing)
      float yearVariation = sin(currentYear * 0.1) * 0.2; // Slight variation per year
      float seasonalShift = yearVariation * 15.0; // Up to 15 days shift
      
      // Calculate day of year with year variation
      float dayOfYear = mod(currentDate, 365.0) + seasonalShift;
      if (dayOfYear < 0.0) dayOfYear += 365.0;
      if (dayOfYear >= 365.0) dayOfYear -= 365.0;
      
      float bloomIntensity = 0.0;
      
      // Northern hemisphere seasonal bloom
      if (lat > 0.0) {
        // Spring bloom (March-May) - More dramatic
        if (dayOfYear >= 60.0 && dayOfYear < 150.0) {
          bloomIntensity = sin((dayOfYear - 60.0) * 3.14159 / 90.0) * 1.0;
        }
        // Summer bloom (June-August) - Peak season
        else if (dayOfYear >= 150.0 && dayOfYear < 240.0) {
          bloomIntensity = 1.0 + sin((dayOfYear - 150.0) * 3.14159 / 90.0) * 0.2;
        }
        // Fall (September-November) - Gradual decline
        else if (dayOfYear >= 240.0 && dayOfYear < 330.0) {
          bloomIntensity = max(0.0, 0.8 - (dayOfYear - 240.0) / 90.0 * 0.8);
        }
        // Winter (December-February) - Dormant
        else {
          bloomIntensity = 0.05 + sin(dayOfYear * 3.14159 / 30.0) * 0.05;
        }
      } else { // Southern hemisphere (shifted by 6 months)
        float shiftedDay = mod(dayOfYear + 183.0, 365.0);
        // Spring bloom (September-November in Southern)
        if (shiftedDay >= 60.0 && shiftedDay < 150.0) {
          bloomIntensity = sin((shiftedDay - 60.0) * 3.14159 / 90.0) * 1.0;
        }
        // Summer bloom (December-February in Southern)
        else if (shiftedDay >= 150.0 && shiftedDay < 240.0) {
          bloomIntensity = 1.0 + sin((shiftedDay - 150.0) * 3.14159 / 90.0) * 0.2;
        }
        // Fall (March-May in Southern)
        else if (shiftedDay >= 240.0 && shiftedDay < 330.0) {
          bloomIntensity = max(0.0, 0.8 - (shiftedDay - 240.0) / 90.0 * 0.8);
        }
        // Winter (June-August in Southern)
        else {
          bloomIntensity = 0.05 + sin(shiftedDay * 3.14159 / 30.0) * 0.05;
        }
      }
      
      // Enhanced latitude factor with tropical regions
      float latitudeFactor;
      if (abs(lat) < 23.5) { // Tropical regions
        latitudeFactor = 0.8 + sin(dayOfYear * 3.14159 / 182.5) * 0.2; // Consistent but seasonal
      } else if (abs(lat) < 60.0) { // Temperate regions
        latitudeFactor = 1.0 - abs(lat) / 90.0 * 0.4;
      } else { // Polar regions
        latitudeFactor = 0.3 + sin(dayOfYear * 3.14159 / 365.0) * 0.2;
      }
      
      bloomIntensity *= latitudeFactor;
      
      // Climate zone variations (simplified)
      float climateFactor = 1.0;
      if (lng > -120.0 && lng < -60.0 && lat > 25.0 && lat < 50.0) { // North America
        climateFactor = 1.1; // Slightly more intense
      } else if (lng > -10.0 && lng < 40.0 && lat > 35.0 && lat < 70.0) { // Europe
        climateFactor = 1.05;
      } else if (lng > 100.0 && lng < 150.0 && lat > 20.0 && lat < 50.0) { // East Asia
        climateFactor = 1.15; // Cherry blossom regions
      }
      
      bloomIntensity *= climateFactor;
      bloomIntensity = clamp(bloomIntensity, 0.0, 1.5); // Allow slight overbloom
      
      // Enhanced color mapping with more dramatic differences
      vec3 bloomColor;
      if (bloomIntensity > 0.8) {
        bloomColor = vec3(0.1, 0.9, 0.2); // Vibrant spring green
      } else if (bloomIntensity > 0.6) {
        bloomColor = vec3(0.2, 0.8, 0.3); // Bright green
      } else if (bloomIntensity > 0.4) {
        bloomColor = vec3(0.3, 0.7, 0.2); // Medium green
      } else if (bloomIntensity > 0.2) {
        bloomColor = vec3(0.5, 0.6, 0.1); // Yellow-green
      } else if (bloomIntensity > 0.05) {
        bloomColor = vec3(0.7, 0.5, 0.1); // Yellow/brown
      } else {
        bloomColor = vec3(0.4, 0.3, 0.2); // Brown/dormant
      }
      
      return bloomColor;
    }

    void main() {
      if (floor(vVisible + 0.1) == 0.0) discard;
      
      vec3 color = texture2D(colorTexture, vUv).rgb;
      vec3 other = texture2D(otherTexture, vUv).rgb;
      
      // Check if this is land (not ocean)
      float blue = color.b;
      float green = color.g;
      float red = color.r;
      
      // Skip ocean areas (let solid ocean layer handle them)
      if (blue > red && blue > green && (blue + green + red) < 1.2) {
        discard; // Don't render ocean areas as points
      }
      
      // This is land - apply bloom coloring if enabled
      if (bloomEnabled > 0.5) {
        vec3 bloomColor = calculateBloomColor(vUv);
        // More dramatic blending for better visibility
        float blendFactor = 0.85; // Increased from 0.6 to 0.85
        color = mix(color, bloomColor, blendFactor);
      }
      
      // Apply hover effect
      float thresh = 0.04;
      if (vDist < thresh) {
        color = mix(color, other, (thresh - vDist) * 50.0);
      }
      
      float alpha = 1.0 - texture2D(alphaTexture, vUv).r;
      alpha = alpha * 0.8; // Make land slightly transparent
      
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
  }), [uniforms, vertexShader, fragmentShader])

  // Update uniforms when currentDate or bloomMode changes
  useEffect(() => {
    if (uniforms.currentDate) {
      uniforms.currentDate.value = currentDate.getTime() / (1000 * 60 * 60 * 24)
    }
    if (uniforms.currentYear) {
      uniforms.currentYear.value = currentDate.getFullYear()
    }
    if (uniforms.currentMonth) {
      uniforms.currentMonth.value = currentDate.getMonth()
    }
    if (uniforms.currentDay) {
      uniforms.currentDay.value = currentDate.getDate()
    }
    if (uniforms.bloomEnabled) {
      uniforms.bloomEnabled.value = bloomMode ? 1.0 : 0.0
    }
  }, [currentDate, bloomMode, uniforms])

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

  // Convert 3D point to geographical coordinates (lat/lng)
  const pointToLatLng = (point: THREE.Vector3): { lat: number; lng: number } => {
    // Normalize the vector
    const normalized = point.clone().normalize()

    // Calculate latitude (phi) and longitude (theta)
    const lat = Math.asin(normalized.y) * (180 / Math.PI)
    const lng = Math.atan2(normalized.x, normalized.z) * (180 / Math.PI)

    return { lat, lng }
  }

  // Convert UV coordinates to geographical coordinates (more accurate for globe interaction)
  const uvToLatLng = (uv: THREE.Vector2): { lat: number; lng: number } => {
    // UV coordinates: u (0-1) maps to longitude (-180 to 180), v (0-1) maps to latitude (-90 to 90)
    // FIXED: UV mapping was inverted - need to flip the latitude calculation
    const lat = (uv.y - 0.5) * 180  // FIXED: Changed from (0.5 - uv.y) to (uv.y - 0.5)
    const lng = (uv.x - 0.5) * 360  // Convert u (0-1) to lng (-180 to 180)
    
    // Debug logging to verify UV mapping
    console.log(`🔍 UV Debug (FIXED): u=${uv.x.toFixed(4)}, v=${uv.y.toFixed(4)} → lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`)
    
    return { lat, lng }
  }

  // Pointer down handler - hanya menyimpan data, tidak langsung proses
  const handleGlobePointerDown = (event: any) => {
    if (!event.point || !event.uv) return

    // Store the click data for potential processing
    const clickData = {
      point: event.point,
      uv: event.uv,
      timestamp: Date.now()
    }

    // Store click data in ref untuk digunakan di pointer up
    clickDataRef.current = clickData
    console.log('🖱️ Pointer down - storing click data')
  }

  // Pointer up handler - proses click jika tidak ada drag
  const handleGlobePointerUp = (event: any) => {
    // Clear any pending timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }

    // Process click if we have data and no drag was detected
    if (clickDataRef.current && !isDraggingRef.current) {
      console.log('🖱️ Processing click on pointer up')
      processGlobeClick(clickDataRef.current)
    } else if (isDraggingRef.current) {
      console.log('🖱️ Click ignored due to drag')
    }

    // Clear stored data
    clickDataRef.current = null
  }

  // Process the actual click
  const processGlobeClick = (clickData: any) => {
    if (!clickData.point || !clickData.uv) return

    // Use UV coordinates for more accurate geographical mapping
    // UV coordinates are not affected by globe rotation
    const rawCoords = uvToLatLng(clickData.uv)
    const { lat, lng } = normalizeCoordinates(rawCoords.lat, rawCoords.lng)

    console.log(`🌍 Globe clicked at: ${lat.toFixed(4)}°, ${lng.toFixed(4)}° (UV-based coordinates)`)
    console.log(`   UV coordinates: u=${clickData.uv.x.toFixed(4)}, v=${clickData.uv.y.toFixed(4)}`)
    console.log(`   Raw coords: ${rawCoords.lat.toFixed(4)}°, ${rawCoords.lng.toFixed(4)}°`)
    console.log(`   Normalized: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`)

    // Update store dengan koordinat yang diklik
    setSelectedLocation({ lat, lng })
    
    // Open both panels
    setPanelOpen(true)
    setIsMinimized(false) // CRITICAL: Ensure panel is not minimized when globe is clicked
    setIsLandsatModalOpen(true) // Open Landsat Modal
    setLandsatModalMinimized(false) // Ensure Landsat Modal is not minimized
    
    console.log('🌍 Globe click: Opening both panels for location:', { lat, lng })
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
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const dragThreshold = 5 // pixels - minimum movement to consider as drag
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const clickDataRef = useRef<any>(null)
  
  // Mouse event handler with cursor effects
  useEffect(() => {
    const handleMouseMove = (evt: MouseEvent) => {
      if (!pointerPosRef.current) return
      pointerPosRef.current.set(
        (evt.clientX / window.innerWidth) * 2 - 1,
        -(evt.clientY / window.innerHeight) * 2 + 1
      )
      
      // Check for drag detection if mouse is down
      if (dragStartPosRef.current && isHoveringRef.current) {
        const deltaX = Math.abs(evt.clientX - dragStartPosRef.current.x)
        const deltaY = Math.abs(evt.clientY - dragStartPosRef.current.y)
        const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        
        if (totalDelta > dragThreshold && !isDraggingRef.current) {
          isDraggingRef.current = true
          console.log('🖱️ Drag detected - preventing click events')
          
          // Cancel any pending click timeout
          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current)
            clickTimeoutRef.current = null
            console.log('🖱️ Click timeout cancelled due to drag')
          }
        }
      }
      
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
        // Store initial mouse position for drag detection
        dragStartPosRef.current = { x: evt.clientX, y: evt.clientY }
        console.log('🖱️ Mouse down - tracking for drag detection')
        document.body.className = 'cursor-grabbing'
        
        // Clear any pending click timeout
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
          clickTimeoutRef.current = null
        }
      }
    }

    const handleMouseUp = (evt: MouseEvent) => {
      // Reset drag state and position tracking
      isDraggingRef.current = false
      dragStartPosRef.current = null
      
      if (isHoveringRef.current) {
        console.log('🖱️ Cursor changed to pointer')
        document.body.className = 'cursor-pointer'
      } else {
        console.log('🖱️ Cursor changed to default')
        document.body.className = ''
      }
    }

    const handleMouseLeave = () => {
      // Reset all states when mouse leaves the window
      isDraggingRef.current = false
      dragStartPosRef.current = null
      isHoveringRef.current = false
      clickDataRef.current = null
      
      // Clear any pending timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      
      document.body.className = ''
      console.log('🖱️ Mouse left window - reset all states')
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
      
      // Clear any pending click timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      
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
      {/* Wireframe globe - dengan pointer handlers */}
      <mesh
        ref={wireframeRef}
        geometry={wireframeGeo}
        material={wireframeMat}
        onPointerDown={handleGlobePointerDown}
        onPointerUp={handleGlobePointerUp}
      />

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
            minDistance={2.5}  
            maxDistance={22.0}  
          />
        </Canvas>
      </Suspense>
    </div>
  )
}