// Get the canvas and its context
const canvas = document.getElementById('background') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Set canvas size to match window size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Call resize on load and when window is resized
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Animation parameters
const particleCount = 100;
const noiseScale = 0.005;
const noiseStrength = 30;
const particleSize = 80;
const particleBaseOpacity = 0.3;

// Create particles
class Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;

  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * particleSize + 20;
    this.speed = Math.random() * 0.5 + 0.1;
    this.opacity = Math.random() * particleBaseOpacity;
    this.angle = Math.random() * Math.PI * 2;
  }

  update(time: number) {
    // Move particle in its direction
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Slightly change angle over time for more organic movement
    this.angle += (Math.random() - 0.5) * 0.05;

    // Apply Perlin-like noise effect to opacity to create the retouching effect
    const noiseValue = simplex(this.x * noiseScale, this.y * noiseScale, time * 0.001);
    this.opacity = (Math.sin(noiseValue * noiseStrength) * 0.5 + 0.5) * particleBaseOpacity;

    // Reset particle if it goes off screen
    if (this.x < -this.size || this.x > canvas.width + this.size ||
        this.y < -this.size || this.y > canvas.height + this.size) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.angle = Math.random() * Math.PI * 2;
    }
  }

  draw() {
    // Create a radial gradient for each particle
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    );

    gradient.addColorStop(0, `rgba(150, 150, 150, ${this.opacity})`);
    gradient.addColorStop(1, 'rgba(50, 50, 50, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Create array of particles
const particles: Particle[] = [];
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// Simple noise function (pseudo Perlin noise)
function simplex(x: number, y: number, z: number): number {
  // This is a very simplified noise function that creates some random values
  // that change smoothly over space
  return Math.sin(x * 10 + z) * Math.cos(y * 10 + z) * Math.sin((x + y) * 5);
}

// Animation loop
function animate(timestamp: number) {
  // Clear canvas with black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw all particles
  for (const particle of particles) {
    particle.update(timestamp);
    particle.draw();
  }

  // Apply a subtle post-processing effect to enhance the retouching look
  applyPostProcessing();

  // Continue animation loop
  requestAnimationFrame(animate);
}

// Apply subtle post-processing to enhance the retouching effect
function applyPostProcessing() {
  // Get canvas image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Apply subtle noise to the image data
  for (let i = 0; i < data.length; i += 4) {
    // Only affect pixels that already have some gray value
    if (data[i] > 0) {
      // Add subtle variation to create the retouching effect
      const noise = (Math.random() - 0.5) * 10;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B

      // Slightly vary opacity randomly
      if (Math.random() > 0.9) {
        data[i + 3] = Math.max(0, Math.min(255, data[i + 3] * (0.9 + Math.random() * 0.2)));
      }
    }
  }

  // Put modified image data back on canvas
  ctx.putImageData(imageData, 0, 0);
}

// Start animation
requestAnimationFrame(animate);
