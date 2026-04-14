import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Ghost, Terminal } from 'lucide-react';


interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  exploded?: boolean;
}

interface VSweeperProps {
  onClose: () => void;
  neuralBridgeActive?: boolean;
  vfs: any;
}

const ROWS = 9;
const COLS = 9;
const MINES = 10;

const NUMBER_COLORS = [
  '',
  '#0000ff', // 1: blue
  '#008000', // 2: green
  '#ff0000', // 3: red
  '#000080', // 4: dark blue
  '#800000', // 5: dark red
  '#008080', // 6: cyan
  '#000000', // 7: black
  '#808080', // 8: gray
];

const generateGrid = (firstClickX: number, firstClickY: number): Cell[][] => {
  const grid: Cell[][] = Array(ROWS).fill(null).map((_, y) => 
    Array(COLS).fill(null).map((_, x) => ({
      x, y, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
    }))
  );

  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const rx = Math.floor(Math.random() * COLS);
    const ry = Math.floor(Math.random() * ROWS);
    // Don't place mine on first click or if already a mine
    if (!grid[ry][rx].isMine && !(rx === firstClickX && ry === firstClickY)) {
      grid[ry][rx].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbors
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!grid[y][x].isMine) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && grid[ny][nx].isMine) {
              count++;
            }
          }
        }
        grid[y][x].neighborMines = count;
      }
    }
  }
  return grid;
};

