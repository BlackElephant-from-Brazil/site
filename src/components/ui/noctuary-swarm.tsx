'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * <NoctuarySwarm> — enxame de "traças" que orbita um candeeiro, seguindo o
 * cursor (uma segunda luz mais fraca). Reprodução fiel do modelo descrito no
 * guia de fable-25/noctuary: ~460 agentes num único InstancedMesh (1 draw call),
 * asas a bater no vertex shader (fase/velocidade por instância), voo por
 * fototaxia (atração ao candeeiro que cresce com a distância + órbita tangencial
 * num eixo inclinado + deriva de senos + repulsão de curto alcance). Metade do
 * enxame persegue a luz do cursor (halo + PointLight visíveis) e volta a casa
 * quando o cursor pára.
 *
 * Wrapper endurecido (igual aos outros WebGL da LP): dimensiona-se ao contentor,
 * cancela rAF + dispose no unmount, pausa fora do ecrã / com document.hidden,
 * e respeita prefers-reduced-motion (enxame imóvel, 1 frame).
 */
interface NoctuarySwarmProps {
  className?: string;
}

function glowTexture(inner: string, mid: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, 'rgba(155,140,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

function mothTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d')!;
  x.translate(64, 64);
  x.filter = 'blur(1.1px)';
  const wing = (mx: number) => {
    x.save();
    x.scale(mx, 1);
    // asa dianteira (triangular, varrida) — taupe pálido
    const g = x.createLinearGradient(0, -8, 42, 12);
    g.addColorStop(0, 'rgba(206,198,184,0.96)');
    g.addColorStop(1, 'rgba(150,140,150,0.12)');
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(2, -12);
    x.quadraticCurveTo(32, -15, 42, 3);
    x.quadraticCurveTo(26, 11, 5, 11);
    x.closePath();
    x.fill();
    // asa traseira (mais pequena)
    x.fillStyle = 'rgba(172,162,158,0.55)';
    x.beginPath();
    x.moveTo(3, 7);
    x.quadraticCurveTo(23, 15, 20, 27);
    x.quadraticCurveTo(8, 27, 2, 17);
    x.closePath();
    x.fill();
    x.restore();
  };
  wing(1);
  wing(-1);
  // corpo + cabeça
  x.filter = 'none';
  x.fillStyle = 'rgba(58,52,46,0.92)';
  x.beginPath();
  x.ellipse(0, 3, 3.1, 14, 0, 0, Math.PI * 2);
  x.fill();
  x.beginPath();
  x.arc(0, -13, 2.9, 0, Math.PI * 2);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export function NoctuarySwarm({ className }: NoctuarySwarmProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const N = window.innerWidth < 760 ? 260 : 460;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0b0a12, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0a12, 0.03);

    const LAMP = new THREE.Vector3(3.6, 3.35, 0);
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
    // O enquadramento depende do aspect (desktop: candeeiro à direita do texto;
    // telemóvel: candeeiro centrado em cima) e é aplicado em resize().

    // ---- luzes ----
    const lampLight = new THREE.PointLight(0xbfa9ff, 90, 55, 2);
    lampLight.position.copy(LAMP);
    scene.add(lampLight);
    scene.add(new THREE.AmbientLight(0x241f33, 1.1));

    // ---- candeeiro (poste + lâmpada + halo) ----
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.07, 3.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x1b1826, roughness: 0.7 })
    );
    post.position.set(LAMP.x, LAMP.y - 1.65, LAMP.z);
    scene.add(post);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xf2ecff })
    );
    bulb.position.copy(LAMP);
    scene.add(bulb);

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture('rgba(244,238,255,.95)', 'rgba(155,140,255,.32)'),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      })
    );
    glow.position.copy(LAMP);
    glow.scale.setScalar(7.5);
    scene.add(glow);

    // ---- chão + relva silhueta ----
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0x14111f, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // lâmina: fita afunilada até à ponta com curvatura para a frente (silhueta
    // orgânica, não um retângulo). O vento é injetado no vertex shader.
    const bladeGeo = (() => {
      const SEG = 6;
      const posArr: number[] = [];
      const uvArr: number[] = [];
      const idxArr: number[] = [];
      for (let s = 0; s <= SEG; s++) {
        const t = s / SEG;
        const half = 0.042 * (1 - t * 0.94); // afunila até quase um ponto
        const bend = t * t * 0.42; // curva baked (varia via rotação/escala por instância)
        posArr.push(-half, t, bend, half, t, bend);
        uvArr.push(0, t, 1, t);
      }
      for (let s = 0; s < SEG; s++) {
        const a = s * 2;
        idxArr.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      const g = new THREE.BufferGeometry();
      g.setIndex(idxArr);
      g.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
      return g;
    })();

    // moitas (tufos de 7–12 lâminas com altura coerente) + lâminas soltas —
    // muito mais natural do que um scatter uniforme.
    type Blade = { x: number; z: number; h: number; w: number; yaw: number; lx: number; lz: number };
    const blades: Blade[] = [];
    for (let cI = 0; cI < 46; cI++) {
      const cx = LAMP.x - 7 + Math.random() * 14.5;
      const cz = -3 + Math.random() * 11;
      const ch = 0.4 + Math.random() * 0.5;
      const n = 7 + ((Math.random() * 6) | 0);
      for (let b = 0; b < n; b++) {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.random() * 0.3;
        blades.push({
          x: cx + Math.cos(a) * rr,
          z: cz + Math.sin(a) * rr,
          h: ch * (0.7 + Math.random() * 0.6),
          w: 0.75 + Math.random() * 0.55,
          yaw: Math.random() * Math.PI * 2,
          lx: (Math.random() - 0.5) * 0.55,
          lz: (Math.random() - 0.5) * 0.55,
        });
      }
    }
    for (let b = 0; b < 70; b++) {
      blades.push({
        x: LAMP.x - 7 + Math.random() * 14.5,
        z: -3 + Math.random() * 11,
        h: 0.18 + Math.random() * 0.45,
        w: 0.55 + Math.random() * 0.4,
        yaw: Math.random() * Math.PI * 2,
        lx: (Math.random() - 0.5) * 0.7,
        lz: (Math.random() - 0.5) * 0.7,
      });
    }
    const GRASS = blades.length;
    const grassPhase = new Float32Array(GRASS);
    const grassAmp = new Float32Array(GRASS);
    bladeGeo.setAttribute('aGrassPhase', new THREE.InstancedBufferAttribute(grassPhase, 1));
    bladeGeo.setAttribute('aGrassAmp', new THREE.InstancedBufferAttribute(grassAmp, 1));

    const grassMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, fog: true });
    grassMat.onBeforeCompile = (shader) => {
      shader.uniforms.uGrassTime = { value: 0 };
      grassMat.userData.shader = shader;
      shader.vertexShader =
        'attribute float aGrassPhase;\nattribute float aGrassAmp;\nuniform float uGrassTime;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `vec3 transformed = vec3(position);
           float sway = sin(uGrassTime * (1.0 + aGrassAmp * 4.0) + aGrassPhase)
                      + sin(uGrassTime * 2.3 + aGrassPhase * 1.7) * 0.4;
           transformed.x += sway * aGrassAmp * transformed.y * transformed.y;`
        );
    };

    const grass = new THREE.InstancedMesh(bladeGeo, grassMat, GRASS);
    {
      const gm = new THREE.Matrix4();
      const gq = new THREE.Quaternion();
      const ge = new THREE.Euler();
      const gs = new THREE.Vector3();
      const gp = new THREE.Vector3();
      const gCol = new THREE.Color();
      const darkBlade = new THREE.Color(0x0a0814);
      const litBlade = new THREE.Color(0x2b2342);
      blades.forEach((b, i) => {
        grassPhase[i] = Math.random() * Math.PI * 2;
        grassAmp[i] = 0.05 + Math.random() * 0.1;
        ge.set(b.lx, b.yaw, b.lz, 'YXZ');
        gq.setFromEuler(ge);
        gs.set(b.w, b.h, 0.8 + Math.random() * 0.4);
        gp.set(b.x, 0, b.z);
        gm.compose(gp, gq, gs);
        grass.setMatrixAt(i, gm);
        // cor por instância: quase preto longe, lilás ténue perto do candeeiro
        const k = Math.max(0, 1 - Math.hypot(b.x - LAMP.x, b.z - LAMP.z) / 8.5);
        gCol.lerpColors(darkBlade, litBlade, Math.min(1, k * k + Math.random() * 0.08));
        grass.setColorAt(i, gCol);
      });
    }
    grass.instanceMatrix.needsUpdate = true;
    if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
    scene.add(grass);

    // ---- enxame ----
    const mGeo = new THREE.PlaneGeometry(1, 1, 8, 1);
    const flapSpeed = new Float32Array(N);
    const phase = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      flapSpeed[i] = 9 + Math.random() * 9;
      phase[i] = Math.random() * Math.PI * 2;
    }
    mGeo.setAttribute('aFlapSpeed', new THREE.InstancedBufferAttribute(flapSpeed, 1));
    mGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));

    const mMat = new THREE.MeshLambertMaterial({
      map: mothTexture(),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      alphaTest: 0.02,
      fog: true,
    });
    mMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      mMat.userData.shader = shader;
      shader.vertexShader =
        'attribute float aFlapSpeed;\nattribute float aPhase;\nuniform float uTime;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `float flap = sin(uTime * aFlapSpeed + aPhase) * 1.05;
           float w = abs(position.x);
           vec3 transformed = vec3(cos(flap) * position.x, position.y, sin(flap) * w);`
        );
    };

    const swarm = new THREE.InstancedMesh(mGeo, mMat, N);
    swarm.frustumCulled = false;
    scene.add(swarm);

    // estado por traça
    const pos: THREE.Vector3[] = [];
    const vel: THREE.Vector3[] = [];
    const axis: THREE.Vector3[] = [];
    const orbitSign = new Float32Array(N);
    const home = new Float32Array(N);
    const size = new Float32Array(N);
    const lured = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const rad = 1.2 + Math.random() * 5.8;
      const rxy = Math.sqrt(1 - u * u);
      pos.push(
        new THREE.Vector3(
          LAMP.x + Math.cos(th) * rxy * rad,
          Math.max(0.5, LAMP.y + u * rad * 0.85),
          LAMP.z + Math.sin(th) * rxy * rad
        )
      );
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
      axis.push(new THREE.Vector3((Math.random() - 0.5) * 0.7, 1, (Math.random() - 0.5) * 0.7).normalize());
      orbitSign[i] = Math.random() < 0.5 ? -1 : 1;
      home[i] = Math.random();
      size[i] = 0.16 + Math.random() * 0.16;
      lured[i] = i < N * 0.5 ? 1 : 0;
    }

    // ---- cursor (segunda luz — VISÍVEL) ----
    const lurePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.0);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const lurePoint = new THREE.Vector3(LAMP.x, LAMP.y, 2);
    let lureStrength = 0;
    let lastMove = -1e9; // só ativa depois do primeiro movimento real do rato

    // A "pequena luz" que o cursor transporta: halo aditivo + PointLight que
    // ilumina as traças próximas. Acende ao mover e apaga-se quando o rato pára.
    const lureLight = new THREE.PointLight(0xcdbcff, 0, 12, 2);
    scene.add(lureLight);
    const lureGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture('rgba(240,233,255,.95)', 'rgba(158,140,255,.3)'),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      })
    );
    lureGlow.scale.setScalar(2.4);
    scene.add(lureGlow);

    const onPointer = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      ray.ray.intersectPlane(lurePlane, lurePoint);
      lastMove = performance.now();
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // ---- resize (também decide o enquadramento da câmara) ----
    const resize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      if (camera.aspect < 0.85) {
        // Ecrã estreito (telemóvel): centra o candeeiro EXATAMENTE (câmara no
        // mesmo x) e aproxima bastante (~9 vs ~14.5 no desktop) — o halo
        // ocupa muito mais do ecrã, o que lê como "mais luminoso" (a versão
        // anterior, mais recuada, deixava demasiado vazio escuro à volta).
        // O texto ocupa o fundo, ver CSS .lpg-noctuary no mobile.
        camera.position.set(LAMP.x, 3.0, 9);
        camera.lookAt(LAMP.x, 2.6, LAMP.z);
      } else {
        camera.position.set(-1.5, 2.4, 13.5);
        camera.lookAt(LAMP.x - 1.2, LAMP.y - 0.6, LAMP.z);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();

    // ---- loop ----
    const UP = new THREE.Vector3(0, 1, 0);
    const tmp = new THREE.Vector3();
    const tmp2 = new THREE.Vector3();
    const tmpL = new THREE.Vector3();
    const fwd = new THREE.Vector3();
    const right = new THREE.Vector3();
    const nrm = new THREE.Vector3();
    const m = new THREE.Matrix4();
    const sVec = new THREE.Vector3();
    let simT = 0;

    const step = (dt: number, now: number) => {
      simT += dt;
      const lureActive = now - lastMove < 2600;
      const target = lureActive ? 1 : 0;
      lureStrength += (target - lureStrength) * (1 - Math.pow(0.05, dt));

      for (let i = 0; i < N; i++) {
        const p = pos[i];
        const v = vel[i];
        // enquanto persegue a luz do cursor, a traça "esquece" o candeeiro —
        // senão a atração do candeeiro anulava a do cursor e nada se via.
        const lampW = lured[i] ? 1 - 0.78 * lureStrength : 1;
        tmp.copy(LAMP).sub(p);
        const d = tmp.length();
        tmp.multiplyScalar(1 / (d || 1));
        const attract = Math.min(2.6, 0.55 + d * 0.38) * lampW;
        v.addScaledVector(tmp, attract * dt * 3.2);
        tmp2.crossVectors(axis[i], tmp).multiplyScalar((orbitSign[i] * 2.6 * lampW) / (1 + d * 0.5));
        v.addScaledVector(tmp2, dt * 3.2);
        if (d < 0.9) v.addScaledVector(tmp, -dt * 26);
        const t = simT * (1.4 + home[i]);
        v.x += Math.sin(t * 2.1 + i * 1.7) * dt * 3.4;
        v.y += Math.sin(t * 2.9 + i * 2.3) * dt * 2.6;
        v.z += Math.cos(t * 1.7 + i * 0.9) * dt * 3.4;
        if (lured[i] && lureStrength > 0.02) {
          tmpL.copy(lurePoint).sub(p);
          const dL = tmpL.length();
          tmpL.multiplyScalar(1 / (dL || 1));
          // atração mais forte que a do candeeiro + órbita apertada perto da
          // luz + repulsão de curto alcance (para não "colarem" no cursor)
          v.addScaledVector(tmpL, lureStrength * Math.min(3.6, 0.9 + dL * 0.55) * dt * 4.8);
          if (dL < 2.4) {
            tmp2.crossVectors(axis[i], tmpL).multiplyScalar((orbitSign[i] * 3.0) / (1 + dL));
            v.addScaledVector(tmp2, lureStrength * dt * 3.6);
          }
          if (dL < 0.32) v.addScaledVector(tmpL, -dt * 30);
        }
        const maxS = 3.4 + home[i] * 1.6 + (lured[i] ? lureStrength * 1.5 : 0);
        const minS = 1.2;
        const sp = v.length();
        if (sp > maxS) v.multiplyScalar(maxS / sp);
        else if (sp < minS && sp > 1e-4) v.multiplyScalar(minS / sp);
        p.addScaledVector(v, dt);
        if (p.y < 0.4) {
          p.y = 0.4;
          v.y = Math.abs(v.y);
        }

        // orientação: corpo (y local) segue a velocidade; normal (z) ~ cima
        fwd.copy(v);
        if (fwd.lengthSq() < 1e-4) fwd.set(0, 0, 1);
        else fwd.normalize();
        right.crossVectors(fwd, UP);
        if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
        else right.normalize();
        nrm.crossVectors(right, fwd).normalize();
        m.makeBasis(right, fwd, nrm);
        sVec.setScalar(size[i]);
        m.scale(sVec);
        m.setPosition(p.x, p.y, p.z);
        swarm.setMatrixAt(i, m);
      }
      swarm.instanceMatrix.needsUpdate = true;

      // a luz do cursor segue o ponto projetado e "respira" ligeiramente
      lureLight.position.copy(lurePoint);
      lureGlow.position.copy(lurePoint);
      lureLight.intensity = 30 * lureStrength * (1 + Math.sin(now * 0.013) * 0.15);
      lureGlow.material.opacity = 0.9 * lureStrength;
      lureGlow.scale.setScalar(2.1 + Math.sin(now * 0.006) * 0.25 + lureStrength * 0.6);

      const fl = 1 + Math.sin(now * 0.011) * 0.03 + Math.sin(now * 0.047) * 0.02;
      lampLight.intensity = 90 * fl;
      if (mMat.userData.shader) mMat.userData.shader.uniforms.uTime.value = simT;
      if (grassMat.userData.shader) grassMat.userData.shader.uniforms.uGrassTime.value = simT;
    };

    const renderStatic = () => {
      // reduced-motion / 1 frame: orienta as traças uma vez, sem animar
      for (let i = 0; i < N; i++) {
        fwd.copy(vel[i]).normalize();
        right.crossVectors(fwd, UP).normalize();
        nrm.crossVectors(right, fwd).normalize();
        m.makeBasis(right, fwd, nrm);
        sVec.setScalar(size[i]);
        m.scale(sVec);
        m.setPosition(pos[i].x, pos[i].y, pos[i].z);
        swarm.setMatrixAt(i, m);
      }
      swarm.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };

    let rafId = 0;
    let visible = true;
    let last = performance.now();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(container);

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible && !document.hidden) {
        step(dt, now);
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize);

    if (reduceMotion) {
      renderStatic();
    } else {
      renderStatic(); // "assenta" um frame antes de animar
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      renderer.dispose();
      mGeo.dispose();
      bladeGeo.dispose();
      scene.traverse((o) => {
        const anyO = o as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        anyO.geometry?.dispose?.();
        const mat = anyO.material;
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else mat?.dispose?.();
      });
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
