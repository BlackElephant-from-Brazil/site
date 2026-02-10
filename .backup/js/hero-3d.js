
// Configuration
const isMobile = window.innerWidth < 768;

const CONFIG = {
    particleCount: 20000,
    particleSize: 1.5,
    color: 0x39FF14, // Lime
    bgColor: 0x020202,
    iconCount: 4,      // Reduced by half for elegance
    minSpawnY: -100,   // Spawn strictly below this Y (Top is +Y)
    maxSpawnY: -400,   // Bottom limit
    connectionDistance: 400, // Increased for more spacing
};

let scene, camera, renderer, particles, iconGroup, linesMesh;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let interactionForce = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

const SHAPES = ['lock', 'phone', 'laptop', 'shield', 'cloud', 'gear', 'web', 'chip'];

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(CONFIG.bgColor, 0.0008);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 50, 800); // Lower camera slightly

    // --- 1. PARTICLE TERRAIN ---
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const amountX = 200; const amountY = 200; const sep = 40;
    // Shift terrain down
    for (let ix = 0; ix < amountX; ix++) {
        for (let iy = 0; iy < amountY; iy++) {
            positions.push(ix * sep - 4000, -200, iy * sep - 4000); // Lower terrain Y
        }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: CONFIG.color, size: CONFIG.particleSize, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    particles = new THREE.Points(geometry, mat);
    scene.add(particles);

    // --- 2. LIQUID ICONS ---
    createIcons();

    // --- 3. LINES ---
    const lineGeo = new THREE.BufferGeometry();
    const linePos = new Float32Array(CONFIG.iconCount * CONFIG.iconCount * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    linesMesh = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
        color: 0x39FF14,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    }));
    scene.add(linesMesh);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: document.getElementById('fluid-canvas') });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onTouch, { passive: false });
    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);
    window.addEventListener('resize', onResize);
}

function drawShape(ctx, type, cx, cy) {
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 10;

    const s = 0.85;

    if (type === 'lock') {
        // Padlock
        ctx.beginPath();
        ctx.strokeRect(cx - 18 * s, cy - 5 * s, 36 * s, 30 * s);
        ctx.beginPath();
        ctx.arc(cx, cy - 5 * s, 15 * s, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + 10 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 'phone') {
        // Smartphone
        ctx.beginPath();
        ctx.roundRect(cx - 12 * s, cy - 24 * s, 24 * s, 48 * s, 4 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy + 18 * s, 3 * s, 0, Math.PI * 2);
        ctx.stroke();
    } else if (type === 'laptop') {
        // Laptop computer
        ctx.beginPath();
        ctx.strokeRect(cx - 25 * s, cy - 18 * s, 50 * s, 32 * s);
        ctx.moveTo(cx - 30 * s, cy + 14 * s);
        ctx.lineTo(cx + 30 * s, cy + 14 * s);
        ctx.lineTo(cx + 25 * s, cy + 22 * s);
        ctx.lineTo(cx - 25 * s, cy + 22 * s);
        ctx.closePath();
        ctx.stroke();
    } else if (type === 'shield') {
        // Security Shield
        ctx.beginPath();
        ctx.moveTo(cx, cy - 28 * s);
        ctx.lineTo(cx + 22 * s, cy - 18 * s);
        ctx.lineTo(cx + 22 * s, cy);
        ctx.quadraticCurveTo(cx + 22 * s, cy + 25 * s, cx, cy + 30 * s);
        ctx.quadraticCurveTo(cx - 22 * s, cy + 25 * s, cx - 22 * s, cy);
        ctx.lineTo(cx - 22 * s, cy - 18 * s);
        ctx.closePath();
        ctx.stroke();
        // Checkmark
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, cy);
        ctx.lineTo(cx - 2 * s, cy + 8 * s);
        ctx.lineTo(cx + 10 * s, cy - 6 * s);
        ctx.stroke();
    } else if (type === 'cloud') {
        // Cloud
        ctx.beginPath();
        ctx.arc(cx - 12 * s, cy + 5 * s, 15 * s, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(cx, cy - 10 * s, 15 * s, Math.PI, 0);
        ctx.arc(cx + 15 * s, cy + 5 * s, 12 * s, Math.PI * 1.5, Math.PI * 0.5);
        ctx.lineTo(cx - 12 * s, cy + 18 * s);
        ctx.stroke();
    } else if (type === 'gear') {
        // Gear/Settings
        ctx.beginPath();
        const teeth = 8;
        const outerR = 25 * s, innerR = 18 * s;
        for (let i = 0; i < teeth; i++) {
            const angle1 = (i / teeth) * Math.PI * 2;
            const angle2 = ((i + 0.5) / teeth) * Math.PI * 2;
            ctx.lineTo(cx + Math.cos(angle1) * outerR, cy + Math.sin(angle1) * outerR);
            ctx.lineTo(cx + Math.cos(angle2) * innerR, cy + Math.sin(angle2) * innerR);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 8 * s, 0, Math.PI * 2);
        ctx.stroke();
    } else if (type === 'web') {
        // Globe/Web
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 22 * s, 10 * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - 22 * s);
        ctx.lineTo(cx, cy + 22 * s);
        ctx.stroke();
    } else if (type === 'chip') {
        // CPU/Processor
        ctx.beginPath();
        ctx.strokeRect(cx - 18 * s, cy - 18 * s, 36 * s, 36 * s);
        ctx.strokeRect(cx - 10 * s, cy - 10 * s, 20 * s, 20 * s);
        // Pins
        const pins = [-12, 0, 12];
        pins.forEach(p => {
            ctx.moveTo(cx + p * s, cy - 18 * s); ctx.lineTo(cx + p * s, cy - 26 * s);
            ctx.moveTo(cx + p * s, cy + 18 * s); ctx.lineTo(cx + p * s, cy + 26 * s);
            ctx.moveTo(cx - 18 * s, cy + p * s); ctx.lineTo(cx - 26 * s, cy + p * s);
            ctx.moveTo(cx + 18 * s, cy + p * s); ctx.lineTo(cx + 26 * s, cy + p * s);
        });
        ctx.stroke();
    }
}

function createIconTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 156; canvas.height = 156; // Increased for better quality
    const ctx = canvas.getContext('2d');
    const cx = 78, cy = 78;
    const radius = 70;

    // Advanced Glassmorphism Bubble

    // 1. Outer Shadow/Glow
    const outerGlow = ctx.createRadialGradient(cx, cy, radius - 5, cx, cy, radius + 8);
    outerGlow.addColorStop(0, 'rgba(57, 255, 20, 0)');
    outerGlow.addColorStop(0.7, 'rgba(57, 255, 20, 0.15)');
    outerGlow.addColorStop(1, 'rgba(57, 255, 20, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath(); ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2); ctx.fill();

    // 2. Main Glass Body (Radial gradient for depth)
    const bodyGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, radius);
    bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    bodyGrad.addColorStop(0.4, 'rgba(57, 255, 20, 0.08)');
    bodyGrad.addColorStop(0.7, 'rgba(20, 20, 20, 0.1)');
    bodyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();

    // 3. Glossy Rim (Double stroke for premium look)
    // Inner bright rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2); ctx.stroke();

    // Outer green accent
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();

    // 4. Primary Light Reflection (Top-left, strong)
    const reflectionGrad = ctx.createRadialGradient(cx - 25, cy - 30, 0, cx - 25, cy - 30, 25);
    reflectionGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    reflectionGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    reflectionGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = reflectionGrad;
    ctx.beginPath(); ctx.ellipse(cx - 25, cy - 30, 22, 12, Math.PI / 6, 0, Math.PI * 2); ctx.fill();

    // 5. Secondary Highlight (Top-right edge)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(cx + 35, cy - 20, 8, 0, Math.PI * 2);
    ctx.fill();

    // 6. Bottom Inner Shadow (for 3D depth)
    const shadowGrad = ctx.createRadialGradient(cx, cy + 20, 0, cx, cy + 20, 40);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath(); ctx.ellipse(cx, cy + 25, 30, 15, 0, 0, Math.PI * 2); ctx.fill();

    // 7. Subtle Refraction Lines (liquid glass effect)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.7, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();

    // 8. Draw Icon (scaled and centered)
    drawShape(ctx, type, cx, cy);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createIcons() {
    iconGroup = new THREE.Group();

    for (let i = 0; i < CONFIG.iconCount; i++) {
        const type = SHAPES[i % SHAPES.length];
        const tex = createIconTexture(type);
        tex.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0 });
        const sprite = new THREE.Sprite(mat);

        sprite.scale.set(85, 85, 1); // Slightly larger for premium feel

        // Spawn Logic: STRICTLY BELOW TEXT
        // Y Range: -100 to -400 (Bottom half)
        spawnIcon(sprite);

        iconGroup.add(sprite);
    }
    scene.add(iconGroup);
}