export const VSweeper: React.FC<VSweeperProps> = ({ vfs, onClose, neuralBridgeActive }) => {
  const [grid, setGrid] = useState<Cell[][]>(() => {
    // Empty grid until first click
    return Array(ROWS).fill(null).map((_, y) => 
      Array(COLS).fill(null).map((_, x) => ({
        x, y, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
      }))
    );
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const [face, setFace] = useState('🙂');
  const [isGlitching, setIsGlitching] = useState(false);

  const [showBestTimes, setShowBestTimes] = useState(false);
  const [scorePromptTime, setScorePromptTime] = useState<number | null>(null);
  const [scoreNameValue, setScoreNameValue] = useState('Anonymous');
  const [bestScore, setBestScore] = useState<{name: string, time: number} | null>(() => {
    try {
      const saved = localStorage.getItem('versa_vsweeper_scores');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { name: 'Anonymous', time: 999 };
  });
  const [menuOpen, setMenuOpen] = useState<'game' | 'help' | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTime(prev => Math.min(prev + 1, 999));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleWin = () => {
    setGameState('won');
    setFace('😎');
    // Drop lore file to desktop
    const desktopNodes = Object.values(vfs.nodes || {}).find(n => n.name === 'Desktop');
    if (desktopNodes) {
      vfs.createNode(
        'TRUTH.TXT',
        'file',
        desktopNodes.id,
        `I SEE YOU CLEARING THE GRID.\nBUT CAN YOU CLEAR THE SHADOWS?\n\n- E. THORNE`
      );
    }

    // High Score logic
    // we use a setTimeout or a separate effect to fetch `time` accurately but capturing the current `time` state works since `time` increments outside `handleWin` frame.
    // To ensure exact time, we use a ref or just state. State is fine if we defer via a small timeout so the counter is stable.
    setTimeout(() => {
      setTime(currentVal => {
        if (currentVal < (bestScore?.time ?? 999)) {
          setScorePromptTime(currentVal);
        }
        return currentVal;
      });
    }, 100);
  };

  const revealCell = (x: number, y: number) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (grid[y][x].isRevealed || grid[y][x].isFlagged) return;

    let newGrid = [...grid.map(row => [...row])];

    if (gameState === 'idle') {
      newGrid = generateGrid(x, y);
      setGameState('playing');
    }

    if (newGrid[y][x].isMine) {
      // Game Over
      newGrid[y][x].exploded = true;
      setGameState('lost');
      setFace('😵');
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 800);
      
      // Reveal all mines
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newGrid[r][c].isMine) {
            newGrid[r][c].isRevealed = true;
          }
        }
      }
      setGrid(newGrid);
      return;
    }

    const floodFill = (cx: number, cy: number) => {
      if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS) return;
      if (newGrid[cy][cx].isRevealed || newGrid[cy][cx].isFlagged) return;

      newGrid[cy][cx].isRevealed = true;
      
      if (newGrid[cy][cx].neighborMines === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            floodFill(cx + dx, cy + dy);
          }
        }
      }
    };

    floodFill(x, y);
    setGrid(newGrid);

    // Check win
    let unrevealedSafe = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine && !newGrid[r][c].isRevealed) {
          unrevealedSafe++;
        }
      }
    }
    if (unrevealedSafe === 0) {
      handleWin();
    }
  };

  const toggleFlag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;
    if (grid[y][x].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    if (!newGrid[y][x].isFlagged && flags >= MINES) return; // Optional max flags

    newGrid[y][x].isFlagged = !newGrid[y][x].isFlagged;
    setFlags(prev => prev + (newGrid[y][x].isFlagged ? 1 : -1));
    setGrid(newGrid);
  };

  const resetGame = () => {
    setGrid(Array(ROWS).fill(null).map((_, y) => 
      Array(COLS).fill(null).map((_, x) => ({
        x, y, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
      }))
    ));
    setGameState('idle');
    setFlags(0);
    setTime(0);
    setFace('🙂');
  };

  const formatNumber = (num: number) => {
    return num.toString().padStart(3, '0');
  };

  return (
    <div 
      className={`h-full flex flex-col items-center justify-start pt-6 bg-[#c0c0c0] font-sans user-select-none select-none relative ${isGlitching ? 'animate-pulse' : ''} ${neuralBridgeActive && isGlitching ? 'hue-rotate-180 invert' : ''}`}
      onClick={() => { if (menuOpen) setMenuOpen(null); }}
    >
      
      {/* Menu Bar */}
      <div className="absolute top-0 left-0 w-full bg-[#c0c0c0] flex items-center text-sm px-1 z-[60]">
        <div className="relative">
          <button 
            className={`px-2 py-0.5 font-bold outline-none ${menuOpen === 'game' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white text-black'}`}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => prev === 'game' ? null : 'game'); }}
            onMouseEnter={() => { if (menuOpen) setMenuOpen('game'); }}
          >
            <span className="underline">G</span>ame
          </button>
          {menuOpen === 'game' && (
            <div className="absolute top-full left-0 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[2px_2px_0_rgba(0,0,0,0.5)] py-1 min-w-[140px] flex flex-col border-solid text-black">
              <button className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { resetGame(); setMenuOpen(null); }}>New</button>
              <div className="border-b border-white my-1 mx-2" style={{ borderTop: "1px solid #808080" }}></div>
              <button className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { setShowBestTimes(true); setMenuOpen(null); }}>Best Times...</button>
              <div className="border-b border-white my-1 mx-2" style={{ borderTop: "1px solid #808080" }}></div>
              <button className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { onClose(); setMenuOpen(null); }}>Exit</button>
            </div>
          )}
        </div>
        <div className="relative">
          <button 
            className={`px-2 py-0.5 font-bold outline-none ${menuOpen === 'help' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white text-black'}`}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => prev === 'help' ? null : 'help'); }}
            onMouseEnter={() => { if (menuOpen) setMenuOpen('help'); }}
          >
            <span className="underline">H</span>elp
          </button>
          {menuOpen === 'help' && (
            <div className="absolute top-full left-0 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[2px_2px_0_rgba(0,0,0,0.5)] py-1 min-w-[140px] flex flex-col border-solid text-black">
              <button className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white whitespace-nowrap" onClick={() => { alert('V-Sweeper\nProperty of Vespera Systems'); setMenuOpen(null); }}>About V-Sweeper...</button>
            </div>
          )}
        </div>
      </div>

      {/* Outer border */}
      <div className="border-[3px] border-l-white border-t-white border-r-[#808080] border-b-[#808080] p-2 bg-[#c0c0c0] inline-block mt-2 shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        
        {/* Header HUD */}
        <div className="flex justify-between items-center mb-2 p-1 border-[2px] border-l-[#808080] border-t-[#808080] border-r-white border-b-white bg-[#c0c0c0]">
          
          {/* Mines Counter */}
          <div className="bg-black text-red-600 font-mono text-2xl px-1 font-bold tracking-tighter" style={{ textShadow: '0 0 2px red' }}>
            {formatNumber(MINES - flags)}
          </div>
          
          {/* Face Button */}
          <button 
            onClick={resetGame}
            onMouseDown={() => setFace('😮')}
            onMouseUp={() => setFace(gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : '🙂')}
            onMouseLeave={() => setFace(gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : '🙂')}
            className="w-8 h-8 flex items-center justify-center text-xl bg-[#c0c0c0] border-[2px] border-l-white border-t-white border-r-[#808080] border-b-[#808080] active:border-l-[#808080] active:border-t-[#808080] active:border-r-white active:border-b-white active:p-[1px_0_0_1px]"
          >
            {face}
          </button>
          
          {/* Timer */}
          <div className="bg-black text-red-600 font-mono text-2xl px-1 font-bold tracking-tighter" style={{ textShadow: '0 0 2px red' }}>
            {formatNumber(time)}
          </div>
        </div>

        {/* Game Grid */}
        <div className="border-[3px] border-l-[#808080] border-t-[#808080] border-r-white border-b-white bg-[#c0c0c0]">
          {grid.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => {
                const isRevealed = cell.isRevealed;
                let cellContent = '';
                let colorClass = '';

                if (isRevealed) {
                  if (cell.isMine) {
                    cellContent = '💣';
                  } else if (cell.neighborMines > 0) {
                    cellContent = cell.neighborMines.toString();
                    colorClass = NUMBER_COLORS[cell.neighborMines];
                  }
                } else if (cell.isFlagged) {
                  cellContent = '🚩';
                } else if (gameState === 'lost' && cell.isMine && !cell.isFlagged) {
                   // At game over, show unflagged mines
                   cellContent = '💣';
                }

                // If flagged wrong at game over
                if (gameState === 'lost' && cell.isFlagged && !cell.isMine) {
                  cellContent = '❌';
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    onMouseDown={(e) => {
                      if (e.button === 0 && !cell.isRevealed && gameState !== 'lost' && gameState !== 'won' && !cell.isFlagged) {
                        setFace('😮');
                      }
                    }}
                    onMouseUp={(e) => {
                      if (e.button === 0 && gameState !== 'lost' && gameState !== 'won') {
                        setFace('🙂');
                      }
                    }}
                    onMouseLeave={() => {
                        if(gameState !== 'lost' && gameState !== 'won') setFace('🙂');
                    }}
                    onClick={() => revealCell(x, y)}
                    onContextMenu={(e) => toggleFlag(e, x, y)}
                    className={`w-5 h-5 flex items-center justify-center font-bold text-sm select-none ${
                        isRevealed 
                         ? cell.exploded ? 'bg-red-500 border border-[#808080]' : 'border border-[#808080]' 
                         : 'bg-[#c0c0c0] border-[2px] border-l-white border-t-white border-r-[#808080] border-b-[#808080]'
                    } ${isRevealed ? 'shadow-inner' : ''}`}
                    style={{ color: colorClass }}
                  >
                    {cellContent}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {isGlitching && (
        <div className="absolute inset-0 bg-red-900 opacity-30 pointer-events-none mix-blend-color-burn z-[40] flex items-center justify-center">
            <span className="font-mono text-white text-3xl font-bold animate-ping opacity-50 text-center">FATAL_EXCEPTION_0E<br/>AT SECTOR 0028:C001</span>
        </div>
      )}

      {/* Modals */}
      {showBestTimes && (
         <div className="absolute inset-0 bg-black/20 z-[80] flex items-center justify-center pointer-events-auto">
           <div className="bg-[#c0c0c0] border-[3px] border-l-white border-t-white border-r-[#808080] border-b-[#808080] p-4 flex flex-col min-w-[200px] text-black shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
             <h2 className="text-md font-bold mb-4 font-sans text-center px-4 w-full border-b border-[#808080] border-solid pb-2" style={{ borderBottomColor: '#ffffff' }}>Fastest Mine Sweeper</h2>
             <div className="flex justify-between font-mono text-sm px-2 gap-4">
               <span>Beginner:</span>
               <span>{bestScore?.time ?? 999}s</span>
               <span>{bestScore?.name || 'Anonymous'}</span>
             </div>
             
             <div className="flex justify-center gap-2 mt-6">
               <button className="px-4 py-1 text-sm border-[2px] border-l-white border-t-white border-r-[#808080] border-b-[#808080] active:border-l-[#808080] active:border-t-[#808080] active:border-r-white active:border-b-white font-bold" onClick={() => { setBestScore({ name: 'Anonymous', time: 999 }); localStorage.removeItem('versa_vsweeper_scores'); }}>Reset Scores</button>
               <button className="px-6 py-1 text-sm border-[2px] border-l-white border-t-white border-r-[#808080] border-b-[#808080] active:border-l-[#808080] active:border-t-[#808080] active:border-r-white active:border-b-white font-bold" onClick={() => setShowBestTimes(false)}>OK</button>
             </div>
           </div>
         </div>
      )}

      {scorePromptTime !== null && (
         <div className="absolute inset-0 bg-black/20 z-[80] flex items-center justify-center pointer-events-auto">
           <div className="bg-[#c0c0c0] border-[3px] border-l-white border-t-white border-r-[#808080] border-b-[#808080] p-4 flex flex-col min-w-[220px] text-black shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
             <h2 className="text-md font-bold mb-2 font-sans text-center">New High Score!</h2>
             <p className="mb-4 text-xs text-center font-sans tracking-tight">You have the fastest time for beginner<br/>level. Please enter your name.</p>
             <input 
               type="text" 
               maxLength={15}
               value={scoreNameValue} 
               onChange={e => setScoreNameValue(e.target.value)} 
               className="border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white px-2 py-1 mb-4 mx-2 text-black bg-white outline-none font-bold text-sm"
               autoFocus
             />
             <div className="flex justify-center">
               <button className="px-8 py-1 text-sm border-[2px] border-l-white border-t-white border-r-[#808080] border-b-[#808080] active:border-l-[#808080] active:border-t-[#808080] active:border-r-white active:border-b-white font-bold" onClick={() => {
                 const newScore = { name: scoreNameValue || 'Anonymous', time: scorePromptTime };
                 setBestScore(newScore);
                 localStorage.setItem('versa_vsweeper_scores', JSON.stringify(newScore));
                 setScorePromptTime(null);
                 setShowBestTimes(true);
               }}>OK</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};
