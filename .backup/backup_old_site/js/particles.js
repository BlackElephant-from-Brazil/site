/**
 * BlackElephant - Particle System
 * Creates interactive particle background effect
 */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;
        this.isActive = true;
        
        this.init();
        this.animate();
        this.addEventListeners();
    }
    
    init() {
        this.resize();
        this.createParticles();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const numberOfParticles = Math.min(100, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        this.particles = [];
        
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Pause when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
                cancelAnimationFrame(this.animationId);
            } else {
                this.isActive = true;
                this.animate();
            }
        });
    }
    
    connectParticles() {
        const maxDistance = 120;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.5;
                    this.ctx.strokeStyle = `rgba(183, 253, 19, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });
        
        this.connectParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 30 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update(mouse) {
        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * this.density * 0.5;
                const directionY = forceDirectionY * force * this.density * 0.5;
                
                this.x -= directionX;
                this.y -= directionY;
            }
        }
        
        // Float movement
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x > this.canvas.width || this.x < 0) {
            this.speedX *= -1;
        }
        if (this.y > this.canvas.height || this.y < 0) {
            this.speedY *= -1;
        }
        
        // Return to base position slowly
        const returnSpeed = 0.02;
        this.x += (this.baseX - this.x) * returnSpeed;
        this.y += (this.baseY - this.y) * returnSpeed;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(183, 253, 19, ${this.opacity})`;
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(183, 253, 19, 0.5)';
    }
}

// Grid Effect Class
class GridEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 50;
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(183, 253, 19, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Highlight near mouse
        const highlightRadius = 200;
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            for (let y = 0; y < this.canvas.height; y += this.gridSize) {
                const dx = this.mouse.x - x;
                const dy = this.mouse.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < highlightRadius) {
                    const opacity = (1 - distance / highlightRadius) * 0.3;
                    this.ctx.fillStyle = `rgba(183, 253, 19, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.time += 0.01;
        requestAnimationFrame(() => this.animate());
    }
}

// Wave Effect
class WaveEffect {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.waves = [];
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Create multiple wave layers
        this.waves = [
            { amplitude: 20, wavelength: 200, speed: 0.02, offset: 0 },
            { amplitude: 15, wavelength: 150, speed: 0.03, offset: Math.PI / 3 },
            { amplitude: 10, wavelength: 100, speed: 0.04, offset: Math.PI / 2 }
        ];
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }
    
    drawWave(wave, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        
        for (let x = 0; x < this.canvas.width; x++) {
            const y = this.canvas.height / 2 + 
                Math.sin((x / wave.wavelength) + this.time * wave.speed * 100 + wave.offset) * wave.amplitude;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.waves.forEach((wave, index) => {
            const opacity = 0.1 + (index * 0.1);
            this.drawWave(wave, `rgba(183, 253, 19, ${opacity})`);
        });
        
        this.time += 0.016;
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem('particleCanvas');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem, GridEffect, WaveEffect };
}
