// The scroll world: a shader-gradient landscape (ruucm/shadergradient) that the camera swings
// around as you move between chapters, with the Ayomide mark floating in front of it as a
// solid glass object (drei MeshTransmissionMaterial) that refracts the gradient behind it.

import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial, PerformanceMonitor } from '@react-three/drei';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import * as THREE from 'three';
import { onChapter } from '../chapters.js';
import { PALETTE, STOPS } from './stops.js';

// The mark from public/assets/logo-mark.svg (a chevron over a wheel hub), rebuilt as shapes
function markGeometry() {
    const s = 1 / 50;
    const p = (x, y) => [(x - 50) * s, (50 - y) * s];
    const chevron = new THREE.Shape();
    [[50, 4], [94, 92], [72, 92], [50, 46], [28, 92], [6, 92]].forEach(([x, y], i) => {
        const [a, b] = p(x, y);
        i ? chevron.lineTo(a, b) : chevron.moveTo(a, b);
    });
    chevron.closePath();
    const hub = new THREE.Shape();
    const [cx, cy] = p(50, 78);
    hub.absarc(cx, cy, 10 * s, 0, Math.PI * 2, false);

    const geometry = new THREE.ExtrudeGeometry([chevron, hub], {
        depth: 0.34,
        bevelEnabled: true,
        bevelThickness: 0.09,
        bevelSize: 0.045,
        bevelSegments: 10,
        curveSegments: 64,
    });
    geometry.center();
    geometry.computeVertexNormals();
    return geometry;
}

const DEPTH = 1.6; // how far in front of the camera the mark floats: nearer than the gradient surface

function GlassMark({ reduced, compact }) {
    const camera = useThree((s) => s.camera);
    const geometry = useMemo(markGeometry, []);
    const rig = useRef();
    const mesh = useRef();
    const material = useRef();
    const env = useRef(null);
    const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
    const [shown, setShown] = useState(true);

    useEffect(() => {
        const move = (e) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', move, { passive: true });
        return () => window.removeEventListener('pointermove', move);
    }, []);

    useFrame((state, delta) => {
        // Hero progress: 0 at the top of the page, 1 once the hero has scrolled away
        const t = window.scrollY / window.innerHeight;
        const visible = t < 1.3;
        if (visible !== shown) setShown(visible);
        // Keep the studio lighting on the glass only; on the whole scene it washes out the gradient
        if (state.scene.environment) {
            env.current = state.scene.environment;
            state.scene.environment = null;
        }
        if (!rig.current || !mesh.current) return;
        if (material.current && env.current && material.current.envMap !== env.current) {
            material.current.envMap = env.current;
            material.current.envMapIntensity = 1.4;
            material.current.needsUpdate = true;
        }

        // Ride along with the camera, which the gradient's controls keep moving
        rig.current.position.copy(camera.position);
        rig.current.quaternion.copy(camera.quaternion);

        const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * DEPTH;
        const halfW = halfH * camera.aspect;
        const narrow = camera.aspect < 0.9;
        // Wide screens: beside the headline. Phones: in the gap above it.
        const size = narrow ? halfH * 0.25 : Math.min(halfH * 0.62, halfW * 0.3);
        const x = narrow ? halfW * 0.38 : halfW * 0.5;
        const y = (narrow ? halfH * 0.36 : halfH * 0.04) + t * halfH * 2.4;

        const p = pointer.current;
        const k = Math.min(1, delta * 4);
        p.sx += (p.x - p.sx) * k;
        p.sy += (p.y - p.sy) * k;

        const m = mesh.current;
        m.position.set(x, y, -DEPTH);
        m.scale.setScalar(size);
        const time = reduced ? 0 : state.clock.elapsedTime;
        m.rotation.y = 0.35 + Math.sin(time * 0.45) * 0.35 + p.sx * 0.45 + t * 2.2;
        m.rotation.x = -p.sy * 0.3 + Math.sin(time * 0.6) * 0.07;
        m.rotation.z = Math.sin(time * 0.3) * 0.04;
    });

    return (
        <group ref={rig}>
            {shown && (
                <mesh ref={mesh} geometry={geometry}>
                    <MeshTransmissionMaterial
                        ref={material}
                        backside
                        backsideThickness={0.6}
                        samples={compact ? 4 : 8}
                        resolution={compact ? 384 : 768}
                        transmission={1}
                        thickness={1.1}
                        roughness={0.02}
                        ior={1.45}
                        chromaticAberration={0.35}
                        anisotropicBlur={0.08}
                        distortion={0.3}
                        distortionScale={0.35}
                        temporalDistortion={reduced ? 0 : 0.08}
                        clearcoat={1}
                        attenuationDistance={4}
                        attenuationColor="#fff1dc"
                        color="#ffffff"
                    />
                </mesh>
            )}
        </group>
    );
}

// Studio light built from shapes, so nothing is downloaded at runtime
function Studio() {
    return (
        <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={3} color="#fff4e2" position={[0, 4, -2]} scale={[8, 1.2, 1]} />
            <Lightformer form="rect" intensity={2} color={PALETTE.violet} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
            <Lightformer form="rect" intensity={2.5} color={PALETTE.straw} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
            <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 0, 6]} scale={3} />
        </Environment>
    );
}

class Boundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch() { document.documentElement.classList.add('no-webgl'); }
    render() { return this.state.failed ? null : this.props.children; }
}

// Watches the frame rate. A device that can't keep up first drops resolution, then loses the
// glass mark (the most expensive piece: it renders the scene a second time every frame).
function Adaptive({ onStruggle }) {
    const setDpr = useThree((s) => s.setDpr);
    const drops = useRef(0);
    return (
        <PerformanceMonitor
            bounds={() => [40, 60]}
            flipflops={3}
            onDecline={() => {
                drops.current += 1;
                setDpr(drops.current === 1 ? 0.8 : 0.6);
                if (drops.current >= 2) onStruggle();
            }}
            onFallback={() => { setDpr(0.6); onStruggle(); }}
        />
    );
}

export default function World({ reduced, compact }) {
    const [stop, setStop] = useState(STOPS[0]);
    const [lite, setLite] = useState(false);
    useEffect(() => onChapter((c) => setStop(STOPS[c.index] ?? STOPS[0])), []);

    return (
        <Boundary>
            <ShaderGradientCanvas
                style={{ position: 'absolute', inset: 0 }}
                pixelDensity={compact ? 0.9 : 1.25}
                fov={45}
                pointerEvents="none"
                lazyLoad={false}
                powerPreference="high-performance"
            >
                <ShaderGradient
                    control="props"
                    type="waterPlane"
                    animate={reduced ? 'off' : 'on'}
                    uTime={0}
                    uSpeed={0.12}
                    uStrength={2.2}
                    uDensity={1.2}
                    uFrequency={5.5}
                    uAmplitude={0}
                    color1={PALETTE.violet}
                    color2={PALETTE.bronze}
                    color3={PALETTE.ink}
                    lightType="3d"
                    brightness={0.85}
                    reflection={0.1}
                    grain="off"
                    cameraZoom={1}
                    smoothTime={reduced ? 0 : 1.1}
                    {...stop}
                />
                <Adaptive onStruggle={() => setLite(true)} />
                <Studio />
                {!lite && <GlassMark reduced={reduced} compact={compact} />}
            </ShaderGradientCanvas>
        </Boundary>
    );
}
