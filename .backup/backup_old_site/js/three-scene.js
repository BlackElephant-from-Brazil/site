/**
 * BlackElephant - Three.js 3D Scene
 * Creates a high-tech 3D elephant with particle effects
 */

class ThreeScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded');
            return;
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.elephant = null;
        this.particles = null;
        this.time = 0;
        this.mouse = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Create objects
        this.createElephant();
        this.createParticles();
        this.createLights();
        
        // Events
        this.addEventListeners();
        
        // Start animation
        this.animate();
    }
    
    createElephant() {
        // Create abstract elephant shape using geometric forms
        const group = new THREE.Group();
        
        // Body - main sphere
        const bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1, 0.8, 0.7);
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(1.2, 0.3, 0);
        head.scale.set(0.8, 0.7, 0.6);
        group.add(head);
        
        // Trunk - curved tube
        const trunkCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(1.5, 0.1, 0),
            new THREE.Vector3(1.8, -0.2, 0),
            new THREE.Vector3(2.0, -0.5, 0),
            new THREE.Vector3(2.1, -0.8, 0.1)
        ]);
        const trunkGeometry = new THREE.TubeGeometry(trunkCurve, 20, 0.1, 8, false);
        const trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0xB7FD13,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        group.add(trunk);
        
        // Ears - flat circles
        const earGeometry = new THREE.CircleGeometry(0.4, 32);
        const earMaterial = new THREE.MeshPhongMaterial({
            color: 0xB7FD13,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(1.0, 0.5, 0.4);
        leftEar.rotation.y = Math.PI / 4;
        group.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(1.0, 0.5, -0.4);
        rightEar.rotation.y = -Math.PI / 4;
        group.add(rightEar);
        
        // Eyes - small glowing spheres
        const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xB7FD13,
            transparent: true,
            opacity: 1
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(1.5, 0.4, 0.2);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(1.5, 0.4, -0.2);
        group.add(rightEye);
        
        // Legs - cylinders
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.6, 16);
        const legMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        
        const legPositions = [
            { x: 0.5, z: 0.3 },
            { x: 0.5, z: -0.3 },
            { x: -0.5, z: 0.3 },
            { x: -0.5, z: -0.3 }
        ];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, -0.8, pos.z);
            group.add(leg);
        });
        
        // Tail
        const tailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1.0, 0, 0),
            new THREE.Vector3(-1.3, 0.1, 0),
            new THREE.Vector3(-1.5, 0.3, 0)
        ]);
        const tailGeometry = new THREE.TubeGeometry(tailCurve, 10, 0.03, 8, false);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: 0xB7FD13,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        group.add(tail);
        
        // Add glow effect using point lights at key positions
        const glowPoints = [
            { x: 1.5, y: 0.4, z: 0.2 },
            { x: 1.5, y: 0.4, z: -0.2 },
            { x: 2.1, y: -0.8, z: 0.1 }
        ];
        
        glowPoints.forEach(pos => {
            const pointLight = new THREE.PointLight(0xB7FD13, 0.5, 2);
            pointLight.position.set(pos.x, pos.y, pos.z);
            group.add(pointLight);
        });
        
        // Position and scale the entire elephant
        group.position.set(0, 0, 0);
        group.scale.set(1.2, 1.2, 1.2);
        
        this.elephant = group;
        this.scene.add(group);
    }
    
    createParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Distribute particles in a sphere around the elephant
            const radius = 3 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            sizes[i] = Math.random() * 0.05 + 0.02;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Custom shader material for glowing particles
        const material = new THREE.PointsMaterial({
            color: 0xB7FD13,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Accent light (green)
        const accentLight = new THREE.PointLight(0xB7FD13, 1, 10);
        accentLight.position.set(3, 2, 3);
        this.scene.add(accentLight);
        
        // Back light
        const backLight = new THREE.PointLight(0xB7FD13, 0.5, 10);
        backLight.position.set(-3, -2, -3);
        this.scene.add(backLight);
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }
    
    onResize() {
        if (!this.container) return;
        
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }
    
    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        // Rotate elephant slowly
        if (this.elephant) {
            this.elephant.rotation.y = Math.sin(this.time * 0.5) * 0.3 + this.mouse.x * 0.2;
            this.elephant.rotation.x = Math.cos(this.time * 0.3) * 0.1 + this.mouse.y * 0.1;
            
            // Gentle floating animation
            this.elephant.position.y = Math.sin(this.time) * 0.1;
        }
        
        // Rotate particles
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.x += 0.0005;
            
            // Pulse particle size
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const originalY = positions[i + 1];
                positions[i + 1] = originalY + Math.sin(this.time + i) * 0.001;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Holographic Plane Effect
class HolographicPlane {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container || typeof THREE === 'undefined') return;
        
        this.init();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 3;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Create holographic plane
        this.createPlane();
        
        // Start animation
        this.animate();
    }
    
    createPlane() {
        const geometry = new THREE.PlaneGeometry(5, 5, 50, 50);
        
        // Custom shader for holographic effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xB7FD13) }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.z += sin(pos.x * 3.0 + time) * 0.1;
                    pos.z += cos(pos.y * 3.0 + time) * 0.1;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform vec3 color;
                
                void main() {
                    float grid = sin(vUv.x * 50.0) * sin(vUv.y * 50.0);
                    float alpha = grid * 0.3 + 0.1;
                    alpha *= sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.plane = new THREE.Mesh(geometry, material);
        this.plane.rotation.x = -Math.PI / 4;
        this.scene.add(this.plane);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.plane) {
            this.plane.material.uniforms.time.value += 0.02;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize Three.js scene
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on desktop
    if (window.innerWidth >= 1024) {
        new ThreeScene('hero3d');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThreeScene, HolographicPlane };
}
