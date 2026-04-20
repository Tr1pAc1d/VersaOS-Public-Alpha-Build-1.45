import React, { useEffect, useRef, useState, useCallback } from 'react';

// ── Screensaver types ─────────────────────────────────────────────────────────
export type ScreensaverType =
  | 'none' | 'starfield' | 'pipes' | 'logo_bounce' | 'matrix' | 'maze'
  // Vespera Plus! Screen Saver Pack
  | 'aurora' | 'plasma' | 'warp_tunnel' | 'embers' | 'crystal'
  | 'neon_rain' | 'dna_helix' | 'galaxy' | 'lissajous' | 'digital_clock';

interface ScreensaverProps {
  type: ScreensaverType;
  isPreview?: boolean; // Small preview box in Control Panel
  onDismiss?: () => void; // Full-screen dismiss callback
}

// ── Starfield ─────────────────────────────────────────────────────────────────
const Starfield: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NUM_STARS = isPreview ? 120 : 400;
    const SPEED = isPreview ? 2 : 4;
    const w = () => canvas.width;
    const h = () => canvas.height;

    // Init stars
    starsRef.current = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * w() * 2,
      y: (Math.random() - 0.5) * h() * 2,
      z: Math.random() * w(),
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, w(), h());

      const cx = w() / 2;
      const cy = h() / 2;

      for (const star of starsRef.current) {
        star.z -= SPEED;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * w() * 2;
          star.y = (Math.random() - 0.5) * h() * 2;
          star.z = w();
        }

        const sx = (star.x / star.z) * w() * 0.5 + cx;
        const sy = (star.y / star.z) * h() * 0.5 + cy;
        const size = Math.max(0.5, (1 - star.z / w()) * 3);
        const brightness = Math.min(255, Math.floor((1 - star.z / w()) * 255));

        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw trail
        const prevSx = (star.x / (star.z + SPEED * 4)) * w() * 0.5 + cx;
        const prevSy = (star.y / (star.z + SPEED * 4)) * h() * 0.5 + cy;
        ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.3)`;
        ctx.lineWidth = size * 0.5;
        ctx.beginPath();
        ctx.moveTo(prevSx, prevSy);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── 3D Pipes ──────────────────────────────────────────────────────────────────
const Pipes: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const pipesRef = useRef<{ x: number; y: number; dir: number; color: string; segments: { x1: number; y1: number; x2: number; y2: number }[] }[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const PIPE_COLORS = ['#00ff00', '#ff0000', '#0088ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#88ff00'];
    const GRID = isPreview ? 12 : 24;
    const w = () => canvas.width;
    const h = () => canvas.height;

    const cellW = () => Math.floor(w() / GRID);
    const cellH = () => Math.floor(h() / GRID);
    // Directions: 0=right, 1=down, 2=left, 3=up
    const DX = [1, 0, -1, 0];
    const DY = [0, 1, 0, -1];

    const spawnPipe = () => ({
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
      dir: Math.floor(Math.random() * 4),
      color: PIPE_COLORS[Math.floor(Math.random() * PIPE_COLORS.length)],
      segments: [] as { x1: number; y1: number; x2: number; y2: number }[],
    });

    pipesRef.current = [spawnPipe(), spawnPipe()];

    // Reset canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w(), h());

    const draw = () => {
      frameRef.current++;

      // Every N frames, grow each pipe
      if (frameRef.current % (isPreview ? 4 : 2) === 0) {
        for (const pipe of pipesRef.current) {
          // Maybe change direction
          if (Math.random() > 0.65) {
            // Avoid reversing
            const turns = [
              (pipe.dir + 1) % 4,
              (pipe.dir + 3) % 4,
              pipe.dir,
            ];
            pipe.dir = turns[Math.floor(Math.random() * turns.length)];
          }

          const nx = pipe.x + DX[pipe.dir];
          const ny = pipe.y + DY[pipe.dir];

          // Bounds check
          if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
            pipe.dir = (pipe.dir + 2) % 4; // Reverse
            continue;
          }

          const cw = cellW();
          const ch = cellH();
          const x1 = pipe.x * cw + cw / 2;
          const y1 = pipe.y * ch + ch / 2;
          const x2 = nx * cw + cw / 2;
          const y2 = ny * ch + ch / 2;

          pipe.segments.push({ x1, y1, x2, y2 });

          // Draw pipe segment
          const lineWidth = isPreview ? 3 : 6;

          // Shadow for 3D effect
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.lineWidth = lineWidth + 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1 + 1, y1 + 1);
          ctx.lineTo(x2 + 1, y2 + 1);
          ctx.stroke();

          // Main pipe
          ctx.strokeStyle = pipe.color;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Highlight
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = lineWidth * 0.3;
          ctx.beginPath();
          ctx.moveTo(x1 - 1, y1 - 1);
          ctx.lineTo(x2 - 1, y2 - 1);
          ctx.stroke();

          // Joint ball
          ctx.fillStyle = pipe.color;
          ctx.beginPath();
          ctx.arc(x2, y2, lineWidth * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(x2 - 1, y2 - 1, lineWidth * 0.25, 0, Math.PI * 2);
          ctx.fill();

          pipe.x = nx;
          pipe.y = ny;
        }

        // Spawn new pipes occasionally
        if (Math.random() > 0.98 && pipesRef.current.length < (isPreview ? 4 : 8)) {
          pipesRef.current.push(spawnPipe());
        }

        // Reset canvas if too many segments
        const totalSegments = pipesRef.current.reduce((s, p) => s + p.segments.length, 0);
        if (totalSegments > (isPreview ? 300 : 800)) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, w(), h());
          pipesRef.current = [spawnPipe(), spawnPipe()];
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Logo Bounce ───────────────────────────────────────────────────────────────
const LogoBounce: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const logoRef = useRef<{
    x: number; y: number; dx: number; dy: number; color: string;
  }>({ x: 50, y: 50, dx: 2, dy: 1.5, color: '#ffe066' });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#ffe066', '#ff6b6b', '#6bff6b', '#6b9bff', '#ff6bff', '#6bffff', '#ff9e6b', '#c06bff'];
    const LOGO_W = isPreview ? 40 : 120;
    const LOGO_H = isPreview ? 20 : 52;
    const speed = isPreview ? 1 : 2;
    logoRef.current.dx = speed;
    logoRef.current.dy = speed * 0.75;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const logo = logoRef.current;

      // Fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, w, h);

      // Move
      logo.x += logo.dx;
      logo.y += logo.dy;

      // Bounce
      if (logo.x + LOGO_W >= w || logo.x <= 0) {
        logo.dx *= -1;
        logo.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      if (logo.y + LOGO_H >= h || logo.y <= 0) {
        logo.dy *= -1;
        logo.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }

      // Clamp
      logo.x = Math.max(0, Math.min(w - LOGO_W, logo.x));
      logo.y = Math.max(0, Math.min(h - LOGO_H, logo.y));

      // Draw the "VESPERA" logo
      ctx.save();
      ctx.shadowColor = logo.color;
      ctx.shadowBlur = isPreview ? 6 : 20;

      // V chevron
      const vx = logo.x + LOGO_W * 0.5;
      const vy = logo.y + (isPreview ? 3 : 8);
      const vSize = isPreview ? 6 : 18;
      ctx.fillStyle = logo.color;
      ctx.beginPath();
      ctx.moveTo(vx, vy + vSize);
      ctx.lineTo(vx - vSize * 0.7, vy);
      ctx.lineTo(vx - vSize * 0.4, vy);
      ctx.lineTo(vx, vy + vSize * 0.65);
      ctx.lineTo(vx + vSize * 0.4, vy);
      ctx.lineTo(vx + vSize * 0.7, vy);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = logo.color;
      ctx.font = `bold ${isPreview ? 7 : 18}px Arial Black, Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('VESPERA', logo.x + LOGO_W / 2, logo.y + (isPreview ? 12 : 30));

      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    // Initial clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Matrix Rain ───────────────────────────────────────────────────────────────
