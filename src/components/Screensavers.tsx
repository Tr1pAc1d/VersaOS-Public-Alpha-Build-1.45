import React, { useEffect, useRef, useState, useCallback } from 'react';

// ── Screensaver types ─────────────────────────────────────────────────────────
export type ScreensaverType = 'none' | 'starfield' | 'pipes' | 'logo_bounce' | 'matrix' | 'maze';

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

// ── Screensaver Renderer ──────────────────────────────────────────────────────
const ScreensaverRenderer: React.FC<{ type: ScreensaverType; isPreview?: boolean }> = ({ type, isPreview }) => {
  switch (type) {
    case 'starfield': return <Starfield isPreview={isPreview} />;
    case 'pipes': return <Pipes isPreview={isPreview} />;
    case 'logo_bounce': return <LogoBounce isPreview={isPreview} />;
    case 'matrix': return <MatrixRain isPreview={isPreview} />;
    case 'maze': return <Maze3D isPreview={isPreview} />;
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
export const SCREENSAVER_OPTIONS: { id: ScreensaverType; name: string; description: string }[] = [
  { id: 'none', name: '(None)', description: 'No screen saver.' },
  { id: 'starfield', name: '3D Starfield', description: 'Fly through a field of stars at warp speed.' },
  { id: 'pipes', name: '3D Pipes', description: 'Watch as colorful pipes are drawn across the screen.' },
  { id: 'logo_bounce', name: 'Vespera Logo', description: 'The Vespera logo bounces around the screen.' },
  { id: 'matrix', name: 'AETHERIS Data Rain', description: 'Streams of data cascade down the screen.' },
  { id: 'maze', name: '3D Maze', description: 'Navigate a retro 3D maze.' },
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
