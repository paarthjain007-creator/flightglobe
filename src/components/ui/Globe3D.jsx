import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sphere, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/* ── Texture Sources (NASA & Natural Earth) ─────────────────── */
const EARTH_TEXTURE_URL  = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const NIGHT_TEXTURE_URL  = "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const TOPOLOGY_MAP_URL   = "https://unpkg.com/three-globe/example/img/earth-topology.png";
const CLOUDS_TEXTURE_URL = "https://unpkg.com/three-globe/example/img/clouds.png";

/* ── Fallback High-Definition Procedural Earth Canvas Texture ── */
function createProceduralEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, "#081b33");
  oceanGrad.addColorStop(0.5, "#0b2545");
  oceanGrad.addColorStop(1, "#081b33");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Ocean latitude/longitude bathymetric grid
  ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Draw continent landmass approximations
  ctx.fillStyle = "#1e3a5f";
  ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
  ctx.lineWidth = 2;

  function drawContinent(points) {
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      const px = (x / 360 + 0.5) * 2048;
      const py = (-y / 180 + 0.5) * 1024;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // North America
  drawContinent([[-165, 65], [-140, 70], [-90, 75], [-60, 50], [-75, 25], [-105, 20], [-120, 35], [-165, 65]]);
  // South America
  drawContinent([[-80, 10], [-35, -5], [-40, -22], [-65, -55], [-75, -45], [-80, 0], [-80, 10]]);
  // Europe & Asia (Eurasia)
  drawContinent([[-10, 36], [0, 50], [30, 70], [170, 70], [140, 35], [105, 10], [75, 10], [50, 25], [30, 30], [-10, 36]]);
  // Africa
  drawContinent([[-15, 35], [35, 30], [50, 10], [40, -15], [20, -35], [10, 5], [-15, 15], [-15, 35]]);
  // Australia
  drawContinent([[115, -20], [150, -15], [150, -38], [115, -35], [115, -20]]);
  // Antarctica
  drawContinent([[-180, -70], [180, -70], [180, -90], [-180, -90]]);

  // City lights
  ctx.fillStyle = "rgba(255, 225, 120, 0.8)";
  const cities = [
    [-74, 40.7], [-0.1, 51.5], [77.2, 28.6], [139.7, 35.7], [55.3, 25.3],
    [103.8, 1.3], [121.5, 31.2], [-118.2, 34.0], [2.3, 48.8], [151.2, -33.8]
  ];
  cities.forEach(([lon, lat]) => {
    const px = (lon / 360 + 0.5) * 2048;
    const py = (-lat / 180 + 0.5) * 1024;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ── Lat/Lon to 3D Coordinates ──────────────────────────────── */
export function latLonToVec3(lat, lon, r = 1) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  ];
}

export function latLonToVec3_obj(lat, lon, r = 1) {
  const [x, y, z] = latLonToVec3(lat, lon, r);
  return new THREE.Vector3(x, y, z);
}

/* ── Great-Circle Bezier Curve Path ─────────────────────────── */
function buildArcPoints(fromLatLon, toLatLon, segments = 100) {
  const start = latLonToVec3_obj(...fromLatLon, 1.015);
  const end   = latLonToVec3_obj(...toLatLon,   1.015);
  const distance = start.distanceTo(end);
  const arcAltitude = 1.0 + Math.min(0.7, Math.max(0.18, distance * 0.45));
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(arcAltitude);
  return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(segments);
}

/* ── Realistic Textured Earth Layer ─────────────────────────── */
function RealisticEarthMesh({ mode }) {
  const globeGroupRef = useRef();
  const cloudsRef     = useRef();
  const [proceduralTexture] = useState(() => createProceduralEarthTexture());

  // Texture state with graceful network handling
  const [earthMap, setEarthMap]     = useState(null);
  const [nightMap, setNightMap]     = useState(null);
  const [bumpMap, setBumpMap]       = useState(null);
  const [cloudsMap, setCloudsMap]   = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    loader.load(
      mode === "night" ? NIGHT_TEXTURE_URL : EARTH_TEXTURE_URL,
      (tex) => setEarthMap(tex),
      undefined,
      () => setEarthMap(proceduralTexture)
    );

    loader.load(NIGHT_TEXTURE_URL, (tex) => setNightMap(tex), undefined, () => {});
    loader.load(TOPOLOGY_MAP_URL,  (tex) => setBumpMap(tex), undefined, () => {});
    loader.load(CLOUDS_TEXTURE_URL,(tex) => setCloudsMap(tex), undefined, () => {});
  }, [mode, proceduralTexture]);

  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.035;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.048;
    }
  });

  const activeTexture = earthMap || proceduralTexture;

  return (
    <group ref={globeGroupRef}>
      {/* 1. Core Earth Sphere with Continents and Oceans */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial
          map={activeTexture}
          bumpMap={bumpMap}
          bumpScale={0.035}
          roughness={0.65}
          metalness={0.15}
          emissive={nightMap && mode === "night" ? new THREE.Color("#ffe57f") : new THREE.Color("#050c1a")}
          emissiveMap={nightMap && mode === "night" ? nightMap : null}
          emissiveIntensity={mode === "night" ? 0.85 : 0.15}
        />
      </Sphere>

      {/* 2. Floating Cloud Layer */}
      {cloudsMap && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.018, 48, 48]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. Oceanic Specular Water Glow */}
      <Sphere args={[1.002, 36, 36]}>
        <meshBasicMaterial
          color="#06B6D4"
          wireframe
          transparent
          opacity={0.06}
        />
      </Sphere>

      {/* 4. Atmospheric Rayleigh Scattering Halo */}
      <Sphere args={[1.08, 36, 36]}>
        <meshBasicMaterial
          color="#06B6D4"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      <Sphere args={[1.14, 32, 32]}>
        <meshBasicMaterial
          color="#4F46E5"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}

