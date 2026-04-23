// Minecraft Classic 0.0.23a_01 - Ported for Vespera OS
// Original: https://classic.minecraft.net

(function() {
  "use strict";
  
  // Game configuration
  const CONFIG = {
    WORLD_SIZE: 128,
    CHUNK_SIZE: 16,
    BLOCK_SIZE: 1,
    FOV: 70,
    RENDER_DISTANCE: 100,
    GRAVITY: 0.08,
    JUMP_FORCE: 0.5,
    MOVE_SPEED: 0.1,
    MOUSE_SENSITIVITY: 0.002
  };

  // Block types
  const BLOCKS = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    COBBLESTONE: 4,
    WOOD_PLANKS: 5,
    BEDROCK: 7,
    WATER: 8,
    LAVA: 10,
    SAND: 12,
    WOOD: 17,
    LEAVES: 18,
    GLASS: 20,
    BRICKS: 45,
    MOSSY_COBBLESTONE: 48,
    OBSIDIAN: 49
  };

  // Block colors (simplified for 1996 aesthetic)
  const BLOCK_COLORS = {
    [BLOCKS.GRASS]: { top: '#3D8E3D', side: '#3D8E3D', bottom: '#6B4226' },
    [BLOCKS.DIRT]: { all: '#6B4226' },
    [BLOCKS.STONE]: { all: '#808080' },
    [BLOCKS.COBBLESTONE]: { all: '#686868' },
    [BLOCKS.WOOD_PLANKS]: { all: '#A0826D' },
    [BLOCKS.BEDROCK]: { all: '#2F2F2F' },
    [BLOCKS.WATER]: { all: '#3F76E4' },
    [BLOCKS.LAVA]: { all: '#FF6C00' },
    [BLOCKS.SAND]: { all: '#D6CFA6' },
    [BLOCKS.WOOD]: { all: '#4A3728' },
    [BLOCKS.LEAVES]: { all: '#3D8E3D' },
    [BLOCKS.GLASS]: { all: '#AADDFF' },
    [BLOCKS.BRICKS]: { all: '#B53A3A' },
    [BLOCKS.MOSSY_COBBLESTONE]: { all: '#5D8C47' },
    [BLOCKS.OBSIDIAN]: { all: '#15151A' }
  };

  // Simple 3D math
  class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    mul(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
    cross(v) {
      return new Vec3(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x
      );
    }
    normalize() {
      const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      return len > 0 ? new Vec3(this.x / len, this.y / len, this.z / len) : new Vec3();
    }
  }

  class Camera {
    constructor() {
      // Start at ground level (terrain generates up to ~35 blocks)
      this.pos = new Vec3(64, 36, 64);
      this.yaw = 0;
      this.pitch = -0.3; // Slight downward angle to see the ground
      this.vel = new Vec3();
      this.onGround = false;
    }
    
    getForward() {
      return new Vec3(
        Math.cos(this.pitch) * Math.sin(this.yaw),
        Math.sin(this.pitch),
        Math.cos(this.pitch) * Math.cos(this.yaw)
      );
    }
    
    getRight() {
      return new Vec3(Math.sin(this.yaw + Math.PI / 2), 0, Math.cos(this.yaw + Math.PI / 2));
    }
  }

  class World {
    constructor(size = CONFIG.WORLD_SIZE) {
      this.size = size;
      this.blocks = new Int8Array(size * size * size);
      this.generate();
    }
    
    getIndex(x, y, z) {
      if (x < 0 || x >= this.size || y < 0 || y >= this.size || z < 0 || z >= this.size) return -1;
      return (y * this.size + z) * this.size + x;
    }
    
    getBlock(x, y, z) {
      const idx = this.getIndex(x, y, z);
      return idx >= 0 ? this.blocks[idx] : BLOCKS.AIR;
    }
    
    setBlock(x, y, z, type) {
      const idx = this.getIndex(x, y, z);
      if (idx >= 0) this.blocks[idx] = type;
    }
    
    generate() {
      // Simple terrain generation
      for (let x = 0; x < this.size; x++) {
        for (let z = 0; z < this.size; z++) {
          // Bedrock layer
          this.setBlock(x, 0, z, BLOCKS.BEDROCK);
          
          // Stone layers
          for (let y = 1; y < 5; y++) {
            this.setBlock(x, y, z, BLOCKS.STONE);
          }
          
          // Dirt and grass
          const height = 30 + Math.floor(Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5);
          for (let y = 5; y < height; y++) {
            this.setBlock(x, y, z, BLOCKS.DIRT);
          }
          this.setBlock(x, height, z, BLOCKS.GRASS);
          
          // Occasional trees
          if (Math.random() < 0.02 && height > 28) {
            this.generateTree(x, height + 1, z);
          }
        }
      }
    }
    
    generateTree(x, y, z) {
      // Trunk
      for (let i = 0; i < 4; i++) {
        this.setBlock(x, y + i, z, BLOCKS.WOOD);
      }
      // Leaves
      for (let ly = 3; ly < 6; ly++) {
        for (let lx = -2; lx <= 2; lx++) {
          for (let lz = -2; lz <= 2; lz++) {
            if (Math.abs(lx) + Math.abs(lz) < 3 || (ly === 4 && Math.abs(lx) < 2 && Math.abs(lz) < 2)) {
              if (this.getBlock(x + lx, y + ly, z + lz) === BLOCKS.AIR) {
                this.setBlock(x + lx, y + ly, z + lz, BLOCKS.LEAVES);
              }
            }
          }
        }
      }
    }
  }

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = canvas.width;
      this.height = canvas.height;
      this.camera = new Camera();
      this.world = new World();
      this.selectedBlock = { x: 0, y: 0, z: 0, face: null };
      this.blockSize = 30; // Pixels per block
    }
    
    project(v) {
      const fov = 400;
      const scale = fov / (fov + v.z);
      return {
        x: this.width / 2 + v.x * scale,
        y: this.height / 2 - v.y * scale,
        z: v.z,
        scale: scale
      };
    }
    
    rotateY(v, angle) {
      const c = Math.cos(angle), s = Math.sin(angle);
      return new Vec3(v.x * c - v.z * s, v.y, v.x * s + v.z * c);
    }
    
    render() {
      // Clear
      this.ctx.fillStyle = '#87CEEB';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      // Simple wireframe-ish rendering of nearby blocks
      const cx = Math.floor(this.camera.pos.x);
      const cy = Math.floor(this.camera.pos.y);
      const cz = Math.floor(this.camera.pos.z);
      const range = 12;
      
      const faces = [];
      
      for (let x = cx - range; x <= cx + range; x++) {
        for (let y = cy - range; y <= cy + range; y++) {
          for (let z = cz - range; z <= cz + range; z++) {
            const block = this.world.getBlock(x, y, z);
            if (block !== BLOCKS.AIR) {
              this.collectBlockFaces(x, y, z, block, faces);
            }
          }
        }
      }
      
      // Sort faces by depth
      faces.sort((a, b) => b.depth - a.depth);
      
      // Draw faces
      for (const face of faces) {
        this.drawFace(face);
      }
      
      // Draw crosshair
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      const cxh = this.width / 2;
      const cyh = this.height / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cxh - 10, cyh); this.ctx.lineTo(cxh + 10, cyh);
      this.ctx.moveTo(cxh, cyh - 10); this.ctx.lineTo(cxh, cyh + 10);
      this.ctx.stroke();
    }
    
    collectBlockFaces(x, y, z, block, faces) {
      const colors = BLOCK_COLORS[block] || { all: '#FF00FF' };
      
      // Only render visible faces
      if (this.world.getBlock(x, y + 1, z) === BLOCKS.AIR) {
        faces.push({
          verts: [
            new Vec3(x, y + 1, z),
            new Vec3(x + 1, y + 1, z),
            new Vec3(x + 1, y + 1, z + 1),
            new Vec3(x, y + 1, z + 1)
          ],
          color: colors.top || colors.all,
          depth: 0
        });
      }
      if (this.world.getBlock(x, y - 1, z) === BLOCKS.AIR) {
        faces.push({
          verts: [
            new Vec3(x, y, z),
            new Vec3(x, y, z + 1),
            new Vec3(x + 1, y, z + 1),
            new Vec3(x + 1, y, z)
          ],
          color: colors.bottom || colors.all,
          depth: 0
        });
      }
      if (this.world.getBlock(x - 1, y, z) === BLOCKS.AIR) {
        faces.push({
          verts: [
            new Vec3(x, y, z),
            new Vec3(x, y + 1, z),
            new Vec3(x, y + 1, z + 1),
            new Vec3(x, y, z + 1)
          ],
          color: colors.side || colors.all,
          depth: 0
        });
      }
      if (this.world.getBlock(x + 1, y, z) === BLOCKS.AIR) {
        faces.push({
          verts: [
            new Vec3(x + 1, y, z),
            new Vec3(x + 1, y, z + 1),
            new Vec3(x + 1, y + 1, z + 1),
            new Vec3(x + 1, y + 1, z)
          ],
          color: colors.side || colors.all,
          depth: 0
        });
      }
      if (this.world.getBlock(x, y, z - 1) === BLOCKS.AIR) {
        faces.push({
          verts: [
            new Vec3(x, y, z),
            new Vec3(x + 1, y, z),
            new Vec3(x + 1, y + 1, z),
            new Vec3(x, y + 1, z)
          ],
          color: colors.side || colors.all,
          depth: 0
        });
      }
      if (this.world.getBlock(x, y, z + 1) === BLOCKS.AIR) {
        faces.push({
          verts: [
            new Vec3(x, y, z + 1),
            new Vec3(x, y + 1, z + 1),
            new Vec3(x + 1, y + 1, z + 1),
            new Vec3(x + 1, y, z + 1)
          ],
          color: colors.side || colors.all,
          depth: 0
        });
      }
    }
    
    drawFace(face) {
      // Transform vertices
      const projected = face.verts.map(v => {
        // World to camera space
        const dx = v.x - this.camera.pos.x;
        const dy = v.y - this.camera.pos.y;
        const dz = v.z - this.camera.pos.z;
        
        // Rotate by camera yaw
        const rx = dx * Math.cos(-this.camera.yaw) - dz * Math.sin(-this.camera.yaw);
        const rz = dx * Math.sin(-this.camera.yaw) + dz * Math.cos(-this.camera.yaw);
        
        // Rotate by camera pitch
        const ry = dy * Math.cos(-this.camera.pitch) - rz * Math.sin(-this.camera.pitch);
        const rz2 = dy * Math.sin(-this.camera.pitch) + rz * Math.cos(-this.camera.pitch);
        
        // Project
        const fov = 400;
        if (rz2 <= 0.1) return null;
        const scale = fov / rz2;
        
        return {
          x: this.width / 2 + rx * scale,
          y: this.height / 2 - ry * scale
        };
      });
      
      if (projected.some(p => p === null)) return;
      
      // Calculate average depth for sorting
      face.depth = face.verts.reduce((sum, v) => {
        const dx = v.x - this.camera.pos.x;
        const dy = v.y - this.camera.pos.y;
        const dz = v.z - this.camera.pos.z;
        return sum + Math.sqrt(dx * dx + dy * dy + dz * dz);
      }, 0) / 4;
      
      // Draw
      this.ctx.fillStyle = face.color;
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < projected.length; i++) {
        this.ctx.lineTo(projected[i].x, projected[i].y);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  // Main game class
  class MinecraftClassic {
    constructor(container) {
      this.container = container;
      this.canvas = document.createElement('canvas');
      this.canvas.width = container.clientWidth || 640;
      this.canvas.height = container.clientHeight || 480;
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      container.appendChild(this.canvas);
      
      this.renderer = new Renderer(this.canvas);
      this.keys = {};
      this.mouseLocked = false;
      this.currentBlock = BLOCKS.STONE;
      
      this.setupInput();
      this.loop();
    }
    
    setupInput() {
      // Keyboard
      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        // Block selection
        if (e.key >= '1' && e.key <= '9') {
          const blocks = [BLOCKS.STONE, BLOCKS.COBBLESTONE, BLOCKS.BRICKS, BLOCKS.DIRT, BLOCKS.WOOD_PLANKS, BLOCKS.GLASS, BLOCKS.LEAVES, BLOCKS.OBSIDIAN, BLOCKS.BEDROCK];
          this.currentBlock = blocks[parseInt(e.key) - 1] || BLOCKS.STONE;
        }
      });
      window.addEventListener('keyup', (e) => this.keys[e.code] = false);
      
      // Mouse capture
      this.canvas.addEventListener('click', () => {
        if (!this.mouseLocked) {
          this.canvas.requestPointerLock();
        }
      });
      
      document.addEventListener('pointerlockchange', () => {
        this.mouseLocked = document.pointerLockElement === this.canvas;
      });
      
      document.addEventListener('mousemove', (e) => {
        if (this.mouseLocked) {
          this.renderer.camera.yaw += e.movementX * CONFIG.MOUSE_SENSITIVITY;
          this.renderer.camera.pitch -= e.movementY * CONFIG.MOUSE_SENSITIVITY;
          this.renderer.camera.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.renderer.camera.pitch));
        }
      });
      
      // Block interaction
      this.canvas.addEventListener('mousedown', (e) => {
        if (!this.mouseLocked) return;
        
        const cam = this.renderer.camera;
        const world = this.renderer.world;
        
        // Raycast to find block
        const reach = 5;
        const forward = new Vec3(
          Math.cos(cam.pitch) * Math.sin(cam.yaw),
          Math.sin(cam.pitch),
          Math.cos(cam.pitch) * Math.cos(cam.yaw)
        );
        
        let hit = false;
        for (let d = 0; d < reach; d += 0.1) {
          const x = Math.floor(cam.pos.x + forward.x * d);
          const y = Math.floor(cam.pos.y + forward.y * d);
          const z = Math.floor(cam.pos.z + forward.z * d);
          
          if (world.getBlock(x, y, z) !== BLOCKS.AIR) {
            if (e.button === 0) {
              // Left click - break block
              world.setBlock(x, y, z, BLOCKS.AIR);
            } else if (e.button === 2) {
              // Right click - place block
              const px = Math.floor(cam.pos.x + forward.x * (d - 0.5));
              const py = Math.floor(cam.pos.y + forward.y * (d - 0.5));
              const pz = Math.floor(cam.pos.z + forward.z * (d - 0.5));
              if (world.getBlock(px, py, pz) === BLOCKS.AIR) {
                world.setBlock(px, py, pz, this.currentBlock);
              }
            }
            hit = true;
            break;
          }
        }
      });
    }
    
    update() {
      const cam = this.renderer.camera;
      const forward = new Vec3(Math.sin(cam.yaw), 0, Math.cos(cam.yaw));
      const right = new Vec3(Math.sin(cam.yaw + Math.PI / 2), 0, Math.cos(cam.yaw + Math.PI / 2));
      
      let move = new Vec3();
      if (this.keys['KeyW']) move = move.add(forward);
      if (this.keys['KeyS']) move = move.sub(forward);
      if (this.keys['KeyA']) move = move.sub(right);
      if (this.keys['KeyD']) move = move.add(right);
      
      move = move.normalize().mul(CONFIG.MOVE_SPEED);
      
      // Simple collision
      const newX = cam.pos.x + move.x;
      const newZ = cam.pos.z + move.z;
      const world = this.renderer.world;
      
      if (world.getBlock(Math.floor(newX), Math.floor(cam.pos.y), Math.floor(cam.pos.z)) === BLOCKS.AIR) {
        cam.pos.x = newX;
      }
      if (world.getBlock(Math.floor(cam.pos.x), Math.floor(cam.pos.y), Math.floor(newZ)) === BLOCKS.AIR) {
        cam.pos.z = newZ;
      }
      
      // Gravity and jumping
      cam.vel.y -= CONFIG.GRAVITY;
      cam.pos.y += cam.vel.y;
      
      // Ground collision
      const groundY = Math.floor(cam.pos.y);
      if (world.getBlock(Math.floor(cam.pos.x), groundY, Math.floor(cam.pos.z)) !== BLOCKS.AIR) {
        cam.pos.y = groundY + 1;
        cam.vel.y = 0;
        cam.onGround = true;
      } else {
        cam.onGround = false;
      }
      
      // Jump
      if (this.keys['Space'] && cam.onGround) {
        cam.vel.y = CONFIG.JUMP_FORCE;
        cam.onGround = false;
      }
    }
    
    loop() {
      this.update();
      this.renderer.render();
      requestAnimationFrame(() => this.loop());
    }
  }

  // Expose to window for Vespera OS
  window.MinecraftClassic = MinecraftClassic;
})();