const MatrixRain: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const fontSize = isPreview ? 8 : 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -100);
    const chars = 'VESPERAアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character is brighter
        if (drops[i] > 0) {
          ctx.fillStyle = '#aaffaa';
          ctx.fillText(char, x, y);
          ctx.fillStyle = '#00ff41';
        }

        ctx.fillText(char, x, y - fontSize);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += isPreview ? 0.5 : 1;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── 3D Maze ───────────────────────────────────────────────────────────────────
const Maze3D: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Disable image smoothing for retro look
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener('resize', resize);

    // Simple 10x10 map
    const map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    let posX = 1.5, posY = 1.5;
    let dirX = 1, dirY = 0;
    let planeX = 0, planeY = 0.66; // FOV
    
    // Auto movement state
    let targetDirX = 1, targetDirY = 0;
    let targetPlaneX = 0, targetPlaneY = 0.66;
    let turnProgress = 1;
    let isTurning = false;
    
    const moveSpeed = isPreview ? 0.02 : 0.04;
    const turnSpeed = 0.05;

    // Glitch entity location
    let glitchX = -1, glitchY = -1;

    let frameCount = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      frameCount++;

      // Ceiling and Floor
      ctx.fillStyle = '#383838'; // Ceiling
      ctx.fillRect(0, 0, w, h / 2);
      ctx.fillStyle = '#7a7a7a'; // Floor
      ctx.fillRect(0, h / 2, w, h / 2);

      // Handle Turning
      if (isTurning) {
        turnProgress += turnSpeed;
        if (turnProgress >= 1) {
          turnProgress = 1;
          isTurning = false;
          dirX = targetDirX;
          dirY = targetDirY;
          planeX = targetPlaneX;
          planeY = targetPlaneY;
        } else {
          // Linear interpolation for smooth turning
          // Actually, basic rotation matrix step is better, but simple lerp works well enough for retro feel
          const oldDirX = dirX;
          dirX = dirX * Math.cos(turnSpeed) - dirY * Math.sin(turnSpeed);
          dirY = oldDirX * Math.sin(turnSpeed) + dirY * Math.cos(turnSpeed);
          
          const oldPlaneX = planeX;
          planeX = planeX * Math.cos(turnSpeed) - planeY * Math.sin(turnSpeed);
          planeY = oldPlaneX * Math.sin(turnSpeed) + planeY * Math.cos(turnSpeed);
        }
      } else {
        // Move Forward
        const nextX = posX + dirX * moveSpeed;
        const nextY = posY + dirY * moveSpeed;
        
        // Simple collision detection
        if (map[Math.floor(nextX)][Math.floor(posY)] === 0) posX = nextX;
        if (map[Math.floor(posX)][Math.floor(nextY)] === 0) posY = nextY;
        
        if (map[Math.floor(nextX + dirX * 0.5)][Math.floor(posY + dirY * 0.5)] !== 0) {
           // We are approaching a wall, time to turn!
           isTurning = true;
           turnProgress = 0;
           
           // Check choices (left or right)
           const leftDirX = -dirY;
           const leftDirY = dirX;
           const rightDirX = dirY;
           const rightDirY = -dirX;
           
           const canGoLeft = map[Math.floor(posX + leftDirX)][Math.floor(posY + leftDirY)] === 0;
           const canGoRight = map[Math.floor(posX + rightDirX)][Math.floor(posY + rightDirY)] === 0;
           
           // Simple rotate 90 deg logic
           let angle = 0;
           if (canGoLeft && !canGoRight) {
             angle = Math.PI / 2; // Left
           } else if (canGoRight && !canGoLeft) {
             angle = -Math.PI / 2; // Right
           } else if (canGoLeft && canGoRight) {
             angle = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
           } else {
             angle = Math.PI; // Turn around U-turn
           }
           
           targetDirX = dirX * Math.cos(angle) - dirY * Math.sin(angle);
           targetDirY = dirX * Math.sin(angle) + dirY * Math.cos(angle);
           targetPlaneX = planeX * Math.cos(angle) - planeY * Math.sin(angle);
           targetPlaneY = planeX * Math.sin(angle) + planeY * Math.cos(angle);
        }
      }

      // Occasionally spawn glitch
      if (Math.random() < 0.005 && glitchX === -1) {
         glitchX = Math.floor(Math.random() * 8) + 1;
         glitchY = Math.floor(Math.random() * 8) + 1;
         if (map[glitchX][glitchY] !== 0) { glitchX = -1; glitchY = -1; }
      }

      // Raycasting loop
      // Render in strips (lower resolution horizontally for retro feel)
      const stripWidth = isPreview ? 2 : 4;
      for (let x = 0; x < w; x += stripWidth) {
        const cameraX = 2 * x / w - 1;
        const rayDirX = dirX + planeX * cameraX;
        const rayDirY = dirY + planeY * cameraX;

        let mapX = Math.floor(posX);
        let mapY = Math.floor(posY);

        let sideDistX, sideDistY;
        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);
        let perpWallDist;

        let stepX, stepY;
        let hit = 0;
        let side = 0;

        if (rayDirX < 0) {
          stepX = -1;
          sideDistX = (posX - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1.0 - posX) * deltaDistX;
        }
        if (rayDirY < 0) {
          stepY = -1;
          sideDistY = (posY - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1.0 - posY) * deltaDistY;
        }

        // DDA loop
        while (hit === 0) {
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }
          if (map[mapX][mapY] > 0) hit = 1;
        }

        if (side === 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
        else perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

        const lineHeight = Math.floor(h / perpWallDist);
        let drawStart = -lineHeight / 2 + h / 2;
        if (drawStart < 0) drawStart = 0;
        let drawEnd = lineHeight / 2 + h / 2;
        if (drawEnd >= h) drawEnd = h - 1;

        // Brick-like color logic
        // Use pseudo "texture" effect
        let color = '#8c0000'; // Dark red brick
        if (side === 1) color = '#5e0000'; // darker shade

        // Apply depth shading (fog)
        const intensity = Math.max(0, 1 - (perpWallDist / (isPreview ? 6 : 8)));
        // Simulate glitch
        let isGlitch = false;
        if (mapX === glitchX && mapY === glitchY && Math.random() > 0.5) {
             color = '#ff0000';
             isGlitch = true;
             // Remove glitch quickly
             if (Math.random() > 0.8) { glitchX = -1; glitchY = -1; }
        }

        ctx.fillStyle = color;
        // Fog pass
        ctx.globalAlpha = intensity;
        ctx.fillRect(x, drawStart, stripWidth, drawEnd - drawStart);
        ctx.globalAlpha = 1.0;
        
        // Draw edge lines for brick texture
        if (!isGlitch && intensity > 0.1) {
            ctx.fillStyle = side === 1 ? '#400000' : '#600000';
            ctx.globalAlpha = intensity;
            if (lineHeight > 20) {
               ctx.fillRect(x, drawEnd - 4, stripWidth, 4); // base board
               ctx.fillRect(x, drawStart, stripWidth, 4); // crown
            }
            ctx.globalAlpha = 1.0;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black font-mono" />;
};

// ── Plus! Aurora Borealis ──────────────────────────────────────────────────────
const Aurora: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width; const h = canvas.height;
      tRef.current += isPreview ? 0.008 : 0.004;
      const t = tRef.current;

      ctx.fillStyle = 'rgba(0,0,10,0.18)';
      ctx.fillRect(0, 0, w, h);

      const bands = isPreview ? 4 : 7;
      for (let b = 0; b < bands; b++) {
        const hue = (150 + b * 35 + t * 20) % 360;
        const amp = h * (isPreview ? 0.12 : 0.18);
        const freq = 1.2 + b * 0.4;
        const phase = b * 1.1 + t * (0.8 + b * 0.15);
        const yBase = h * (0.25 + b * (isPreview ? 0.08 : 0.07));
        const alpha = 0.12 + 0.08 * Math.sin(t + b);

        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += isPreview ? 4 : 3) {
          const y = yBase + amp * Math.sin(freq * (x / w) * Math.PI * 2 + phase)
                          + amp * 0.4 * Math.sin(freq * 2.1 * (x / w) * Math.PI * 2 + phase * 1.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.closePath();
        const grad = ctx.createLinearGradient(0, yBase - amp, 0, yBase + amp * 2);
        grad.addColorStop(0, `hsla(${hue},100%,70%,${alpha})`);
        grad.addColorStop(0.5, `hsla(${(hue+30)%360},100%,60%,${alpha * 1.5})`);
        grad.addColorStop(1, `hsla(${hue},100%,30%,0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Distant stars
      if (!isPreview) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 3; i++) {
          const sx = (Math.sin(t * 0.3 + i * 137.5) * 0.5 + 0.5) * w;
          const sy = (Math.sin(t * 0.2 + i * 79.4) * 0.5 + 0.5) * h * 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ background: '#00000a' }} />;
};

// ── Plus! Plasma Wave ──────────────────────────────────────────────────────────
const PlasmaWave: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const step = isPreview ? 8 : 4;

    const draw = () => {
      tRef.current += isPreview ? 0.05 : 0.025;
      const t = tRef.current;
      const w = canvas.width; const h = canvas.height;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const nx = x / w; const ny = y / h;
          const v =
            Math.sin(nx * 8 + t) +
            Math.sin(ny * 6 + t * 1.3) +
            Math.sin((nx + ny) * 5 + t * 0.7) +
            Math.sin(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 12 + t);
          const hue = (v * 45 + t * 30) % 360;
          ctx.fillStyle = `hsl(${hue},100%,55%)`;
          ctx.fillRect(x, y, step, step);
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Plus! Warp Tunnel ──────────────────────────────────────────────────────────
const WarpTunnel: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const rings = isPreview ? 20 : 40;

    const draw = () => {
      tRef.current += isPreview ? 0.04 : 0.02;
      const t = tRef.current;
      const w = canvas.width; const h = canvas.height;
      const cx = w / 2; const cy = h / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, w, h);

      for (let i = rings; i >= 0; i--) {
        const progress = ((i / rings) + t * 0.4) % 1;
        const perspective = 1 - progress;
        const rx = cx * perspective * 1.6;
        const ry = cy * perspective * 1.6;
        const hue = (i * 12 + t * 60) % 360;
        const alpha = progress * 0.7;
        const twist = Math.sin(progress * Math.PI * 4 + t * 2) * 0.15;
        const x = cx + Math.sin(progress * Math.PI * 3 + t) * cx * 0.2 * progress;
        const y = cy + Math.cos(progress * Math.PI * 2 + t * 0.7) * cy * 0.15 * progress;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(twist);
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue},100%,65%,${alpha})`;
        ctx.lineWidth = isPreview ? 1 : 2;
        ctx.stroke();
        ctx.restore();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Plus! Burning Embers ───────────────────────────────────────────────────────
const BurningEmbers: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const MAX_P = isPreview ? 80 : 300;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const spawn = () => {
      const w = canvas.width; const h = canvas.height;
      const cx = w / 2;
      const spread = isPreview ? 0.2 : 0.35;
      return {
        x: cx + (Math.random() - 0.5) * w * spread,
        y: h,
        vx: (Math.random() - 0.5) * (isPreview ? 0.6 : 1.2),
        vy: -(Math.random() * (isPreview ? 1.5 : 3) + (isPreview ? 0.5 : 1)),
        life: 0,
        maxLife: isPreview ? 60 + Math.random() * 40 : 80 + Math.random() * 80,
        size: Math.random() * (isPreview ? 2 : 4) + (isPreview ? 0.5 : 1),
        hue: Math.random() * 40 + 5,
      };
    };

    const draw = () => {
      const w = canvas.width; const h = canvas.height;
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, w, h);

      const spawnCount = isPreview ? 2 : 6;
      for (let i = 0; i < spawnCount && particlesRef.current.length < MAX_P; i++) {
        particlesRef.current.push(spawn());
      }

      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      for (const p of particlesRef.current) {
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.15) * 0.3;
        p.y += p.vy;
        p.vy += isPreview ? -0.005 : -0.01;
        const prog = 1 - p.life / p.maxLife;
        const lightness = 40 + prog * 50;
        const alpha = prog * 0.9;
        const r = p.size * prog;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grd.addColorStop(0, `hsla(${p.hue},100%,${lightness}%,${alpha})`);
        grd.addColorStop(1, `hsla(${p.hue + 20},100%,${lightness}%,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Plus! Crystal Lattice ──────────────────────────────────────────────────────
const CrystalLattice: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const N = isPreview ? 6 : 10;

    const project = (x: number, y: number, z: number, w: number, h: number) => {
      const fov = 300;
      const sx = w / 2 + (x / (z + fov)) * fov;
      const sy = h / 2 + (y / (z + fov)) * fov;
      return { sx, sy, scale: fov / (z + fov) };
    };

    const rotX = (x: number, y: number, z: number, a: number) => ({ x, y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) });
    const rotY = (x: number, y: number, z: number, a: number) => ({ x: x * Math.cos(a) + z * Math.sin(a), y, z: -x * Math.sin(a) + z * Math.cos(a) });
    const rotZ = (x: number, y: number, z: number, a: number) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a), z });

    const draw = () => {
      tRef.current += isPreview ? 0.025 : 0.012;
      const t = tRef.current;
      const w = canvas.width; const h = canvas.height;

      ctx.fillStyle = 'rgba(0,0,20,0.3)';
      ctx.fillRect(0, 0, w, h);

      const R = isPreview ? 60 : 110;
      const vertices: { x: number; y: number; z: number }[] = [];

      // Icosahedron-like vertices
      const phi = (1 + Math.sqrt(5)) / 2;
      const baseVerts = [
        [0, 1, phi],  [0,-1, phi],  [0, 1,-phi],  [0,-1,-phi],
        [1, phi, 0],  [-1, phi, 0], [1,-phi, 0],  [-1,-phi, 0],
        [phi, 0, 1],  [-phi, 0, 1], [phi, 0,-1],  [-phi, 0,-1],
      ];
      for (const [bx, by, bz] of baseVerts) {
        const mag = Math.sqrt(bx*bx+by*by+bz*bz);
        let p = rotX(bx/mag*R, by/mag*R, bz/mag*R, t * 0.7);
        p = rotY(p.x, p.y, p.z, t * 0.5);
        p = rotZ(p.x, p.y, p.z, t * 0.3);
        vertices.push(p);
      }

      const edges = [[0,1],[0,4],[0,5],[0,8],[0,9],[1,6],[1,7],[1,8],[1,9],[2,3],[2,4],[2,5],[2,10],[2,11],[3,6],[3,7],[3,10],[3,11],[4,5],[4,8],[4,10],[5,9],[5,11],[6,7],[6,8],[6,10],[7,9],[7,11],[8,10],[9,11]];

      for (const [a, b] of edges) {
        if (a >= vertices.length || b >= vertices.length) continue;
        const pa = vertices[a]; const pb = vertices[b];
        const pa2 = project(pa.x, pa.y, pa.z, w, h);
        const pb2 = project(pb.x, pb.y, pb.z, w, h);
        const midZ = (pa.z + pb.z) / 2;
        const hue = ((midZ / R) * 120 + 200 + t * 40) % 360;
        const alpha = 0.4 + 0.5 * ((pa2.scale + pb2.scale) / 2);
        ctx.beginPath();
        ctx.moveTo(pa2.sx, pa2.sy);
        ctx.lineTo(pb2.sx, pb2.sy);
        ctx.strokeStyle = `hsla(${hue},100%,70%,${alpha})`;
        ctx.lineWidth = isPreview ? 0.8 : 1.5;
        ctx.stroke();
      }

      // Draw vertices as glowing dots
      for (const v of vertices) {
        const p = project(v.x, v.y, v.z, w, h);
        const hue = (v.z / R * 120 + 200 + t * 40) % 360;
        const r = (isPreview ? 2 : 4) * p.scale;
        const grd = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 3);
        grd.addColorStop(0, `hsla(${hue},100%,90%,0.9)`);
        grd.addColorStop(1, `hsla(${hue},100%,70%,0)`);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ background: '#00001a' }} />;
};

// ── Plus! Neon Rain ────────────────────────────────────────────────────────────
const NeonRain: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dropsRef = useRef<{ x: number; y: number; speed: number; length: number; hue: number; alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const MAX_D = isPreview ? 30 : 120;
    const NEON_HUES = [290, 195, 160, 340, 60, 30];

    const spawnDrop = () => {
      const w = canvas.width;
      return {
        x: Math.random() * w,
        y: -Math.random() * canvas.height,
        speed: isPreview ? 1.5 + Math.random() * 2 : 3 + Math.random() * 5,
        length: isPreview ? 15 + Math.random() * 30 : 30 + Math.random() * 80,
        hue: NEON_HUES[Math.floor(Math.random() * NEON_HUES.length)],
        alpha: 0.5 + Math.random() * 0.5,
      };
    };

    while (dropsRef.current.length < MAX_D) dropsRef.current.push(spawnDrop());

    const draw = () => {
      const w = canvas.width; const h = canvas.height;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, w, h);

      for (const d of dropsRef.current) {
        const grd = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.length);
        grd.addColorStop(0, `hsla(${d.hue},100%,70%,0)`);
        grd.addColorStop(0.6, `hsla(${d.hue},100%,70%,${d.alpha})`);
        grd.addColorStop(1, `hsla(${d.hue},100%,90%,${d.alpha})`);
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length);
        ctx.strokeStyle = grd;
        ctx.lineWidth = isPreview ? 0.8 : 1.5;
        ctx.shadowColor = `hsl(${d.hue},100%,70%)`;
        ctx.shadowBlur = isPreview ? 4 : 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tip splash
        ctx.beginPath();
        ctx.arc(d.x, d.y + d.length, isPreview ? 1. : 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},100%,90%,${d.alpha})`;
        ctx.fill();

        d.y += d.speed;
        if (d.y > h) Object.assign(d, spawnDrop(), { y: -d.length });
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Plus! DNA Helix ────────────────────────────────────────────────────────────
const DNAHelix: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      tRef.current += isPreview ? 0.05 : 0.025;
      const t = tRef.current;
      const w = canvas.width; const h = canvas.height;

      ctx.fillStyle = 'rgba(0,0,10,0.3)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const ampX = Math.min(w * 0.28, isPreview ? 30 : 80);
      const PAIRS = isPreview ? 10 : 22;
      const PAIR_SPACING = h / PAIRS;

      for (let i = 0; i < PAIRS; i++) {
        const y = (i * PAIR_SPACING + t * (isPreview ? 30 : 60)) % h - PAIR_SPACING;
        const phase = (i / PAIRS) * Math.PI * 4 + t * 2;
        const x1 = cx + Math.sin(phase) * ampX;
        const x2 = cx - Math.sin(phase) * ampX;
        const depth = Math.sin(phase);
        const alpha = 0.5 + depth * 0.4;
        const r1 = isPreview ? 2 : 5;
        const r2 = isPreview ? 2 : 5;

        // Strand 1 dot
        const g1 = ctx.createRadialGradient(x1, y, 0, x1, y, r1 * 3);
        g1.addColorStop(0, `rgba(0,220,255,${alpha})`);
        g1.addColorStop(1, 'rgba(0,100,200,0)');
        ctx.beginPath(); ctx.arc(x1, y, r1 * 3, 0, Math.PI * 2);
        ctx.fillStyle = g1; ctx.fill();

        // Strand 2 dot
        const g2 = ctx.createRadialGradient(x2, y, 0, x2, y, r2 * 3);
        g2.addColorStop(0, `rgba(255,80,200,${alpha})`);
        g2.addColorStop(1, 'rgba(180,0,100,0)');
        ctx.beginPath(); ctx.arc(x2, y, r2 * 3, 0, Math.PI * 2);
        ctx.fillStyle = g2; ctx.fill();

        // Cross-rung (only draw rungs every 2 pairs)
        if (i % 2 === 0) {
          const rungAlpha = Math.abs(depth) * 0.6;
          const rungGrad = ctx.createLinearGradient(x1, y, x2, y);
          rungGrad.addColorStop(0, `rgba(0,220,255,${rungAlpha})`);
          rungGrad.addColorStop(1, `rgba(255,80,200,${rungAlpha})`);
          ctx.beginPath();
          ctx.moveTo(x1, y); ctx.lineTo(x2, y);
          ctx.strokeStyle = rungGrad;
          ctx.lineWidth = isPreview ? 0.8 : 1.5;
          ctx.stroke();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ background: '#00000a' }} />;
};

// ── Plus! Galaxy Spiral ────────────────────────────────────────────────────────
const GalaxySpiral: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const starsRef = useRef<{ a: number; r: number; z: number; arm: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const NUM = isPreview ? 200 : 700;
    const ARMS = 3;
    starsRef.current = Array.from({ length: NUM }, (_, i) => ({
      a: (i / NUM) * Math.PI * 2,
      r: Math.pow(Math.random(), 0.6),
      z: Math.random() * 0.3 - 0.15,
      arm: i % ARMS,
    }));

    const draw = () => {
      tRef.current += isPreview ? 0.006 : 0.003;
      const t = tRef.current;
      const w = canvas.width; const h = canvas.height;
      const cx = w / 2; const cy = h / 2;
      const maxR = Math.min(w, h) * (isPreview ? 0.4 : 0.44);

      ctx.fillStyle = 'rgba(0,0,5,0.25)';
      ctx.fillRect(0, 0, w, h);

      // Central glow
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.25);
      coreGrd.addColorStop(0, 'rgba(220,200,255,0.15)');
      coreGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, maxR * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = coreGrd; ctx.fill();

      for (const star of starsRef.current) {
        const armOffset = (star.arm / ARMS) * Math.PI * 2;
        const spiralAngle = star.a + star.r * Math.PI * 4 + armOffset + t;
        const rad = star.r * maxR;
        const x = cx + Math.cos(spiralAngle) * rad;
        const y = cy + Math.sin(spiralAngle) * rad * 0.45 + star.z * maxR * 0.3;
        const brightness = 0.3 + star.r * 0.5 + Math.random() * 0.2;
        const hue = 220 + star.arm * 40 + star.r * 60;
        const size = isPreview ? 0.7 : (1.5 - star.r);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.3, size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},80%,80%,${Math.min(1, brightness)})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ background: '#000005' }} />;
};

// ── Plus! Lissajous Curves ─────────────────────────────────────────────────────
const LissajousCurves: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const configRef = useRef({ freqX: 3, freqY: 2, delta: 0, colorPhase: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const CONFIGS = [
      { freqX: 3, freqY: 2 }, { freqX: 5, freqY: 4 }, { freqX: 4, freqY: 3 },
      { freqX: 7, freqY: 6 }, { freqX: 5, freqY: 3 }, { freqX: 8, freqY: 5 },
    ];
    let cfgIdx = 0;
    let transitioning = false;
    let transTimer = 0;

    const draw = () => {
      frameRef.current++;
      tRef.current += isPreview ? 0.02 : 0.01;
      const t = tRef.current;
      const cfg = configRef.current;
      cfg.delta += isPreview ? 0.008 : 0.004;
      cfg.colorPhase += isPreview ? 0.01 : 0.005;

      const w = canvas.width; const h = canvas.height;
      const rx = w * (isPreview ? 0.38 : 0.43);
      const ry = h * (isPreview ? 0.38 : 0.43);
      const cx = w / 2; const cy = h / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = isPreview ? 0.8 : 1.5;
      ctx.beginPath();
      const steps = isPreview ? 200 : 500;
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const x = cx + Math.sin(cfg.freqX * angle + cfg.delta) * rx;
        const y = cy + Math.sin(cfg.freqY * angle) * ry;
        const hue = (cfg.colorPhase * 60 + (i / steps) * 360) % 360;
        ctx.strokeStyle = `hsla(${hue},100%,70%,0.85)`;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Auto-rotate configs every 8s
      transTimer++;
      if (transTimer > (isPreview ? 300 : 480)) {
        transTimer = 0;
        cfgIdx = (cfgIdx + 1) % CONFIGS.length;
        configRef.current.freqX = CONFIGS[cfgIdx].freqX;
        configRef.current.freqY = CONFIGS[cfgIdx].freqY;
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, w, h);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Plus! Digital Clock Saver ──────────────────────────────────────────────────
const DigitalClockSaver: React.FC<{ isPreview?: boolean }> = ({ isPreview }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef({ x: 120, y: 80, dx: 1.2, dy: 0.8 });
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const drawSegment = (x: number, y: number, seg: number, color: string, scale: number) => {
      const W = scale; const H = scale * 2; const T = scale * 0.18;
      // 7-segment: 0=top,1=top-right,2=bot-right,3=bot,4=bot-left,5=top-left,6=mid
      const segments = [
        [[T,0],[W-T,0],[W-T,T],[T,T]], // top
        [[W-T,T],[W,T],[W,H/2-T/2],[W-T,H/2+T/2]], // top-right
        [[W-T,H/2+T/2],[W,H/2-T/2],[W,H-T],[W-T,H-T]], // bot-right
        [[T,H-T],[W-T,H-T],[W-T,H],[T,H]], // bottom
        [[0,H/2-T/2],[T,H/2+T/2],[T,H-T],[0,H-T]], // bot-left
        [[0,T],[T,T],[T,H/2+T/2],[0,H/2-T/2]], // top-left
        [[T,H/2-T/2],[W-T,H/2-T/2],[W-T,H/2+T/2],[T,H/2+T/2]], // middle
      ];
      const DIGIT_SEGS: number[][] = [
        [0,1,2,3,4,5], [1,2], [0,1,3,4,6], [0,1,2,3,6],
        [1,2,5,6], [0,2,3,5,6], [0,2,3,4,5,6], [0,1,2],
        [0,1,2,3,4,5,6], [0,1,2,3,5,6],
      ];
      for (let s = 0; s < 7; s++) {
        const on = DIGIT_SEGS[seg]?.includes(s);
        ctx.beginPath();
        for (let i = 0; i < segments[s].length; i++) {
          const [px, py] = segments[s][i];
          if (i === 0) ctx.moveTo(x + px, y + py); else ctx.lineTo(x + px, y + py);
        }
        ctx.closePath();
        ctx.fillStyle = on ? color : 'rgba(0,80,0,0.25)';
        ctx.fill();
      }
    };

    const draw = () => {
      tRef.current += isPreview ? 0.03 : 0.015;
      const t = tRef.current;
      const w = canvas.width; const h = canvas.height;

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, w, h);

      const now = new Date();
      const timeStr = [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
      ];

      const scale = isPreview ? 6 : 18;
      const digitW = scale * 1.3;
      const colonW = scale * 0.6;
      const totalW = digitW * 6 + colonW * 2 + scale * 0.4 * 4;
      const totalH = scale * 2;

      // Bounce
      const pos = posRef.current;
      if (!isPreview) {
        pos.x += pos.dx;
        pos.y += pos.dy;
        if (pos.x + totalW > w || pos.x < 0) pos.dx *= -1;
        if (pos.y + totalH > h || pos.y < 0) pos.dy *= -1;
        pos.x = Math.max(0, Math.min(w - totalW, pos.x));
        pos.y = Math.max(0, Math.min(h - totalH, pos.y));
      }
      const startX = isPreview ? (w - totalW) / 2 : pos.x;
      const startY = isPreview ? (h - totalH) / 2 : pos.y;

      const hue = (t * 15) % 360;
      const color = `hsl(${hue},100%,55%)`;

      // Glow effect
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = isPreview ? 6 : 20;

      let curX = startX;
      for (let g = 0; g < 3; g++) {
        // tens digit
        drawSegment(curX, startY, parseInt(timeStr[g][0]), color, scale);
        curX += digitW + scale * 0.1;
        // units digit
        drawSegment(curX, startY, parseInt(timeStr[g][1]), color, scale);
        curX += digitW;
        // colon (skip after seconds)
        if (g < 2) {
          const colonOn = now.getSeconds() % 2 === 0;
          ctx.fillStyle = colonOn ? color : 'rgba(0,80,0,0.25)';
          const dotR = scale * 0.12;
          ctx.beginPath(); ctx.arc(curX + colonW / 2, startY + totalH * 0.3, dotR, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(curX + colonW / 2, startY + totalH * 0.7, dotR, 0, Math.PI * 2); ctx.fill();
          curX += colonW + scale * 0.3;
        }
      }
      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [isPreview]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

// ── Screensaver Renderer ──────────────────────────────────────────────────────
const ScreensaverRenderer: React.FC<{ type: ScreensaverType; isPreview?: boolean }> = ({ type, isPreview }) => {
  switch (type) {
    case 'starfield': return <Starfield isPreview={isPreview} />;
    case 'pipes': return <Pipes isPreview={isPreview} />;
    case 'logo_bounce': return <LogoBounce isPreview={isPreview} />;
    case 'matrix': return <MatrixRain isPreview={isPreview} />;
    case 'maze': return <Maze3D isPreview={isPreview} />;
    // Plus! Pack
    case 'aurora': return <Aurora isPreview={isPreview} />;
    case 'plasma': return <PlasmaWave isPreview={isPreview} />;
    case 'warp_tunnel': return <WarpTunnel isPreview={isPreview} />;
    case 'embers': return <BurningEmbers isPreview={isPreview} />;
    case 'crystal': return <CrystalLattice isPreview={isPreview} />;
    case 'neon_rain': return <NeonRain isPreview={isPreview} />;
    case 'dna_helix': return <DNAHelix isPreview={isPreview} />;
    case 'galaxy': return <GalaxySpiral isPreview={isPreview} />;
    case 'lissajous': return <LissajousCurves isPreview={isPreview} />;
    case 'digital_clock': return <DigitalClockSaver isPreview={isPreview} />;
    default: return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <span className="text-gray-700 text-xs font-mono">(None)</span>
      </div>
    );
  }
};

// ── Preview Component (for Control Panel) ─────────────────────────────────────
export const ScreensaverPreview: React.FC<{ type: ScreensaverType }> = ({ type }) => (
  <div className="w-full h-full overflow-hidden">
    <ScreensaverRenderer type={type} isPreview={true} />
  </div>
);

// ── Full-Screen Screensaver Overlay ───────────────────────────────────────────
export const ScreensaverOverlay: React.FC<{
  type: ScreensaverType;
  onDismiss: () => void;
}> = ({ type, onDismiss }) => {
  useEffect(() => {
    const dismiss = () => onDismiss();
    window.addEventListener('mousemove', dismiss, { once: true });
    window.addEventListener('keydown', dismiss, { once: true });
    window.addEventListener('mousedown', dismiss, { once: true });
    window.addEventListener('touchstart', dismiss, { once: true });
    return () => {
      window.removeEventListener('mousemove', dismiss);
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('mousedown', dismiss);
      window.removeEventListener('touchstart', dismiss);
    };
  }, [onDismiss]);

  if (type === 'none') return null;

  return (
    <div className="absolute inset-0 z-[99999] cursor-none select-none" style={{ pointerEvents: 'auto' }}>
      <ScreensaverRenderer type={type} />
    </div>
  );
};

// ── Screensaver Name Map ──────────────────────────────────────────────────────
export const SCREENSAVER_OPTIONS: { id: ScreensaverType; name: string; description: string; plus?: boolean }[] = [
  { id: 'none', name: '(None)', description: 'No screen saver.' },
  { id: 'starfield', name: '3D Starfield', description: 'Fly through a field of stars at warp speed.' },
  { id: 'pipes', name: '3D Pipes', description: 'Watch as colorful pipes are drawn across the screen.' },
  { id: 'logo_bounce', name: 'Vespera Logo', description: 'The Vespera logo bounces around the screen.' },
  { id: 'matrix', name: 'AETHERIS Data Rain', description: 'Streams of data cascade down the screen.' },
  { id: 'maze', name: '3D Maze', description: 'Navigate a retro 3D maze.' },
  // Vespera Plus! Screen Saver Pack
  { id: 'aurora', name: 'Plus! Aurora Borealis', description: 'Ethereal northern lights ripple across a deep night sky.', plus: true },
  { id: 'plasma', name: 'Plus! Plasma Wave', description: 'Hypnotic, ever-shifting fields of liquid color.', plus: true },
  { id: 'warp_tunnel', name: 'Plus! Warp Tunnel', description: 'Blast through a psychedelic neon hyperspace tunnel.', plus: true },
  { id: 'embers', name: 'Plus! Burning Embers', description: 'Glowing fire particles drift upward from a roaring blaze.', plus: true },
  { id: 'crystal', name: 'Plus! Crystal Lattice', description: 'A rotating 3D geometric crystal structure glows and pulses.', plus: true },
  { id: 'neon_rain', name: 'Plus! Neon Rain', description: 'Streaks of vivid neon light rain down the screen.', plus: true },
  { id: 'dna_helix', name: 'Plus! DNA Helix', description: 'A luminous double-helix spirals through the darkness.', plus: true },
  { id: 'galaxy', name: 'Plus! Galaxy Spiral', description: 'Thousands of stars swirl through a rotating galactic arm.', plus: true },
  { id: 'lissajous', name: 'Plus! Lissajous Art', description: 'Mathematical beauty — animated Lissajous curves shift and morph.', plus: true },
  { id: 'digital_clock', name: 'Plus! Digital Clock', description: 'A glowing retro 7-segment clock that bounces around the screen.', plus: true },
];

// ── Idle Timer Hook ───────────────────────────────────────────────────────────
export function useScreensaverIdle(
  enabled: boolean,
  timeoutMinutes: number,
  onActivate: () => void,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!enabled || timeoutMinutes <= 0) return;
    timerRef.current = setTimeout(onActivate, timeoutMinutes * 60 * 1000);
  }, [enabled, timeoutMinutes, onActivate]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handler = () => resetTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimer(); // Start initial timer

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, resetTimer]);
}
