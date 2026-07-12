'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * <CityScene> — mini-cidade 3D noturna vista de cima (estilo expo virtual):
 * um ANFITEATRO central em socalcos com luzes de fila e palco iluminado,
 * bairros estruturados em grelha que se leem como construções (torres com
 * janelas acesas, blocos de acomodações, ruas de moradias com telhado),
 * um PARQUE VERDE com dois lagos orgânicos e arvoredo variado (pinheiros de
 * 3 andares, copadas, ciprestes), um PARQUE DE DIVERSÕES com roda-gigante,
 * montanha-russa com carrinho a andar e barraquinhas, avenidas de luz a
 * ligar tudo ao centro, poeira cintilante e névoa.
 * Navegação MÍNIMA: auto-rotação + arrastar (rato) para orbitar.
 *
 * Tudo unlit (sem luzes reais) para o look neon e para ser barato: janelas
 * são texturas de canvas multiplicadas pela cor do bairro por instância.
 * Wrapper endurecido como os outros WebGL da LP: dimensiona-se ao contentor,
 * cancela rAF + dispose no unmount, pausa fora do ecrã / document.hidden e
 * respeita prefers-reduced-motion (1 frame estático, sem auto-rotação).
 */
interface CitySceneProps {
  className?: string;
}

// RNG determinístico — a cidade é igual em cada carregamento.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function radialTexture(inner: string, mid: string, outer: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d')!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.4, mid);
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/** Fachada com grelha de janelas acesas (quentes/frias, algumas apagadas). */
function windowsTexture(rnd: () => number, cols: number, rows: number, litProb: number, w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  x.fillStyle = '#0a0d19';
  x.fillRect(0, 0, w, h);
  const cw = w / cols;
  const ch = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      if (rnd() > litProb) continue;
      const warm = rnd() < 0.72;
      const a = 0.3 + rnd() * 0.7;
      x.fillStyle = warm ? `rgba(255,213,150,${a.toFixed(2)})` : `rgba(165,215,255,${a.toFixed(2)})`;
      x.fillRect(cc * cw + cw * 0.18, r * ch + ch * 0.22, cw * 0.64, ch * 0.5);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/** Junta geometrias (position/normal/uv, indexadas ou não) numa só — árvores. */
function mergeGeos(geos: THREE.BufferGeometry[]) {
  let vCount = 0;
  let iCount = 0;
  for (const g of geos) {
    vCount += g.attributes.position.count;
    iCount += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(vCount * 3);
  const nrm = new Float32Array(vCount * 3);
  const uv = new Float32Array(vCount * 2);
  const idx = new Uint16Array(iCount);
  let vOff = 0;
  let iOff = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array as Float32Array, vOff * 3);
    nrm.set(g.attributes.normal.array as Float32Array, vOff * 3);
    uv.set(g.attributes.uv.array as Float32Array, vOff * 2);
    const gi = g.index;
    if (gi) {
      for (let k = 0; k < gi.count; k++) idx[iOff + k] = gi.getX(k) + vOff;
      iOff += gi.count;
    } else {
      // geometria não indexada (ex.: IcosahedronGeometry): índices sequenciais
      const n = g.attributes.position.count;
      for (let k = 0; k < n; k++) idx[iOff + k] = k + vOff;
      iOff += n;
    }
    vOff += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/** Contorno orgânico (blob) para os lagos — círculo deformado por senos. */
function blobShape(rnd: () => number, R: number) {
  const n = 18;
  const ph1 = rnd() * Math.PI * 2;
  const ph2 = rnd() * Math.PI * 2;
  const a1 = 0.2 + rnd() * 0.14;
  const a2 = 0.08 + rnd() * 0.1;
  const pts: THREE.Vector2[] = [];
  for (let k = 0; k < n; k++) {
    const th = (k / n) * Math.PI * 2;
    const r = R * (1 + a1 * Math.sin(3 * th + ph1) + a2 * Math.sin(5 * th + ph2));
    pts.push(new THREE.Vector2(Math.cos(th) * r, Math.sin(th) * r));
  }
  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x, pts[0].y);
  shape.splineThru(pts.slice(1).concat([pts[0]]));
  return shape;
}

export function CityScene({ className }: CitySceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080b1a, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1024, 0.011);

    // fundo em gradiente (céu noturno)
    {
      const c = document.createElement('canvas');
      c.width = 4;
      c.height = 256;
      const x = c.getContext('2d')!;
      const g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#070a18');
      g.addColorStop(0.55, '#0d1430');
      g.addColorStop(1, '#182247');
      x.fillStyle = g;
      x.fillRect(0, 0, 4, 256);
      const t = new THREE.CanvasTexture(c);
      scene.background = t;
    }

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 400);

    // ---- chão ----
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshBasicMaterial({ color: 0x070a18, fog: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    const rnd = mulberry32(20200131);

    // brilho colorido a poisar no chão de cada zona
    const addGlow = (x: number, z: number, color: number, size: number, opacity: number) => {
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: radialTexture('rgba(255,255,255,0.85)', `#${color.toString(16).padStart(6, '0')}`, 'rgba(0,0,0,0)'),
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: true,
        })
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.set(x, 0.05, z);
      glow.scale.setScalar(size);
      scene.add(glow);
      return glow;
    };

    // ============ BAIRROS EM GRELHA (leem-se como construções) ============
    type Lot = { x: number; z: number; w: number; d: number; h: number; yaw: number; color: THREE.Color };
    const towerLots: Lot[] = [];
    const houseLots: Lot[] = [];

    type BuildDistrict = {
      kind: 'towers' | 'slabs' | 'houses';
      x: number;
      z: number;
      color: number;
      rows: number;
      cols: number;
      cell: number;
      rot: number;
    };
    const buildDistricts: BuildDistrict[] = [
      { kind: 'towers', x: 0, z: -27, color: 0x2ec4ff, rows: 5, cols: 5, cell: 2.7, rot: 0.12 }, // baixa de torres
      { kind: 'slabs', x: -23, z: 14, color: 0xff3ea5, rows: 4, cols: 5, cell: 2.9, rot: -0.35 }, // acomodações
      { kind: 'slabs', x: 23, z: 14, color: 0xff8a2b, rows: 5, cols: 4, cell: 2.9, rot: 0.42 }, // acomodações
      { kind: 'houses', x: -36, z: -12, color: 0xffc46b, rows: 5, cols: 6, cell: 1.8, rot: 0.3 }, // moradias
      { kind: 'houses', x: -14, z: 34, color: 0xff5b7a, rows: 5, cols: 5, cell: 1.8, rot: -0.2 }, // moradias
    ];
    const parkGreen = { x: 36, z: -7, color: 0x39e07a, radius: 6.5 };
    const parkFair = { x: 13, z: 33, color: 0x2ee6c6, radius: 7.2 };
    const parks = [parkGreen, parkFair];

    for (const d of buildDistricts) {
      const cosR = Math.cos(d.rot);
      const sinR = Math.sin(d.rot);
      const base = new THREE.Color(d.color);
      for (let r = 0; r < d.rows; r++) {
        for (let c = 0; c < d.cols; c++) {
          if (rnd() < (d.kind === 'houses' ? 0.08 : 0.14)) continue; // lote vazio
          const lx = (c - (d.cols - 1) / 2) * d.cell + (rnd() - 0.5) * 0.4;
          const lz = (r - (d.rows - 1) / 2) * d.cell + (rnd() - 0.5) * 0.4;
          const x = d.x + lx * cosR - lz * sinR;
          const z = d.z + lx * sinR + lz * cosR;
          let w: number;
          let dp: number;
          let h: number;
          let yaw = d.rot;
          if (d.kind === 'towers') {
            // torres mais altas no centro do bairro
            const e =
              Math.max(Math.abs(c - (d.cols - 1) / 2), Math.abs(r - (d.rows - 1) / 2)) /
              ((Math.max(d.cols, d.rows) - 1) / 2);
            w = 1.0 + rnd() * 0.5;
            dp = 1.0 + rnd() * 0.5;
            h = 2.2 + (1 - e) * 5.5 * (0.55 + rnd() * 0.75) + rnd() * 0.8;
          } else if (d.kind === 'slabs') {
            w = 1.9 + rnd() * 0.8;
            dp = 1.0 + rnd() * 0.35;
            h = 1.5 + rnd() * 1.7;
            if (rnd() < 0.5) yaw += Math.PI / 2;
          } else {
            w = 0.85 + rnd() * 0.35;
            dp = 0.85 + rnd() * 0.35;
            h = 0.5 + rnd() * 0.35;
            yaw += (rnd() - 0.5) * 0.15;
          }
          const col = base.clone().offsetHSL((rnd() - 0.5) * 0.04, (rnd() - 0.5) * 0.1, (rnd() - 0.5) * 0.18);
          const lot: Lot = { x, z, w, d: dp, h, yaw, color: col };
          if (d.kind === 'houses') houseLots.push(lot);
          else towerLots.push(lot);
        }
      }
      const gr = (Math.max(d.rows, d.cols) * d.cell) / 2 + 1.5;
      addGlow(d.x, d.z, d.color, gr * 2.3, 0.5);
    }

    // caixa com base no chão; grupos de faces: +x, -x, +y (topo), -y, +z, -z
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0);
    const roofMatDark = new THREE.MeshBasicMaterial({ color: 0x0c0f1e, fog: true });
    const facadeTexTowers = windowsTexture(rnd, 6, 12, 0.5, 64, 128);
    const facadeTexHouses = windowsTexture(rnd, 3, 3, 0.8, 48, 48);

    const makeBuildings = (lots: Lot[], tex: THREE.Texture) => {
      const facade = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: true });
      const mesh = new THREE.InstancedMesh(
        boxGeo,
        [facade, facade, roofMatDark, roofMatDark, facade, facade],
        lots.length
      );
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const s = new THREE.Vector3();
      const p = new THREE.Vector3();
      lots.forEach((lot, i) => {
        e.set(0, lot.yaw, 0);
        q.setFromEuler(e);
        s.set(lot.w, lot.h, lot.d);
        p.set(lot.x, 0, lot.z);
        m4.compose(p, q, s);
        mesh.setMatrixAt(i, m4);
        mesh.setColorAt(i, lot.color);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      scene.add(mesh);
      return mesh;
    };
    makeBuildings(towerLots, facadeTexTowers);
    makeBuildings(houseLots, facadeTexHouses);

    // telhados de 4 águas nas moradias (pirâmide alinhada com a casa)
    // raio 0.7071 → rodado 45°, a base quadrada tem meia-largura exatamente 0.5
    const roofGeo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4);
    roofGeo.translate(0, 0.5, 0);
    const roofMat = new THREE.MeshBasicMaterial({ color: 0x2b1a22, fog: true });
    const roofs = new THREE.InstancedMesh(roofGeo, roofMat, houseLots.length);
    {
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const s = new THREE.Vector3();
      const p = new THREE.Vector3();
      houseLots.forEach((lot, i) => {
        e.set(0, lot.yaw + Math.PI / 4, 0);
        q.setFromEuler(e);
        s.set(lot.w * 1.25, 0.35 + lot.h * 0.5, lot.d * 1.25);
        p.set(lot.x, lot.h, lot.z);
        m4.compose(p, q, s);
        roofs.setMatrixAt(i, m4);
      });
    }
    roofs.instanceMatrix.needsUpdate = true;
    scene.add(roofs);

    const sparkTex = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)');

    // ============ ÁRVORES (3 espécies + troncos partilhados) ============
    // pinheiro: 3 andares de cones; copada: blobs de icosaedro; cipreste: cone alto e estreito
    const pineGeo = mergeGeos([
      new THREE.ConeGeometry(0.5, 0.7, 7).translate(0, 0.65, 0),
      new THREE.ConeGeometry(0.38, 0.6, 7).translate(0, 1.02, 0),
      new THREE.ConeGeometry(0.26, 0.55, 7).translate(0, 1.45, 0),
    ]);
    const leafGeo = mergeGeos([
      new THREE.IcosahedronGeometry(0.42, 1).translate(0, 0.95, 0),
      new THREE.IcosahedronGeometry(0.3, 1).translate(0.3, 0.75, 0.08),
      new THREE.IcosahedronGeometry(0.28, 1).translate(-0.27, 0.8, -0.08),
      new THREE.IcosahedronGeometry(0.24, 1).translate(0.04, 1.2, -0.06),
    ]);
    const cypressGeo = new THREE.ConeGeometry(0.22, 1.3, 6);
    cypressGeo.translate(0, 0.95, 0);
    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.5, 5);
    trunkGeo.translate(0, 0.25, 0);

    type Tree = { x: number; z: number; s: number; species: 0 | 1 | 2; c: THREE.Color };
    const treeSpots: Tree[] = [];
    const treeColor = (species: 0 | 1 | 2) => {
      // copadas têm 25% de chance de folhagem de outono (âmbar)
      const base =
        species === 0 ? new THREE.Color(0x1e4a30) : species === 1
          ? new THREE.Color(rnd() < 0.25 ? 0x9a6b2c : 0x3f7038)
          : new THREE.Color(0x1a4a40);
      return base.offsetHSL((rnd() - 0.5) * 0.03, 0, (rnd() - 0.5) * 0.1);
    };

    // ============ PARQUE VERDE: dois lagos orgânicos + arvoredo ============
    const lakeMat = new THREE.MeshBasicMaterial({ color: 0x0e2f44, fog: true });
    const lake1 = { x: parkGreen.x - 1.3, z: parkGreen.z + 1.0, r: 2.7 };
    const lake2 = { x: parkGreen.x + 3.4, z: parkGreen.z - 2.9, r: 1.35 };
    for (const lk of [lake1, lake2]) {
      const mesh = new THREE.Mesh(new THREE.ShapeGeometry(blobShape(rnd, lk.r), 18), lakeMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(lk.x, 0.03, lk.z);
      scene.add(mesh);
      addGlow(lk.x, lk.z, 0x54d8ff, lk.r * 2.6, 0.26);
    }
    // cintilância na água
    {
      const wPts: number[] = [];
      for (let i = 0; i < 12; i++) {
        const lk = i < 8 ? lake1 : lake2;
        const a = rnd() * Math.PI * 2;
        const rr = rnd() * lk.r * 0.7;
        wPts.push(lk.x + Math.cos(a) * rr, 0.12, lk.z + Math.sin(a) * rr);
      }
      const wGeo = new THREE.BufferGeometry();
      wGeo.setAttribute('position', new THREE.Float32BufferAttribute(wPts, 3));
      scene.add(
        new THREE.Points(
          wGeo,
          new THREE.PointsMaterial({
            size: 0.24,
            map: sparkTex,
            color: 0xbfeaff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
            fog: true,
          })
        )
      );
    }
    // arvoredo do parque verde (mistura de espécies, a evitar os lagos)
    for (let i = 0; i < 40 && treeSpots.filter((t) => Math.hypot(t.x - parkGreen.x, t.z - parkGreen.z) < parkGreen.radius + 1).length < 26; i++) {
      const a = rnd() * Math.PI * 2;
      const rr = (0.2 + 0.8 * rnd()) * parkGreen.radius;
      const x = parkGreen.x + Math.cos(a) * rr;
      const z = parkGreen.z + Math.sin(a) * rr;
      if (Math.hypot(x - lake1.x, z - lake1.z) < lake1.r * 1.35) continue;
      if (Math.hypot(x - lake2.x, z - lake2.z) < lake2.r * 1.5) continue;
      const roll = rnd();
      const species: 0 | 1 | 2 = roll < 0.5 ? 0 : roll < 0.82 ? 1 : 2;
      treeSpots.push({ x, z, s: 0.75 + rnd() * 0.85, species, c: treeColor(species) });
    }
    addGlow(parkGreen.x, parkGreen.z, parkGreen.color, parkGreen.radius * 2.6, 0.5);

    // ============ PARQUE DE DIVERSÕES: roda + montanha-russa + barraquinhas ============
    addGlow(parkFair.x, parkFair.z, parkFair.color, parkFair.radius * 2.5, 0.5);
    // algumas árvores na orla da feira
    for (const a of [0.25, 0.85, 1.5, 2.1, 4.5, 5.1, 5.7]) {
      const rr = parkFair.radius * 0.92 + (rnd() - 0.5) * 0.8;
      const species: 0 | 1 | 2 = rnd() < 0.6 ? 0 : 1;
      treeSpots.push({
        x: parkFair.x + Math.cos(a) * rr,
        z: parkFair.z + Math.sin(a) * rr,
        s: 0.7 + rnd() * 0.6,
        species,
        c: treeColor(species),
      });
    }

    // --- roda-gigante ---
    const wheelCol = 0x2ee6c6;
    const wheelR = 3.1;
    const hubY = wheelR + 0.7;
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(parkFair.x + 4.0, 0, parkFair.z + 2.6);
    wheelGroup.rotation.y = 2.35;
    const rotor = new THREE.Group();
    rotor.position.set(0, hubY, 0);
    const wheelMat = new THREE.MeshBasicMaterial({ color: wheelCol, toneMapped: false, fog: true });
    rotor.add(new THREE.Mesh(new THREE.TorusGeometry(wheelR, 0.06, 8, 48), wheelMat));
    const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, wheelR * 2, 4);
    for (let k = 0; k < 6; k++) {
      const spoke = new THREE.Mesh(spokeGeo, wheelMat);
      spoke.rotation.z = (k / 6) * Math.PI;
      rotor.add(spoke);
    }
    // cabines: pontos luminosos na borda (rodam com o rotor)
    const cabN = 10;
    const cabPos = new Float32Array(cabN * 3);
    for (let k = 0; k < cabN; k++) {
      const a = (k / cabN) * Math.PI * 2;
      cabPos[k * 3] = Math.cos(a) * wheelR;
      cabPos[k * 3 + 1] = Math.sin(a) * wheelR;
      cabPos[k * 3 + 2] = 0;
    }
    const cabGeo = new THREE.BufferGeometry();
    cabGeo.setAttribute('position', new THREE.BufferAttribute(cabPos, 3));
    rotor.add(
      new THREE.Points(
        cabGeo,
        new THREE.PointsMaterial({
          size: 0.55,
          map: sparkTex,
          color: 0xfff2c8,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
          fog: true,
        })
      )
    );
    wheelGroup.add(rotor);
    // pernas de apoio em A
    const legGeo = new THREE.CylinderGeometry(0.05, 0.08, hubY + 0.3, 6);
    const legMat = new THREE.MeshBasicMaterial({ color: 0x18404a, fog: true });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.7, hubY / 2, 0);
    legL.rotation.z = -0.34;
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.7, hubY / 2, 0);
    legR.rotation.z = 0.34;
    wheelGroup.add(legL, legR);
    scene.add(wheelGroup);

    // --- montanha-russa: circuito fechado com subidas, queda e loop ---
    const coaster = new THREE.Group();
    coaster.position.set(parkFair.x - 1.8, 0, parkFair.z - 0.8);
    coaster.rotation.y = -0.4;
    scene.add(coaster);
    const coasterCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-4.8, 0.8, -2.2),
        new THREE.Vector3(-2.2, 2.6, -3.0),
        new THREE.Vector3(0.6, 4.3, -2.6), // pico principal
        new THREE.Vector3(3.2, 2.0, -2.0), // queda grande
        new THREE.Vector3(4.6, 0.9, -0.4),
        // loop vertical em saca-rolhas (círculo no plano X/Y com deriva em Z)
        new THREE.Vector3(5.4, 2.2, 0.2),
        new THREE.Vector3(4.6, 3.4, 0.55),
        new THREE.Vector3(3.8, 2.2, 0.9),
        new THREE.Vector3(4.6, 1.0, 1.25),
        // segunda colina (subida lenta) e regresso
        new THREE.Vector3(2.4, 4.6, 2.2),
        new THREE.Vector3(-0.4, 2.2, 2.6),
        new THREE.Vector3(-3.0, 1.2, 2.2),
        new THREE.Vector3(-5.0, 1.8, 0.2),
      ],
      true,
      'centripetal',
      0.5
    );
    const COASTER_HMAX = 4.6;
    const trackMat = new THREE.MeshBasicMaterial({ color: 0xff7ab8, toneMapped: false, fog: true });
    coaster.add(new THREE.Mesh(new THREE.TubeGeometry(coasterCurve, 260, 0.055, 6, true), trackMat));
    // pilares de suporte até ao chão
    const pillarGeo = new THREE.CylinderGeometry(0.035, 0.05, 1, 5);
    pillarGeo.translate(0, 0.5, 0);
    const pillarSpots: THREE.Vector3[] = [];
    for (let k = 0; k < 30; k++) {
      const p = coasterCurve.getPointAt(k / 30);
      if (p.y > 0.7) pillarSpots.push(p);
    }
    const pillars = new THREE.InstancedMesh(
      pillarGeo,
      new THREE.MeshBasicMaterial({ color: 0x1c4652, fog: true }),
      pillarSpots.length
    );
    {
      const m4 = new THREE.Matrix4();
      pillarSpots.forEach((p, i) => {
        m4.makeScale(1, p.y, 1);
        m4.setPosition(p.x, 0, p.z);
        pillars.setMatrixAt(i, m4);
      });
    }
    pillars.instanceMatrix.needsUpdate = true;
    coaster.add(pillars);
    // comboio de 3 vagões + farol
    const CARS = 3;
    const trainGeo = new THREE.BoxGeometry(0.2, 0.2, 0.36);
    const train = new THREE.InstancedMesh(
      trainGeo,
      new THREE.MeshBasicMaterial({ color: 0xffe9b8, toneMapped: false, fog: true }),
      CARS
    );
    coaster.add(train);
    const headlight = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: sparkTex,
        color: 0xfff0c0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        fog: false,
      })
    );
    headlight.scale.setScalar(1.1);
    coaster.add(headlight);
    // estado do comboio + colocação (também usada no frame estático inicial)
    let coastT = 0;
    const trainDummy = new THREE.Object3D();
    const trainAim = new THREE.Vector3();
    const placeTrain = () => {
      for (let j = 0; j < CARS; j++) {
        const tj = (coastT - j * 0.02 + 1) % 1;
        const p = coasterCurve.getPointAt(tj);
        const tan = coasterCurve.getTangentAt(tj);
        trainDummy.position.copy(p);
        trainAim.copy(p).add(tan);
        trainDummy.lookAt(trainAim);
        trainDummy.updateMatrix();
        train.setMatrixAt(j, trainDummy.matrix);
        if (j === 0) headlight.position.copy(p).y += 0.16;
      }
      train.instanceMatrix.needsUpdate = true;
    };
    placeTrain();
    const coasterLen = coasterCurve.getLength();

    // --- barraquinhas (5, telhados coloridos + luz) ---
    const stallDefs = [
      { dx: 0.6, dz: 5.4, c: 0xff5b5b },
      { dx: 5.6, dz: -0.8, c: 0xffc46b },
      { dx: 5.2, dz: 5.0, c: 0x9b6bff },
      { dx: -5.0, dz: 3.8, c: 0x2ec4ff },
      { dx: -0.8, dz: -5.6, c: 0xff8a2b },
    ];
    const stallBase = new THREE.InstancedMesh(
      boxGeo,
      new THREE.MeshBasicMaterial({ color: 0x4a4034, fog: true }),
      stallDefs.length
    );
    const stallRoof = new THREE.InstancedMesh(
      roofGeo,
      new THREE.MeshBasicMaterial({ toneMapped: false, fog: true }),
      stallDefs.length
    );
    {
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const s = new THREE.Vector3();
      const p = new THREE.Vector3();
      const stallCol = new THREE.Color();
      const stallLightPts: number[] = [];
      stallDefs.forEach((st, i) => {
        const sx = parkFair.x + st.dx;
        const sz = parkFair.z + st.dz;
        const yaw = rnd() * Math.PI;
        e.set(0, yaw, 0);
        q.setFromEuler(e);
        s.set(0.6, 0.5, 0.6);
        p.set(sx, 0, sz);
        m4.compose(p, q, s);
        stallBase.setMatrixAt(i, m4);
        e.set(0, yaw + Math.PI / 4, 0);
        q.setFromEuler(e);
        s.set(0.85, 0.42, 0.85);
        p.set(sx, 0.5, sz);
        m4.compose(p, q, s);
        stallRoof.setMatrixAt(i, m4);
        stallCol.setHex(st.c);
        stallRoof.setColorAt(i, stallCol);
        stallLightPts.push(sx, 1.05, sz);
      });
      stallBase.instanceMatrix.needsUpdate = true;
      stallRoof.instanceMatrix.needsUpdate = true;
      if (stallRoof.instanceColor) stallRoof.instanceColor.needsUpdate = true;
      const slGeo = new THREE.BufferGeometry();
      slGeo.setAttribute('position', new THREE.Float32BufferAttribute(stallLightPts, 3));
      scene.add(
        new THREE.Points(
          slGeo,
          new THREE.PointsMaterial({
            size: 0.42,
            map: sparkTex,
            color: 0xffe2b0,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
            fog: true,
          })
        )
      );
    }
    scene.add(stallBase, stallRoof);

    // ---- instanciar as árvores acumuladas (espécies + troncos) ----
    {
      const bySpecies: Tree[][] = [[], [], []];
      for (const t of treeSpots) bySpecies[t.species].push(t);
      const geos = [pineGeo, leafGeo, cypressGeo];
      const m4 = new THREE.Matrix4();
      bySpecies.forEach((list, sp) => {
        if (!list.length) return;
        const mesh = new THREE.InstancedMesh(
          geos[sp],
          new THREE.MeshBasicMaterial({ fog: true }),
          list.length
        );
        list.forEach((t, i) => {
          m4.makeScale(t.s, t.s * (sp === 2 ? 1.15 : 1), t.s);
          m4.setPosition(t.x, 0, t.z);
          mesh.setMatrixAt(i, m4);
          mesh.setColorAt(i, t.c);
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        scene.add(mesh);
      });
      const trunks = new THREE.InstancedMesh(
        trunkGeo,
        new THREE.MeshBasicMaterial({ color: 0x3a2b20, fog: true }),
        treeSpots.length
      );
      treeSpots.forEach((t, i) => {
        m4.makeScale(t.s, t.s, t.s);
        m4.setPosition(t.x, 0, t.z);
        trunks.setMatrixAt(i, m4);
      });
      trunks.instanceMatrix.needsUpdate = true;
      scene.add(trunks);
    }

    // luzes de caminho dos parques
    {
      const pts: number[] = [];
      for (let k = 0; k < 20; k++) {
        const a = (k / 20) * Math.PI * 2;
        pts.push(parkGreen.x + Math.cos(a) * parkGreen.radius * 0.86, 0.35, parkGreen.z + Math.sin(a) * parkGreen.radius * 0.86);
      }
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        pts.push(parkFair.x + Math.cos(a) * parkFair.radius * 0.95, 0.35, parkFair.z + Math.sin(a) * parkFair.radius * 0.95);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      scene.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            size: 0.4,
            map: sparkTex,
            color: 0xffe2b0,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
            fog: true,
          })
        )
      );
    }

    // ============ ANFITEATRO CENTRAL ============
    const TIERS = 8;
    const RISE = 0.3;
    const DEPTH = 1.0;
    const INNER = 3.2;
    const GAP = 1.15; // abertura (entrada) virada para +z
    const prof: THREE.Vector2[] = [];
    for (let i = 0; i < TIERS; i++) {
      prof.push(new THREE.Vector2(INNER + i * DEPTH, i * RISE));
      prof.push(new THREE.Vector2(INNER + (i + 1) * DEPTH, i * RISE));
    }
    const OUTER = INNER + TIERS * DEPTH;
    const TOP = (TIERS - 1) * RISE;
    prof.push(new THREE.Vector2(OUTER, TOP + 0.45)); // parapeito
    prof.push(new THREE.Vector2(OUTER + 0.35, TOP + 0.45));
    prof.push(new THREE.Vector2(OUTER + 0.35, 0));
    const amphi = new THREE.Mesh(
      new THREE.LatheGeometry(prof, 72, GAP / 2, Math.PI * 2 - GAP),
      new THREE.MeshBasicMaterial({ color: 0x3b2b21, side: THREE.DoubleSide, fog: true })
    );
    scene.add(amphi);

    // palco central iluminado + feixe + clarão quente
    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.3, 0.22, 40),
      new THREE.MeshBasicMaterial({ color: 0xffe2ae, toneMapped: false, fog: true })
    );
    stage.position.y = 0.11;
    scene.add(stage);

    const beamTex = radialTexture('rgba(255,228,160,0.9)', 'rgba(255,190,90,0.3)', 'rgba(0,0,0,0)');
    const stageBeam = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: beamTex,
        color: 0xffd490,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        fog: false,
      })
    );
    stageBeam.scale.set(3.4, 16, 1);
    stageBeam.position.set(0, 8, 0);
    scene.add(stageBeam);

    const stageGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: beamTex,
        color: 0xffc766,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        fog: false,
      })
    );
    stageGlow.scale.setScalar(15);
    stageGlow.position.set(0, 2.2, 0);
    scene.add(stageGlow);

    // luzes de fila nas bancadas (arcos concêntricos de pontos dourados)
    const seatPts: number[] = [];
    for (let i = 0; i < TIERS; i++) {
      const r = INNER + i * DEPTH + 0.14;
      const y = i * RISE + 0.05;
      const count = Math.round(r * 9);
      for (let k = 0; k <= count; k++) {
        const a = GAP / 2 + 0.05 + (k / count) * (Math.PI * 2 - GAP - 0.1);
        seatPts.push(Math.sin(a) * r, y, Math.cos(a) * r);
      }
    }
    const seatGeo = new THREE.BufferGeometry();
    seatGeo.setAttribute('position', new THREE.Float32BufferAttribute(seatPts, 3));
    const seatMat = new THREE.PointsMaterial({
      size: 0.32,
      map: sparkTex,
      color: 0xffcf8a,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: true,
    });
    scene.add(new THREE.Points(seatGeo, seatMat));

    // caminho de entrada (pela abertura, em direção à praça) + anel da praça
    const pathMat = new THREE.MeshBasicMaterial({
      color: 0xffc47a,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    });
    const path = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 9), pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.02, INNER + 4.5);
    scene.add(path);

    const plazaRing = new THREE.Mesh(new THREE.RingGeometry(12.3, 12.7, 72), pathMat);
    plazaRing.rotation.x = -Math.PI / 2;
    plazaRing.position.y = 0.03;
    scene.add(plazaRing);

    // ============ AVENIDAS DE LUZ (praça → bairros) ============
    const avenueMat = new THREE.MeshBasicMaterial({
      color: 0x8fb8ff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    });
    const avenueTargets = [
      ...buildDistricts.map((d) => ({ x: d.x, z: d.z, half: (Math.max(d.rows, d.cols) * d.cell) / 2 })),
      ...parks.map((p) => ({ x: p.x, z: p.z, half: p.radius })),
    ];
    for (const tg of avenueTargets) {
      const dist = Math.hypot(tg.x, tg.z);
      const len = dist - tg.half + 1 - 12.7;
      if (len <= 2) continue;
      const av = new THREE.Mesh(new THREE.PlaneGeometry(1.15, len), avenueMat);
      av.rotation.order = 'YXZ';
      av.rotation.y = Math.atan2(tg.x, tg.z);
      av.rotation.x = -Math.PI / 2;
      const midR = 12.7 + len / 2;
      av.position.set((tg.x / dist) * midR, 0.02, (tg.z / dist) * midR);
      scene.add(av);
    }

    // ---- poeira de luz / cintilância ----
    const PN = window.innerWidth < 760 ? 260 : 460;
    const pPos = new Float32Array(PN * 3);
    const pCol = new Float32Array(PN * 3);
    const palette = [new THREE.Color(0xffffff), new THREE.Color(0xffd9a0), new THREE.Color(0x9fd8ff), new THREE.Color(0xffb0d8)];
    for (let i = 0; i < PN; i++) {
      const ang = rnd() * Math.PI * 2;
      const rad = 4 + rnd() * 46;
      pPos[i * 3] = Math.cos(ang) * rad;
      pPos[i * 3 + 1] = 1.5 + rnd() * 26;
      pPos[i * 3 + 2] = Math.sin(ang) * rad;
      const col = palette[(rnd() * palette.length) | 0];
      pCol[i * 3] = col.r;
      pCol[i * 3 + 1] = col.g;
      pCol[i * 3 + 2] = col.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const sparkMat = new THREE.PointsMaterial({
      size: 0.7,
      map: sparkTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      toneMapped: false,
      fog: true,
    });
    const sparks = new THREE.Points(pGeo, sparkMat);
    scene.add(sparks);

    // ---- órbita mínima (auto-rotação + arrastar com rato) ----
    const target = new THREE.Vector3(0, 2.5, 0);
    const cam = { theta: 0.7, phi: 0.66, radius: 64 };
    const goal = { ...cam };
    const applyCam = () => {
      const sp = Math.sin(goal.phi);
      camera.position.set(
        target.x + goal.radius * sp * Math.sin(goal.theta),
        target.y + goal.radius * Math.cos(goal.phi),
        target.z + goal.radius * sp * Math.cos(goal.theta)
      );
      camera.lookAt(target);
    };

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return; // no telemóvel deixa o scroll da página passar
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      goal.theta -= (e.clientX - lastX) * 0.005;
      goal.phi = Math.min(1.02, Math.max(0.42, goal.phi + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => (dragging = false);
    if (!reduceMotion) {
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      canvas.style.cursor = 'grab';
    }

    // ---- resize (1ª vez também reenquadra a câmara em ecrãs estreitos) ----
    let mobileFramed = false;
    const resize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      if (!mobileFramed && camera.aspect < 0.85) {
        // Portrait: o FOV horizontal encolhe e corta os bairros mais afastados,
        // sobrando céu escuro vazio — daí um leve aproximar + olhar mais de
        // cima. Um valor anterior (radius 46) ficou demasiado próximo (perdia
        // a paisagem); este é mais recuado, um meio-termo entre mostrar a
        // cidade toda (64/0.66, o desktop) e preencher o ecrã de cor. Só
        // ajusta UMA vez (não em cada resize, para não lutar com o arrastar
        // do utilizador nem com o toggle da barra de endereço no scroll).
        goal.radius = 58;
        goal.phi = 0.58;
        cam.radius = goal.radius;
        cam.phi = goal.phi;
        mobileFramed = true;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    applyCam();

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
        if (!dragging) goal.theta += dt * 0.045; // auto-rotação lenta
        // damping
        cam.theta += (goal.theta - cam.theta) * Math.min(1, dt * 6);
        cam.phi += (goal.phi - cam.phi) * Math.min(1, dt * 6);
        cam.radius += (goal.radius - cam.radius) * Math.min(1, dt * 6);
        const sp = Math.sin(cam.phi);
        camera.position.set(
          target.x + cam.radius * sp * Math.sin(cam.theta),
          target.y + cam.radius * Math.cos(cam.phi),
          target.z + cam.radius * sp * Math.cos(cam.theta)
        );
        camera.lookAt(target);
        sparks.rotation.y += dt * 0.02;
        sparkMat.opacity = 0.72 + Math.sin(now * 0.0021) * 0.22;
        seatMat.opacity = 0.8 + Math.sin(now * 0.0026) * 0.12;
        rotor.rotation.z += dt * 0.12; // roda-gigante a girar devagar
        // comboio da montanha-russa: acelera nas descidas, arrasta-se nas subidas
        const p0 = coasterCurve.getPointAt(coastT);
        const vTrain = 1.6 + 3.6 * Math.sqrt(Math.max(0, COASTER_HMAX - p0.y) / COASTER_HMAX);
        coastT = (coastT + (dt * vTrain) / coasterLen) % 1;
        placeTrain();
        const fl = 1 + Math.sin(now * 0.004) * 0.06 + Math.sin(now * 0.017) * 0.04;
        stageGlow.scale.setScalar(15 * fl);
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize);

    if (reduceMotion) {
      renderer.render(scene, camera); // 1 frame estático
    } else {
      renderer.render(scene, camera); // "assenta" um frame
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerdown', onDown);
      renderer.dispose();
      scene.traverse((o) => {
        const anyO = o as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        anyO.geometry?.dispose?.();
        const mat = anyO.material;
        const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
        for (const mm of mats) {
          (mm as THREE.Material & { map?: THREE.Texture | null }).map?.dispose?.();
          mm.dispose();
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
