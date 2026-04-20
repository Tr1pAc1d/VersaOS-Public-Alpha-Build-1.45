import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Sprite constants ─────────────────────────────────────────────────
// Spritesheet: 923 × 576 px
// 13 columns (A–K) × 4 rows (Spades, Hearts, Clubs, Diamonds)
// Row 5 = card backs (we use column 0 = the red-dot pattern back)
const CARD_W = 71;
const CARD_H = 96;
const SPRITE = '/Cards/Solitaire%20all%20Cards.png';

// Row index in the spritesheet
const SUIT_ROW: Record<string, number> = {
  spades: 0,
  hearts: 1,
  clubs: 2,
  diamonds: 3,
};

// Column 0 of row 4 = standard red card back
const BACK_X = 0;
const BACK_Y = 4 * CARD_H;

type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let r = 1; r <= 13; r++) {
      deck.push({ id: `${suit}${r}`, suit, rank: r as Rank, faceUp: false });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isRed(suit: Suit) { return suit === 'hearts' || suit === 'diamonds'; }
function oppositeColor(a: Suit, b: Suit) { return isRed(a) !== isRed(b); }

// ── Card sprite component ─────────────────────────────────────────────
const CardSprite: React.FC<{
  card: Card;
  style?: React.CSSProperties;
  className?: string;
  draggable?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  highlight?: boolean;
}> = ({ card, style, className, draggable, onMouseDown, onDoubleClick, highlight }) => {
  const spriteX = card.faceUp ? (card.rank - 1) * CARD_W : BACK_X;
  const spriteY = card.faceUp ? SUIT_ROW[card.suit] * CARD_H : BACK_Y;

  return (
    <div
      className={className}
      draggable={false}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={{
        width: CARD_W,
        height: CARD_H,
        backgroundImage: `url('${SPRITE}')`,
        backgroundPosition: `-${spriteX}px -${spriteY}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        flexShrink: 0,
        cursor: draggable ? 'grab' : 'default',
        outline: highlight ? '2px solid yellow' : undefined,
        filter: highlight ? 'brightness(1.15)' : undefined,
        userSelect: 'none',
        ...style,
      }}
    />
  );
};

// ── Empty slot placeholder ────────────────────────────────────────────
const EmptySlot: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{
    width: CARD_W,
    height: CARD_H,
    border: '2px dashed #1a5c1a',
    borderRadius: 4,
    backgroundColor: '#0a3d0a',
    flexShrink: 0,
    ...style,
  }} />
);

// ── Drag state ────────────────────────────────────────────────────────
interface DragInfo {
  cards: Card[];
  source: 'stock' | 'waste' | 'tableau' | 'foundation';
  tableauCol?: number;
  foundationIdx?: number;
  cardIndexInCol?: number;
  // ghost position
  startX: number;
  startY: number;
  curX: number;
  curY: number;
  offsetX: number;
  offsetY: number;
}

// ── Game state ────────────────────────────────────────────────────────
interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];   // 4 piles: spades, hearts, clubs, diamonds
  tableau: Card[][];       // 7 columns
  score: number;
  dealMode: 1 | 3;
  wasteDrawn: number;      // how many we've drawn in current pass (for deal-3)
}

function buildInitial(dealMode: 1 | 3): GameState {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck.pop()!;
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }
  return {
    stock: deck.map(c => ({ ...c, faceUp: false })),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    score: 0,
    dealMode,
    wasteDrawn: 0,
  };
}

function foundationIndexForSuit(suit: Suit): number {
  return SUITS.indexOf(suit);
}

function canStackOnFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1];
  return top.suit === card.suit && top.rank + 1 === card.rank;
}

function canStackOnTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) return card.rank === 13;
  const top = column[column.length - 1];
  return top.faceUp && oppositeColor(card.suit, top.suit) && top.rank - 1 === card.rank;
}

// ── Main component ────────────────────────────────────────────────────
export const NeuralSolitaire: React.FC = () => {
  type PlayScreen = 'home' | 'game' | 'scores' | 'tips';
  const [currentScreen, setCurrentScreen] = useState<PlayScreen>('home');
  const [highScores, setHighScores] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('versa_solitaire_scores');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [gs, setGs] = useState<GameState>(() => buildInitial(1));
  const [drag, setDrag] = useState<DragInfo | null>(null);
  const [won, setWon] = useState(false);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragInfo | null>(null);

  const btnStyle = (fontSize: number, isDialog = false): React.CSSProperties => ({
    fontSize, padding: '6px 16px', cursor: 'pointer',
    background: '#c0c0c0', border: '2px solid',
    borderTopColor: '#fff', borderLeftColor: '#fff',
    borderBottomColor: '#808080', borderRightColor: '#808080',
    color: '#000', fontFamily: 'monospace', fontWeight: 'bold',
    width: isDialog ? 'auto' : '200px',
  });

  // Keep dragRef in sync for mousemove handler
  useEffect(() => { dragRef.current = drag; }, [drag]);

  // Win check
  useEffect(() => {
    if (gs.foundations.every(f => f.length === 13)) {
      setWon(true);
      if (gs.score > 0) {
        setHighScores(prev => {
          const next = [...prev, gs.score].sort((a,b) => b - a).slice(0, 10);
          localStorage.setItem('versa_solitaire_scores', JSON.stringify(next));
          return next;
        });
      }
    }
  }, [gs.foundations, gs.score]);

  // ── Stock click (deal) ──────────────────────────────────────────────
  const handleStockClick = useCallback(() => {
    setGs(prev => {
      const { stock, waste, dealMode } = prev;
      if (stock.length === 0) {
        // Recycle waste
        if (waste.length === 0) return prev;
        return { ...prev, stock: [...waste].reverse().map(c => ({ ...c, faceUp: false })), waste: [], wasteDrawn: 0 };
      }
      const count = Math.min(dealMode, stock.length);
      const drawn = stock.slice(-count).map(c => ({ ...c, faceUp: true }));
      return {
        ...prev,
        stock: stock.slice(0, -count),
        waste: [...waste, ...drawn],
        score: prev.score + (dealMode === 1 ? 0 : -10),
        wasteDrawn: prev.wasteDrawn + count,
      };
    });
  }, []);

  // ── Double-click auto-move ─────────────────────────────────────────
  const autoMoveToFoundation = useCallback((card: Card, source: 'waste' | 'tableau', tableauCol?: number) => {
    setGs(prev => {
      const fi = foundationIndexForSuit(card.suit);
      if (!canStackOnFoundation(card, prev.foundations[fi])) return prev;

      const newFoundations = prev.foundations.map((f, i) =>
        i === fi ? [...f, { ...card, faceUp: true }] : f
      );
      let newScore = prev.score + 10;

      if (source === 'waste') {
        return { ...prev, waste: prev.waste.slice(0, -1), foundations: newFoundations, score: newScore };
      } else {
        const newTableau = prev.tableau.map((col, i) => {
          if (i !== tableauCol) return col;
          const next = col.slice(0, -1);
          if (next.length > 0 && !next[next.length - 1].faceUp) {
            next[next.length - 1] = { ...next[next.length - 1], faceUp: true };
            newScore += 5;
          }
          return next;
        });
        return { ...prev, tableau: newTableau, foundations: newFoundations, score: newScore };
      }
    });
  }, []);

  // ── Drag start ─────────────────────────────────────────────────────
  const startDrag = useCallback((
    e: React.MouseEvent,
    cards: Card[],
    source: DragInfo['source'],
    options: { tableauCol?: number; foundationIdx?: number; cardIndexInCol?: number }
  ) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 1, height: 1 };
    const scaleX = (containerRef.current?.offsetWidth || 1) / containerRect.width;
    const scaleY = (containerRef.current?.offsetHeight || 1) / containerRect.height;

    const info: DragInfo = {
      cards,
      source,
      ...options,
      startX: (e.clientX - containerRect.left) * scaleX,
      startY: (e.clientY - containerRect.top) * scaleY,
      curX: (e.clientX - containerRect.left) * scaleX,
      curY: (e.clientY - containerRect.top) * scaleY,
      offsetX: (e.clientX - rect.left) * scaleX,
      offsetY: (e.clientY - rect.top) * scaleY,
    };
    setDrag(info);
  }, []);

  // ── Drop logic ─────────────────────────────────────────────────────
  const commitDrop = useCallback((target: string) => {
    const d = dragRef.current;
    if (!d) return;

    setGs(prev => {
      const cards = d.cards;
      const topCard = cards[0];

      // Helper: remove cards from source
      const removeFromSource = (state: GameState): GameState => {
        if (d.source === 'waste') {
          return { ...state, waste: state.waste.slice(0, -1) };
        }
        if (d.source === 'foundation') {
          const newF = state.foundations.map((f, i) =>
            i === d.foundationIdx ? f.slice(0, -1) : f
          );
          return { ...state, foundations: newF };
        }
        if (d.source === 'tableau') {
          const col = d.tableauCol!;
          const newT = state.tableau.map((c, i) => {
            if (i !== col) return c;
            const cut = c.slice(0, d.cardIndexInCol!);
            if (cut.length > 0 && !cut[cut.length - 1].faceUp) {
              cut[cut.length - 1] = { ...cut[cut.length - 1], faceUp: true };
            }
            return cut;
          });
          return { ...state, tableau: newT };
        }
        return state;
      };

      if (target.startsWith('foundation-')) {
        const fi = parseInt(target.split('-')[1]);
        if (cards.length !== 1) return prev;
        if (!canStackOnFoundation(topCard, prev.foundations[fi])) return prev;
        let next = removeFromSource(prev);
        next = {
          ...next,
          foundations: next.foundations.map((f, i) => i === fi ? [...f, { ...topCard, faceUp: true }] : f),
          score: next.score + 10 + (d.source === 'tableau' ? 5 : 0),
        };
        return next;
      }

      if (target.startsWith('tableau-')) {
        const ti = parseInt(target.split('-')[1]);
        if (!canStackOnTableau(topCard, prev.tableau[ti])) return prev;
        let scoreAdd = 0;
        if (d.source === 'waste') scoreAdd = 5;
        if (d.source === 'foundation') scoreAdd = -15;
        let next = removeFromSource(prev);
        next = {
          ...next,
          tableau: next.tableau.map((col, i) => i === ti ? [...col, ...cards.map(c => ({ ...c, faceUp: true }))] : col),
          score: Math.max(0, next.score + scoreAdd),
        };
        return next;
      }

      return prev;
    });
  }, []);

  // ── Global mouse events ────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const scaleX = (containerRef.current?.offsetWidth || 1) / containerRect.width;
      const scaleY = (containerRef.current?.offsetHeight || 1) / containerRect.height;
      setDrag(prev => prev ? {
        ...prev,
        curX: (e.clientX - containerRect.left) * scaleX,
        curY: (e.clientY - containerRect.top) * scaleY,
      } : null);
    };

    const onUp = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;

      // Hit test drop zones
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) { setDrag(null); return; }
      const scaleX = (containerRef.current?.offsetWidth || 1) / containerRect.width;
      const scaleY = (containerRef.current?.offsetHeight || 1) / containerRect.height;
      const lx = (e.clientX - containerRect.left) * scaleX;
      const ly = (e.clientY - containerRect.top) * scaleY;

      // Check foundations
      for (let fi = 0; fi < 4; fi++) {
        const fx = FOUNDATION_X + fi * (CARD_W + GAP);
        if (lx >= fx && lx <= fx + CARD_W && ly >= TOP_Y && ly <= TOP_Y + CARD_H) {
          commitDrop(`foundation-${fi}`);
          setDrag(null);
          setDropTarget(null);
          return;
        }
      }
      // Check tablwau
      for (let ti = 0; ti < 7; ti++) {
        const tx = TABLEAU_X + ti * (CARD_W + GAP);
        if (lx >= tx && lx <= tx + CARD_W && ly >= TABLEAU_Y) {
          commitDrop(`tableau-${ti}`);
          setDrag(null);
          setDropTarget(null);
          return;
        }
      }
      setDrag(null);
      setDropTarget(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [commitDrop]);

  // ── Layout constants (logical px inside the 730×580 window) ────────
  const AREA_W = 710;
  const GAP = 8;
  const MARGIN = 10;
  const TOP_Y = 10;
  const TABLEAU_Y = TOP_Y + CARD_H + 20;
  const STOCK_X = MARGIN;
  const WASTE_X = STOCK_X + CARD_W + GAP;
  const FOUNDATION_X = WASTE_X + CARD_W + GAP * 4;
  const TABLEAU_X = MARGIN;
  const TAB_OFFSET_DOWN = 20;  // face-down overlap
  const TAB_OFFSET_UP = 28;    // face-up overlap

  // Compute hover target for visual feedback
  const getHoverTarget = (lx: number, ly: number): string | null => {
    for (let fi = 0; fi < 4; fi++) {
      const fx = FOUNDATION_X + fi * (CARD_W + GAP);
      if (lx >= fx && lx <= fx + CARD_W && ly >= TOP_Y && ly <= TOP_Y + CARD_H)
        return `foundation-${fi}`;
    }
    for (let ti = 0; ti < 7; ti++) {
      const tx = TABLEAU_X + ti * (CARD_W + GAP);
      if (lx >= tx && lx <= tx + CARD_W && ly >= TABLEAU_Y)
        return `tableau-${ti}`;
    }
    return null;
  };

  // Update drop target while dragging
  useEffect(() => {
    if (!drag) { setDropTarget(null); return; }
    const t = getHoverTarget(drag.curX, drag.curY);
    setDropTarget(t);
  }, [drag?.curX, drag?.curY]);

  const gameAreaH = 580;

  const isDragging = (source: DragInfo['source'], col?: number, idx?: number) => {
    if (!drag) return false;
    if (drag.source !== source) return false;
    if (source === 'tableau' && drag.tableauCol === col && drag.cardIndexInCol !== undefined) {
      return idx !== undefined && idx >= drag.cardIndexInCol;
    }
    if (source === 'waste') return true;
    if (source === 'foundation' && drag.foundationIdx === col) return true;
    return false;
  };

  const newGame = () => {
    setWon(false);
    setDrag(null);
    setGs(buildInitial(gs.dealMode));
  };

  const toggleDealMode = () => {
    setGs(prev => ({ ...prev, dealMode: prev.dealMode === 1 ? 3 : 1 }));
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={e => e.stopPropagation()}
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a5c1a 0%, #0d3d0d 100%)',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'monospace',
        cursor: drag ? 'grabbing' : 'default',
      }}
    >
      {/* ── Overlay Screens ───────────────────────────────────────── */}
      {currentScreen !== 'game' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10, 61, 10, 0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          color: '#fff',
          fontFamily: 'monospace',
        }}>
          {currentScreen === 'home' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <CardSprite card={{ id: 'demo1', suit: 'spades', rank: 1, faceUp: true }} style={{ transform: 'rotate(-10deg)', marginRight: -20, boxShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} />
                <CardSprite card={{ id: 'demo2', suit: 'hearts', rank: 13, faceUp: true }} style={{ transform: 'rotate(5deg)', zIndex: 1, boxShadow: '2px 2px 8px rgba(0,0,0,0.5)' }} />
              </div>
              <h1 style={{ fontSize: 32, marginBottom: 8, textShadow: '2px 2px 0 #000' }}>NEURAL SOLITAIRE</h1>
              <p style={{ color: '#7fff7f', marginBottom: 32 }}>Standard Klondike Rules</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <button onClick={() => { if(won) newGame(); setCurrentScreen('game'); }} style={btnStyle(18)}>Play Game</button>
                <button onClick={() => setCurrentScreen('scores')} style={btnStyle(14)}>High Scores</button>
                <button onClick={() => setCurrentScreen('tips')} style={btnStyle(14)}>How to Play</button>
              </div>
            </div>
          )}
          {currentScreen === 'scores' && (
            <div style={{ width: 300, background: '#c0c0c0', color: '#000', border: '3px solid', borderTopColor: '#fff', borderLeftColor: '#fff', borderBottomColor: '#808080', borderRightColor: '#808080', padding: 16, boxShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}>
              <div style={{ background: '#000080', color: '#fff', padding: '4px 8px', fontWeight: 'bold', marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>HIGH SCORES</div>
              <ol style={{ paddingLeft: 24, fontSize: 14, minHeight: 120 }}>
                {highScores.length === 0 ? <li>No scores yet!</li> : highScores.map((s, i) => <li key={i} style={{ marginBottom: 4, fontWeight: 'bold' }}>{s} pts</li>)}
              </ol>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={() => setCurrentScreen('home')} style={btnStyle(12, true)}>Back to Menu</button>
              </div>
            </div>
          )}
          {currentScreen === 'tips' && (
            <div style={{ width: 400, background: '#c0c0c0', color: '#000', border: '3px solid', borderTopColor: '#fff', borderLeftColor: '#fff', borderBottomColor: '#808080', borderRightColor: '#808080', padding: 16, boxShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}>
              <div style={{ background: '#000080', color: '#fff', padding: '4px 8px', fontWeight: 'bold', marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>HOW TO PLAY</div>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                <p><strong>Objective:</strong> Build up all four foundation piles (♠ ♥ ♣ ♦) from Ace to King.</p>
                <p style={{ marginTop: 8 }}><strong>Tableau:</strong> Build down columns in alternating colors (e.g. Red 6 on Black 7). Move multiple cards at once if they are sorted.</p>
                <p style={{ marginTop: 8 }}><strong>Empty columns:</strong> Can only be filled by a King.</p>
                <p style={{ marginTop: 8 }}><strong>Stock:</strong> Click to deal to the waste pile. Change Deal modes (1 or 3) from the top bar.</p>
                <p style={{ marginTop: 8 }}><strong>Controls:</strong> Click and drag to move cards. Double-click a card to auto-move it to foundations.</p>
              </div>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={() => setCurrentScreen('home')} style={btnStyle(12, true)}>Back to Menu</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 24,
        background: '#0a3d0a',
        borderBottom: '1px solid #2a7a2a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 12,
        zIndex: 20,
      }}>
        <span style={{ color: '#7fff7f', fontSize: 11, fontWeight: 'bold' }}>
          SCORE: <span style={{ color: '#fff' }}>{gs.score}</span>
        </span>
        <span style={{ color: '#7fff7f', fontSize: 11 }}>
          STOCK: <span style={{ color: '#fff' }}>{gs.stock.length}</span>
        </span>
        <span style={{ color: '#7fff7f', fontSize: 11 }}>
          DEAL: <span style={{ color: '#fff' }}>{gs.dealMode}</span>
        </span>
        <button
          onClick={toggleDealMode}
          style={{
            fontSize: 10, padding: '1px 6px', cursor: 'pointer',
            background: '#c0c0c0', border: '2px solid',
            borderTopColor: '#fff', borderLeftColor: '#fff',
            borderBottomColor: '#808080', borderRightColor: '#808080',
            color: '#000', fontFamily: 'monospace',
          }}
        >
          Deal {gs.dealMode === 1 ? '3' : '1'}
        </button>
        <button
          onClick={newGame}
          style={{
            fontSize: 10, padding: '1px 6px', cursor: 'pointer', marginLeft: 4,
            background: '#c0c0c0', border: '2px solid',
            borderTopColor: '#fff', borderLeftColor: '#fff',
            borderBottomColor: '#808080', borderRightColor: '#808080',
            color: '#000', fontFamily: 'monospace',
          }}
        >
          New Game
        </button>
        <button
          onClick={() => setCurrentScreen('home')}
          style={{
            fontSize: 10, padding: '1px 6px', cursor: 'pointer', marginLeft: 4,
            background: '#c0c0c0', border: '2px solid',
            borderTopColor: '#fff', borderLeftColor: '#fff',
            borderBottomColor: '#808080', borderRightColor: '#808080',
            color: '#000', fontFamily: 'monospace',
          }}
        >
          Menu
        </button>
      </div>

      {/* ── Logical game area ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 24, left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
      }}>

        {/* Stock */}
        <div
          onClick={handleStockClick}
          style={{ position: 'absolute', left: STOCK_X, top: TOP_Y, cursor: 'pointer', zIndex: 5 }}
        >
          {gs.stock.length > 0 ? (
            <CardSprite card={{ ...gs.stock[gs.stock.length - 1], faceUp: false }} />
          ) : (
            <EmptySlot />
          )}
        </div>

        {/* Waste */}
        <div style={{ position: 'absolute', left: WASTE_X, top: TOP_Y, zIndex: 5 }}>
          {gs.waste.length === 0 ? (
            <EmptySlot />
          ) : (
            (() => {
              // Show up to 3 cards fanned
              const show = gs.dealMode === 3
                ? gs.waste.slice(Math.max(0, gs.waste.length - 3))
                : [gs.waste[gs.waste.length - 1]];
              return (
                <div style={{ position: 'relative', width: CARD_W + (show.length - 1) * 16, height: CARD_H }}>
                  {show.map((c, idx) => {
                    const isTop = idx === show.length - 1;
                    const draggable = isTop;
                    const beingDragged = isTop && isDragging('waste');
                    return (
                      <CardSprite
                        key={c.id}
                        card={{ ...c, faceUp: true }}
                        style={{
                          position: 'absolute',
                          left: idx * 16,
                          top: 0,
                          opacity: beingDragged ? 0.35 : 1,
                          zIndex: idx,
                        }}
                        draggable={draggable}
                        onMouseDown={draggable && !beingDragged ? (e) => {
                          startDrag(e, [c], 'waste', {});
                        } : undefined}
                        onDoubleClick={isTop ? () => autoMoveToFoundation(c, 'waste') : undefined}
                      />
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Foundations */}
        {gs.foundations.map((f, fi) => {
          const fx = FOUNDATION_X + fi * (CARD_W + GAP);
          const topCard = f.length > 0 ? f[f.length - 1] : null;
          const isTarget = dropTarget === `foundation-${fi}`;
          return (
            <div
              key={fi}
              style={{ position: 'absolute', left: fx, top: TOP_Y, zIndex: 5 }}
            >
              {topCard ? (
                <CardSprite
                  card={{ ...topCard, faceUp: true }}
                  highlight={isTarget}
                  style={{ opacity: isDragging('foundation', undefined, fi) ? 0.35 : 1 }}
                  onMouseDown={(e) => {
                    if (!isDragging('foundation')) startDrag(e, [topCard], 'foundation', { foundationIdx: fi });
                  }}
                />
              ) : (
                <EmptySlot style={{ borderColor: isTarget ? '#ffff44' : undefined, backgroundColor: isTarget ? '#1a5c00' : undefined }} />
              )}
              {/* Suit label */}
              <div style={{
                position: 'absolute', top: 2, right: 4,
                fontSize: 14, color: fi === 1 || fi === 3 ? '#cc0000' : '#333',
                pointerEvents: 'none', fontWeight: 'bold',
              }}>
                {['♠', '♥', '♣', '♦'][fi]}
              </div>
            </div>
          );
        })}

        {/* Tableau */}
        {gs.tableau.map((col, ti) => {
          const tx = TABLEAU_X + ti * (CARD_W + GAP);
          const isTarget = dropTarget === `tableau-${ti}`;
          return (
            <div key={ti} style={{ position: 'absolute', left: tx, top: TABLEAU_Y }}>
              {col.length === 0 ? (
                <EmptySlot style={{ borderColor: isTarget ? '#ffff44' : undefined, backgroundColor: isTarget ? '#1a5c00' : undefined }} />
              ) : (
                col.map((card, ci) => {
                  const beingDragged = isDragging('tableau', ti, ci);
                  const isTopCard = ci === col.length - 1;
                  const isDraggable = card.faceUp;

                  return (
                    <CardSprite
                      key={card.id}
                      card={card}
                      highlight={isTarget && isTopCard}
                      style={{
                        position: 'absolute',
                        top: (() => {
                          let y = 0;
                          for (let i = 0; i < ci; i++) {
                            y += col[i].faceUp ? TAB_OFFSET_UP : TAB_OFFSET_DOWN;
                          }
                          return y;
                        })(),
                        opacity: beingDragged ? 0.25 : 1,
                        zIndex: ci + 1,
                        cursor: !card.faceUp ? 'default' : (isDraggable ? 'grab' : 'default'),
                      }}
                      draggable={isDraggable}
                      onMouseDown={isDraggable && !beingDragged ? (e) => {
                        const dragCards = col.slice(ci);
                        startDrag(e, dragCards, 'tableau', { tableauCol: ti, cardIndexInCol: ci });
                      } : undefined}
                      onDoubleClick={isTopCard && card.faceUp ? () => autoMoveToFoundation(card, 'tableau', ti) : undefined}
                    />
                  );
                })
              )}
            </div>
          );
        })}

        {/* ── Drag ghost ──────────────────────────────────────────── */}
        {drag && (
          <div style={{
            position: 'absolute',
            left: drag.curX - drag.offsetX,
            top: drag.curY - drag.offsetY,
            zIndex: 999,
            pointerEvents: 'none',
          }}>
            {drag.cards.map((card, i) => (
              <CardSprite
                key={card.id}
                card={{ ...card, faceUp: true }}
                style={{
                  position: i === 0 ? 'relative' : 'absolute',
                  top: i === 0 ? 0 : i * TAB_OFFSET_UP,
                  left: 0,
                  boxShadow: '4px 4px 12px rgba(0,0,0,0.6)',
                  cursor: 'grabbing',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Win screen ────────────────────────────────────────────── */}
      {won && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#c0c0c0',
            border: '3px solid',
            borderTopColor: '#fff', borderLeftColor: '#fff',
            borderBottomColor: '#808080', borderRightColor: '#808080',
            padding: '24px 32px',
            textAlign: 'center',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
            fontFamily: 'monospace',
          }}>
            <div style={{
              background: '#000080', color: '#fff',
              padding: '4px 12px', marginBottom: 16,
              fontSize: 14, fontWeight: 'bold', letterSpacing: 2,
            }}>
              🎉 YOU WIN! 🎉
            </div>
            <p style={{ fontSize: 13, marginBottom: 8 }}>
              Final Score: <strong>{gs.score}</strong>
            </p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>
              All 52 cards in the foundations!
            </p>
            <button
              onClick={newGame}
              style={{
                padding: '4px 20px', cursor: 'pointer',
                background: '#c0c0c0', border: '2px solid',
                borderTopColor: '#fff', borderLeftColor: '#fff',
                borderBottomColor: '#808080', borderRightColor: '#808080',
                fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold',
              }}
              onMouseDown={e => {
                (e.currentTarget.style.borderTopColor) = '#808080';
                (e.currentTarget.style.borderLeftColor) = '#808080';
                (e.currentTarget.style.borderBottomColor) = '#fff';
                (e.currentTarget.style.borderRightColor) = '#fff';
              }}
              onMouseUp={e => {
                (e.currentTarget.style.borderTopColor) = '#fff';
                (e.currentTarget.style.borderLeftColor) = '#fff';
                (e.currentTarget.style.borderBottomColor) = '#808080';
                (e.currentTarget.style.borderRightColor) = '#808080';
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
