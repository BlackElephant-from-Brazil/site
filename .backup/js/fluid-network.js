
const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let points = [];
let target = { x: 0, y: 0 };
let isHovering = false;

// Config
const SPACING = 40;
const POINT_RADIUS = 2;
const CONNECTION_DIST = 100;
const MOUSE_DIST = 150;
const ELASTICITY = 0.05;
const DAMPING = 0.90;
const STIFFNESS = 0.2; // How hard it pulls back
const PRIMARY_COLOR = 'rgba(57, 255, 20, 0.4)'; // Lime

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ox = x; // Original X
        this.oy = y; // Original Y
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        // Physics - return to origin
        let dx = this.ox - this.x;
        let dy = this.oy - this.y;

        let ax = dx * STIFFNESS;
        let ay = dy * STIFFNESS;

        // Mouse Interaction
        if (isHovering) {
            let mdx = target.x - this.x;
            let mdy = target.y - this.y;
            let dist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (dist < MOUSE_DIST) {
                // Pull towards mouse ("Sticky")
                let force = (MOUSE_DIST - dist) / MOUSE_DIST;
                ax += mdx * force * 0.05; // Gentle pull
                ay += mdy * force * 0.05;
            }
        }

        this.vx += ax;
        this.vy += ay;

        this.vx *= DAMPING;
        this.vy *= DAMPING;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = PRIMARY_COLOR;
        ctx.fill();
    }
}

function init() {
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', () => isHovering = false);
    canvas.addEventListener('touchstart', onTouchMove, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', () => isHovering = false);
    animate();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createPoints();
}

function createPoints() {
    points = [];
    const rows = Math.ceil(height / SPACING);
    const cols = Math.ceil(width / SPACING);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Random offset to make it organic
            let x = i * SPACING + (Math.random() - 0.5) * 20;
            let y = j * SPACING + (Math.random() - 0.5) * 20;
            points.push(new Point(x, y));
        }
    }
}

function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    target.x = e.clientX - rect.left;
    target.y = e.clientY - rect.top;
    isHovering = true;
}

function onTouchMove(e) {
    // e.preventDefault(); 
    const rect = canvas.getBoundingClientRect();
    target.x = e.touches[0].clientX - rect.left;
    target.y = e.touches[0].clientY - rect.top;
    isHovering = true;
}

function animate() {
    // Clear with fade effect for trails? No, clean redraw for this effect
    ctx.clearRect(0, 0, width, height);

    // Update Points
    points.forEach(p => p.update());

    // Draw Connections
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
    ctx.lineWidth = 1;

    // Optimized: Only check neighbors (simple grid check approximator would be better, but O(N^2) for small N is ok)
    // For better perf, we just connect to "nearby" in list, but that's not geometric. 
    // Let's do a simple distance check but limit it.

    for (let i = 0; i < points.length; i++) {
        let p1 = points[i];

        // Draw point
        // p1.draw(); // Optional: draw dots

        // Connect
        // Check specific neighbors to save perf (right and down)
        // This assumes a grid order, which we have.
        // Rows = Math.ceil(height / SPACING)
        const rows = Math.ceil(height / SPACING);

        // Neighbor Right
        if (i + rows < points.length) {
            let p2 = points[i + rows];
            drawLink(p1, p2);
        }
        // Neighbor Down
        if ((i + 1) % rows !== 0 && i + 1 < points.length) {
            let p2 = points[i + 1];
            drawLink(p1, p2);
        }

        // Diagonal to create truss
        if ((i + 1) % rows !== 0 && i + rows + 1 < points.length) {
            let p2 = points[i + rows + 1];
            drawLink(p1, p2);
        }
    }

    requestAnimationFrame(animate);
}

function drawLink(p1, p2) {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    let distSq = dx * dx + dy * dy;

    // Make lines more opaque if stretched? Or less?
    // Let's keep it steady but pulse if near mouse
    if (distSq < CONNECTION_DIST * CONNECTION_DIST * 2.5) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
}

// Start only if element exists
if (canvas) {
    init();
}