/* ── Animated Flight Path & Cruising Aircraft ───────────────── */
function FlightPathTrajectory({ from, to }) {
  const arcPoints = useMemo(() => buildArcPoints(from, to, 100), [from[0], from[1], to[0], to[1]]);
  const curve = useMemo(() => {
    const start = latLonToVec3_obj(...from, 1.015);
    const end   = latLonToVec3_obj(...to,   1.015);
    const distance = start.distanceTo(end);
    const arcAltitude = 1.0 + Math.min(0.7, Math.max(0.18, distance * 0.45));
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(arcAltitude);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [from[0], from[1], to[0], to[1]]);

  const planeRef    = useRef();
  const beaconRef   = useRef();
  const progressRef = useRef(0);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(arcPoints.flatMap(p => [p.x, p.y, p.z]));
    const col = new Float32Array(
      arcPoints.flatMap((_, i) => {
        const t  = i / (arcPoints.length - 1);
        const c1 = new THREE.Color("#4F46E5");
        const c2 = new THREE.Color("#06B6D4");
        const c  = c1.lerp(c2, t);
        return [c.r, c.g, c.b];
      })
    );
    return { positions: pos, colors: col };
  }, [arcPoints]);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.2) % 1;
    if (planeRef.current && curve) {
      const pos = curve.getPointAt(progressRef.current);
      planeRef.current.position.copy(pos);

      // Point aircraft towards flight tangent
      const tangent = curve.getTangentAt(progressRef.current).normalize();
      planeRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    }
  });

  return (
    <group>
      {/* Dim ghost trail */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#1e293b" transparent opacity={0.35} />
      </line>

      {/* Iridescent glowing active flight path */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.95} linewidth={2.5} />
      </line>

      {/* Origin pulsating beacon */}
      <group position={latLonToVec3(...from, 1.02)}>
        <mesh>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color="#06B6D4" />
        </mesh>
        <mesh>
          <ringGeometry args={[0.03, 0.045, 24]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Destination pulsating beacon */}
      <group position={latLonToVec3(...to, 1.02)}>
        <mesh>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color="#818CF8" />
        </mesh>
        <mesh>
          <ringGeometry args={[0.03, 0.045, 24]} />
          <meshBasicMaterial color="#818CF8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Cruising Jet Marker */}
      <group ref={planeRef}>
        <mesh>
          <coneGeometry args={[0.016, 0.045, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#06B6D4" emissiveIntensity={0.8} />
        </mesh>
        <pointLight color="#06B6D4" intensity={1.5} distance={0.3} />
      </group>
    </group>
  );
}

/* ── Continents & Oceans 3D Spatial HUD Labels ──────────────── */
const CONTINENT_LABELS = [
  { name: "PACIFIC OCEAN",  lat: 0,   lon: -160, color: "#38bdf8" },
  { name: "ATLANTIC OCEAN", lat: 15,  lon: -35,  color: "#38bdf8" },
  { name: "INDIAN OCEAN",   lat: -15, lon: 75,   color: "#38bdf8" },
  { name: "ASIA",           lat: 48,  lon: 95,   color: "#a5b4fc" },
  { name: "EUROPE",         lat: 52,  lon: 15,   color: "#a5b4fc" },
  { name: "AFRICA",         lat: 5,   lon: 20,   color: "#a5b4fc" },
  { name: "NORTH AMERICA",  lat: 45,  lon: -100, color: "#a5b4fc" },
  { name: "SOUTH AMERICA",  lat: -15, lon: -60,  color: "#a5b4fc" },
  { name: "AUSTRALIA",      lat: -25, lon: 135,  color: "#a5b4fc" },
];

function SpatialGeoLabels({ visible }) {
  if (!visible) return null;

  return (
    <group>
      {CONTINENT_LABELS.map((item) => (
        <group key={item.name} position={latLonToVec3(item.lat, item.lon, 1.025)}>
          <Html distanceFactor={4} center className="pointer-events-none select-none">
            <div
              className="text-xs font-extrabold tracking-widest mono px-2 py-0.5 rounded-full"
              style={{
                color: item.color,
                background: "rgba(10, 15, 30, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

/* ── Main Globe Component ───────────────────────────────────── */
export default function Globe3D({
  from = [28.6, 77.2],
  to = [51.5, -0.12],
  themeMode = "satellite",
  showLabels = true
}) {
  const [mode, setMode] = useState(themeMode);
  const [labels, setLabels] = useState(showLabels);

  return (
    <div className="w-full h-full relative select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 2.75], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]}   intensity={1.4} color="#ffffff" />
        <pointLight position={[-6, -4, -6]}      intensity={0.5} color="#4F46E5" />
        <pointLight position={[0, 6, -4]}       intensity={0.4} color="#06B6D4" />

        <Suspense fallback={null}>
          <RealisticEarthMesh mode={mode} />
          <FlightPathTrajectory from={from} to={to} />
          <SpatialGeoLabels visible={labels} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          maxDistance={4.2}
          minDistance={1.4}
          enablePan={false}
          autoRotate={false}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
        />
      </Canvas>

      {/* Floating 3D Globe Mode Switcher */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 glass p-1 rounded-2xl border border-white/10 shadow-xl">
        {[
          { id: "satellite", label: "Satellite Day" },
          { id: "night",     label: "Night Lights" },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setMode(btn.id)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold mono transition-all cursor-pointer ${
              mode === btn.id
                ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {btn.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setLabels(!labels)}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold mono transition-all cursor-pointer ${
            labels
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/40"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          {labels ? "Labels ON" : "Labels OFF"}
        </button>
      </div>
    </div>
  );
}
