import { useEffect, useRef } from "react";
import * as THREE from "three";

export function TideDefense3DScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071018);
    scene.fog = new THREE.FogExp2(0x071018, 0.028);
    const camera = new THREE.PerspectiveCamera(42, 16 / 7, 0.1, 200);
    camera.position.set(14, 8, 18);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);
    const cold = new THREE.DirectionalLight(0xb8e4f0, 3.4);
    cold.position.set(-10, 12, 4);
    cold.castShadow = true;
    scene.add(cold);
    const warning = new THREE.PointLight(0xe25343, 28, 30, 2);
    warning.position.set(4, 3, -2);
    scene.add(warning);
    const ambient = new THREE.HemisphereLight(0x8fbfd0, 0x071018, 2.5);
    scene.add(ambient);

    const oceanGeometry = new THREE.PlaneGeometry(70, 70, 72, 72);
    oceanGeometry.rotateX(-Math.PI / 2);
    const ocean = new THREE.Mesh(oceanGeometry, new THREE.MeshStandardMaterial({ color: 0x0b2635, roughness: 0.42, metalness: 0.55 }));
    ocean.receiveShadow = true;
    root.add(ocean);
    const original = Float32Array.from(oceanGeometry.attributes.position.array as ArrayLike<number>);

    const wall = new THREE.Group();
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x28333a, metalness: 0.85, roughness: 0.46 });
    for (let index = -4; index <= 4; index += 1) {
      const segment = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4 + Math.abs(index % 2) * 0.35, 0.8), wallMaterial);
      segment.position.set(index * 2.3, segment.geometry.parameters.height / 2, -4.2);
      segment.castShadow = true;
      segment.receiveShadow = true;
      wall.add(segment);
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0x6de2d0, emissive: 0x1a756b, emissiveIntensity: 2 }));
      beacon.position.set(index * 2.3, 3.2, -4.2);
      wall.add(beacon);
    }
    root.add(wall);

    const mech = new THREE.Group();
    const crimson = new THREE.MeshStandardMaterial({ color: 0x5d1d1e, metalness: 0.85, roughness: 0.38 });
    const blackSteel = new THREE.MeshStandardMaterial({ color: 0x10171b, metalness: 0.95, roughness: 0.35 });
    const core = new THREE.MeshStandardMaterial({ color: 0x5ac9db, emissive: 0x167b99, emissiveIntensity: 3.5, metalness: 0.55, roughness: 0.2 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.8, 0.78), crimson); torso.position.y = 2.8; mech.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.58, 0.62), blackSteel); head.position.y = 4.05; mech.add(head);
    const reactor = new THREE.Mesh(new THREE.CircleGeometry(0.27, 24), core); reactor.position.set(0, 2.86, 0.405); mech.add(reactor);
    [-0.58, 0.58].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.8, 0.46), blackSteel); leg.position.set(x, 1.05, 0); mech.add(leg);
      const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.48, 0.88), crimson); shoulder.position.set(x * 1.62, 3.45, 0); mech.add(shoulder);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.3, 0.36), blackSteel); arm.position.set(x * 1.84, 2.45, 0); mech.add(arm);
    });
    mech.position.set(0.2, 0, -0.8); mech.scale.setScalar(0.92); root.add(mech);

    const pressure = new THREE.Group();
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x4aa8b3, transparent: true, opacity: 0.32, wireframe: true });
    for (let index = 0; index < 4; index += 1) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(2.4 + index * 0.34, 0.022, 6, 72, Math.PI * 1.16), edgeMaterial);
      arc.rotation.set(Math.PI / 2.2, 0.28, -0.22);
      arc.position.set(5.8, 2.3, -5.5);
      pressure.add(arc);
    }
    root.add(pressure);

    const rainCount = 420;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let index = 0; index < rainCount; index += 1) { rainPositions[index * 3] = (Math.random() - 0.5) * 28; rainPositions[index * 3 + 1] = Math.random() * 12; rainPositions[index * 3 + 2] = (Math.random() - 0.5) * 22; }
    const rainGeometry = new THREE.BufferGeometry(); rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
    const rain = new THREE.Points(rainGeometry, new THREE.PointsMaterial({ color: 0x8bb5c7, size: 0.035, transparent: true, opacity: 0.58 })); root.add(rain);

    const target = new THREE.Vector3(0, 2.0, -2.0);
    let yaw = -0.12; let pitch = -0.04; let distance = 1; let dragging = false; let lastX = 0; let lastY = 0; let frame = 0;
    const resize = () => { const width = host.clientWidth; const height = host.clientHeight; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
    const pointerDown = (event: PointerEvent) => { dragging = true; lastX = event.clientX; lastY = event.clientY; host.setPointerCapture(event.pointerId); };
    const pointerMove = (event: PointerEvent) => { if (!dragging) return; yaw += (event.clientX - lastX) * 0.006; pitch = THREE.MathUtils.clamp(pitch + (event.clientY - lastY) * 0.004, -0.38, 0.2); lastX = event.clientX; lastY = event.clientY; };
    const pointerUp = () => { dragging = false; };
    const wheel = (event: WheelEvent) => { event.preventDefault(); distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.001, 0.72, 1.45); };
    host.addEventListener("pointerdown", pointerDown); host.addEventListener("pointermove", pointerMove); host.addEventListener("pointerup", pointerUp); host.addEventListener("wheel", wheel, { passive: false });
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      root.rotation.y += dragging ? 0 : (yaw - root.rotation.y) * 0.035;
      root.rotation.x += dragging ? 0 : (pitch - root.rotation.x) * 0.035;
      camera.position.lerp(new THREE.Vector3(14 * distance, 8 * distance, 18 * distance), 0.04);
      camera.lookAt(target);
      const position = oceanGeometry.attributes.position;
      for (let index = 0; index < position.count; index += 1) { const x = original[index * 3]; const z = original[index * 3 + 2]; position.setY(index, Math.sin(x * 0.38 + t * 1.1) * 0.11 + Math.cos(z * 0.25 + t * 0.7) * 0.08); }
      position.needsUpdate = true; oceanGeometry.computeVertexNormals();
      rainGeometry.translate(0.032, -0.19, 0); if (t % 2 < 0.02) { const p = rainGeometry.attributes.position; for (let i = 0; i < p.count; i += 1) if (p.getY(i) < -1) p.setY(i, 11); p.needsUpdate = true; }
      pressure.rotation.z = Math.sin(t * 0.45) * 0.03; reactor.rotation.z = Math.sin(t * 2) * 0.04;
      renderer.render(scene, camera); frame = requestAnimationFrame(tick);
    }; tick();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); host.removeEventListener("pointerdown", pointerDown); host.removeEventListener("pointermove", pointerMove); host.removeEventListener("pointerup", pointerUp); host.removeEventListener("wheel", wheel); oceanGeometry.dispose(); rainGeometry.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, []);

  return <div ref={hostRef} className="h-[330px] w-full cursor-grab overflow-hidden bg-[#071018] active:cursor-grabbing" aria-label="2042杭州湾海防线三维预览" />;
}