function spawnIcon(sprite) {
    const maxW = isMobile ? 400 : 1800; // Wider spread for more spacing
    sprite.position.x = (Math.random() - 0.5) * maxW;
    sprite.position.y = (Math.random() * (CONFIG.minSpawnY - CONFIG.maxSpawnY)) + CONFIG.maxSpawnY;
    sprite.position.z = (Math.random() - 0.5) * 800; // Deeper Z spread

    sprite.userData = {
        state: 'waiting',
        timer: Math.random() * 3, // Faster initial appearance
        opacity: 0,
        vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.15, // Slower drift
            (Math.random() * 0.2) + 0.05,
            (Math.random() - 0.5) * 0.15
        )
    };
}

function onMove(e) { targetX = e.clientX - windowHalfX; targetY = e.clientY - windowHalfY; }
function onTouch(e) { if (e.touches.length) { targetX = e.touches[0].pageX - windowHalfX; targetY = e.touches[0].pageY - windowHalfY; } }
function onClick() { interactionForce = 50; }
function onResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }

function animate() {
    requestAnimationFrame(animate);
    const dt = 0.016;
    const time = Date.now() * 0.001;

    mouseX += (targetX - mouseX) * 0.1;
    mouseY += (targetY - mouseY) * 0.1;
    interactionForce *= 0.95;

    let lineIdx = 0;
    const linePos = linesMesh.geometry.attributes.position.array;

    iconGroup.children.forEach((icon, i) => {
        // Free Drift
        icon.position.add(icon.userData.vel);

        // Respawn if too far OFF SCREEN (not tethered, just recycled)
        if (icon.position.y > 200 || icon.position.y < -600 || Math.abs(icon.position.x) > 1500) {
            // Only respawn if invisible
            if (icon.userData.state !== 'visible') {
                // Reset pos? No, just let it drift until it fades out naturally
            }
        }

        if (interactionForce > 0) {
            const dist = icon.position.length(); // Simplified interaction
            const push = icon.position.clone().normalize();
            icon.position.add(push.multiplyScalar(interactionForce * 0.1));
        }

        // Blink Logic
        icon.userData.timer -= dt;
        if (icon.userData.timer <= 0) {
            if (icon.userData.state === 'waiting') icon.userData.state = 'fadingIn';
            else if (icon.userData.state === 'visible') icon.userData.state = 'fadingOut';
        }

        if (icon.userData.state === 'fadingIn') {
            icon.userData.opacity += dt * 2;
            if (icon.userData.opacity >= 1) { icon.userData.opacity = 1; icon.userData.state = 'visible'; icon.userData.timer = 5.0; }
        } else if (icon.userData.state === 'fadingOut') {
            icon.userData.opacity -= dt * 2;
            if (icon.userData.opacity <= 0) {
                icon.userData.opacity = 0;
                icon.userData.state = 'waiting';
                icon.userData.timer = 2.0;
                spawnIcon(icon); // RESPAMN POSITION when hidden
            }
        }
        icon.material.opacity = icon.userData.opacity;

        // Connections
        if (icon.userData.opacity > 0.3) {
            for (let j = i + 1; j < iconGroup.children.length; j++) {
                const other = iconGroup.children[j];
                if (other.userData.opacity > 0.3) {
                    const dist = icon.position.distanceTo(other.position);
                    if (dist < CONFIG.connectionDistance) {
                        linePos[lineIdx++] = icon.position.x; linePos[lineIdx++] = icon.position.y; linePos[lineIdx++] = icon.position.z;
                        linePos[lineIdx++] = other.position.x; linePos[lineIdx++] = other.position.y; linePos[lineIdx++] = other.position.z;
                    }
                }
            }
        }
    });
    linesMesh.geometry.setDrawRange(0, lineIdx / 3);
    linesMesh.geometry.attributes.position.needsUpdate = true;

    // Terrain (Lowered)
    const positions = particles.geometry.attributes.position.array;
    for (let k = 1; k < positions.length; k += 3) {
        let baseHeight = -200; // Base Y
        positions[k] = baseHeight + Math.sin((positions[k - 1] * 0.005) + time) * 20 + Math.sin((positions[k + 1] * 0.005) + time * 0.5) * 20;
        if (interactionForce > 0) {
            const px = positions[k - 1]; const pz = positions[k + 1];
            const dist = Math.sqrt(px * px + pz * pz);
            if (dist < 500) positions[k] += Math.sin(dist * 0.1 - time * 10) * interactionForce * 0.5;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.lookAt(0, -100, 0); // Look slightly down
    renderer.render(scene, camera);
}
