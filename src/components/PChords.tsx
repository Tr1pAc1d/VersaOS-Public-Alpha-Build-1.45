import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// C4 = 261.63 Hz; each step = * 2^(1/12)
const CHROMATIC_FREQS = Array.from({ length: 25 }, (_, i) => 261.63 * Math.pow(2, i / 12));

const CHORD_DEFS = [
  // Row 0 (cyan)
  { name: 'Ma',       intervals: [0, 4, 7],              row: 0 },
  { name: 'Ma7',      intervals: [0, 4, 7, 11],          row: 0 },
  { name: 'm',        intervals: [0, 3, 7],              row: 0 },
  { name: 'm7',       intervals: [0, 3, 7, 10],          row: 0 },
  { name: '7',        intervals: [0, 4, 7, 10],          row: 0 },
  { name: 'm7(b5)',   intervals: [0, 3, 6, 10],          row: 0 },
  { name: 'dim',      intervals: [0, 3, 6],              row: 0 },
  { name: 'aug',      intervals: [0, 4, 8],              row: 0 },
  // Row 1 (pink)
  { name: 'sus2',     intervals: [0, 2, 7],              row: 1 },
  { name: 'sus4',     intervals: [0, 5, 7],              row: 1 },
  { name: '9',        intervals: [0, 4, 7, 10, 14],      row: 1 },
  { name: 'm9',       intervals: [0, 3, 7, 10, 14],      row: 1 },
  { name: '6',        intervals: [0, 4, 7, 9],           row: 1 },
  { name: 'm6',       intervals: [0, 3, 7, 9],           row: 1 },
  { name: 'maj9',     intervals: [0, 4, 7, 11, 14],      row: 1 },
  { name: '7sus4',    intervals: [0, 5, 7, 10],          row: 1 },
  // Row 2 (green)
  { name: '11',       intervals: [0, 4, 7, 10, 14, 17],  row: 2 },
  { name: '13',       intervals: [0, 4, 7, 10, 14, 21],  row: 2 },
  { name: 'maj7(b5)', intervals: [0, 4, 6, 11],          row: 2 },
  { name: 'mMaj7',    intervals: [0, 3, 7, 11],          row: 2 },
  { name: 'C6/9',     intervals: [0, 4, 7, 9, 14],       row: 2 },
  { name: 'maj7',     intervals: [0, 4, 7, 11],          row: 2 },
  { name: '7(b9)',    intervals: [0, 4, 7, 10, 13],      row: 2 },
  { name: 'm7(b9)',   intervals: [0, 3, 7, 10, 13],      row: 2 },
];

const ROOT_COLORS = [
  '#ffb878', '#ff9898', '#e8a8ff', '#cc84ff', // C C# D D#
  '#ffa858', '#ff7878', '#dc90ff', '#b878de', // E F F# G
  '#ff9040', '#ff6060', '#ca70ea', '#a060cc', // G# A A# B
];

const ROOT_TEXT_DARK = [true, true, true, true, true, true, true, false, true, false, false, false];

// ─── Piano key layout ─────────────────────────────────────────────────────────
//
// For each chromatic position (0-11):
//   NOTE_IS_BLACK  – true for black keys
//   NOTE_WHITE_IDX – index of the white key immediately to the LEFT (for black keys)
//                    or the white key itself (for white keys)
//
// Two octaves (positions 0-24): octave offsets add 7 white keys each.

const NOTE_IS_BLACK  = [false,true,false,true,false,false,true,false,true,false,true,false];
const NOTE_WHITE_IDX = [0,    0,   1,    1,   2,    3,    3,   4,    4,   5,    5,   6   ];

const NUM_WHITE_KEYS = 15; // C4 … C6

// ─── Number-key → chromatic-key mapping (white keys of octave 4) ─────────────

const NUM_KEY_MAP: Record<string, number> = {
  '1': 0,  // C4
  '2': 2,  // D4
  '3': 4,  // E4
  '4': 5,  // F4
  '5': 7,  // G4
  '6': 9,  // A4
  '7': 11, // B4
  '8': 12, // C5
  '9': 14, // D5
  '0': 16, // E5
};

// ─── Row styling ──────────────────────────────────────────────────────────────

const ROW_BG     = ['#8ee8e8', '#e8b0e8', '#90e490'] as const;
const ROW_ACTIVE = ['#3ab8b8', '#c060c0', '#40b840'] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export const PChords: React.FC = () => {
  const [rootNote, setRootNote] = useState('C');
  const [chordType, setChordType] = useState('Ma');
  const [octave, setOctave]   = useState(4);
  const [waveform, setWaveform] = useState<OscillatorType>('sawtooth');
  const [activeKeys, setActiveKeys] = useState<ReadonlySet<number>>(new Set());

  // Refs – always up-to-date without stale closures
  const ctxRef  = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const octRef  = useRef(octave);
  const wavRef  = useRef<OscillatorType>(waveform);
  useEffect(() => { octRef.current = octave; },   [octave]);
  useEffect(() => { wavRef.current = waveform; }, [waveform]);

  // ── Audio helpers ────────────────────────────────────────────────────────────

  const getCtx = (): AudioContext => {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };

  const stopAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && nodesRef.current.length > 0) {
      const t = ctx.currentTime;
      nodesRef.current.forEach(({ osc, gain }) => {
        try {
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(gain.gain.value, t);
          gain.gain.exponentialRampToValueAtTime(0.00001, t + 0.06);
          osc.stop(t + 0.07);
        } catch { /* already stopped */ }
      });
    }
    nodesRef.current = [];
    setActiveKeys(new Set());
  }, []);

  const triggerKeys = useCallback((keys: number[]) => {
    stopAll();
    if (!keys.length) return;

    const ctx = getCtx();
    const t   = ctx.currentTime;
    const vol = Math.min(0.4, 0.65 / keys.length);
    const octShift = octRef.current - 4;

    keys.forEach(ki => {
      const clamped = Math.min(Math.max(ki, 0), 24);
      const freq = CHROMATIC_FREQS[clamped] * Math.pow(2, octShift);
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wavRef.current;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.015);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      nodesRef.current.push({ osc, gain });
    });

    setActiveKeys(new Set(keys));
  }, [stopAll]);

  // ── Play chord (root + type grid buttons) ───────────────────────────────────

  const playChord = useCallback((root: string, type: string) => {
    const rootIdx = NOTE_NAMES.indexOf(root);
    const def = CHORD_DEFS.find(c => c.name === type);
    if (!def) return;
    // Map intervals to absolute chromatic positions; clamp to 0-24
    const keys = def.intervals
      .map(iv => rootIdx + iv)
      .filter(k => k >= 0 && k <= 24);
    triggerKeys(keys);
  }, [triggerKeys]);

  // ── Play a single piano key ──────────────────────────────────────────────────

  const playSingleKey = useCallback((ki: number) => {
    setRootNote(NOTE_NAMES[ki % 12]);
    triggerKeys([ki]);
  }, [triggerKeys]);

  // ── Global mouse-up stops sound (handles drag-off key) ───────────────────────

  useEffect(() => {
    const onUp = () => stopAll();
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [stopAll]);

  // ── Number-key keyboard control ──────────────────────────────────────────────

  useEffect(() => {
    const held = new Set<string>();

    const onDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' || el.isContentEditable) return;
      if (e.repeat || held.has(e.key)) return;
      const ki = NUM_KEY_MAP[e.key];
      if (ki !== undefined) {
        held.add(e.key);
        playSingleKey(ki);
      }
    };

    const onUp = (e: KeyboardEvent) => {
      if (NUM_KEY_MAP[e.key] !== undefined) {
        held.delete(e.key);
        if (held.size === 0) stopAll();
      }
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, [playSingleKey, stopAll]);

  // ── Piano keyboard renderer ──────────────────────────────────────────────────
  //
  // White key width  = 100% / 15
  // Black key width  = WHITE_W * 0.57
  // Black key left   = (leftNeighbourWhiteIdx + 1) * WHITE_W  −  BLACK_W / 2
  //   → centres the black key exactly on the boundary between its two white neighbours

  const renderPiano = () => {
    const WW  = 100 / NUM_WHITE_KEYS;   // white key width (%)
    const BW  = WW * 0.57;              // black key width (%)

    const whites: React.ReactNode[] = [];
    const blacks: React.ReactNode[] = [];

    for (let ki = 0; ki < 25; ki++) {
      const noteInOct = ki % 12;
      const octK      = Math.floor(ki / 12);
      const isBlack   = NOTE_IS_BLACK[noteInOct];
      const wIdx      = NOTE_WHITE_IDX[noteInOct] + octK * 7;
      const isActive  = activeKeys.has(ki);

      if (!isBlack) {
        whites.push(
          <div
            key={ki}
            onMouseDown={e => { e.preventDefault(); playSingleKey(ki); }}
            style={{
              position:   'absolute',
              left:        `${wIdx * WW}%`,
              width:       `${WW - 0.25}%`,
              height:      '100%',
              background:  isActive
                ? 'linear-gradient(to bottom, #8dd4f8 0%, #5ab8f0 50%, #3ea0e0 100%)'
                : 'linear-gradient(to bottom, #fff 0%, #f4f4f4 70%, #ddd 100%)',
              border:       '1px solid #555',
              borderTop:    'none',
              borderRadius: '0 0 5px 5px',
              cursor:       'pointer',
              boxSizing:    'border-box',
              zIndex:        1,
              boxShadow:    isActive
                ? 'inset 0 3px 6px rgba(0,100,220,0.35), 1px 2px 3px rgba(0,0,0,0.3)'
                : 'inset 0 1px 0 #fff, 1px 2px 4px rgba(0,0,0,0.25)',
              transition:   'background 0.04s',
            }}
          />
        );
      } else {
        // Left edge = boundary between left and right white neighbour, minus half black width
        const left = (wIdx + 1) * WW - BW / 2;
        blacks.push(
          <div
            key={ki}
            onMouseDown={e => { e.preventDefault(); playSingleKey(ki); }}
            style={{
              position:   'absolute',
              left:        `${left}%`,
              width:       `${BW}%`,
              height:      '62%',
              background:  isActive
                ? 'linear-gradient(to bottom, #1a70c8 0%, #1050a0 100%)'
                : 'linear-gradient(to bottom, #282828 0%, #111 55%, #000 100%)',
              border:       '1px solid #000',
              borderTop:    'none',
              borderRadius: '0 0 4px 4px',
              cursor:       'pointer',
              boxSizing:    'border-box',
              zIndex:        2,
              boxShadow:    isActive
                ? 'inset 0 3px 8px rgba(80,180,255,0.5), 2px 4px 6px rgba(0,0,0,0.6)'
                : 'inset -1px 0 0 rgba(255,255,255,0.1), inset 0 -2px 0 rgba(255,255,255,0.05), 2px 5px 7px rgba(0,0,0,0.7)',
              transition:   'background 0.04s',
            }}
          />
        );
      }
    }

    return (
      <div
        style={{
          position:   'relative',
          height:      '130px',
          background: '#c8c8c8',
          border:     '3px solid',
          borderColor:'#808080 #fff #fff #808080',
          userSelect: 'none',
          padding:    '4px 3px 3px 3px',
          flexShrink:  0,
        }}
        onMouseLeave={stopAll}
      >
        {whites}
        {blacks}
      </div>
    );
  };

  // ── Button helpers ────────────────────────────────────────────────────────────

  const handleRootDown = (note: string) => {
    setRootNote(note);
    playChord(note, chordType);
  };

  const handleChordDown = (type: string) => {
    setChordType(type);
    playChord(rootNote, type);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#c0c0c0', fontFamily: "'Arial', sans-serif", userSelect: 'none',
      overflow: 'hidden',
    }}>

      {/* ── Header strip ──────────────────────────────────────────────────── */}
      <div style={{
        height: 34, display: 'flex', alignItems: 'stretch', position: 'relative',
        overflow: 'hidden', flexShrink: 0,
        background: 'linear-gradient(90deg, #000090 0%, #0018b8 35%, #0028d0 65%, #000068 100%)',
        borderBottom: '2px solid #00003a',
      }}>
        {/* Subtle scan-line texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 3px)',
        }} />

        {/* Left icon block */}
        <div style={{
          width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #2258ff 0%, #0030c8 100%)',
          borderRight: '1px solid rgba(255,255,255,0.18)', flexShrink: 0, zIndex: 1,
        }}>
          <Music size={14} color="#fff" />
        </div>

        {/* Title + subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 8, zIndex: 1, flex: 1 }}>
          <span style={{
            color: '#fff', fontWeight: 'bold', fontSize: 13,
            letterSpacing: '0.1em', fontFamily: 'Arial, sans-serif',
            textShadow: '0 0 8px rgba(120,160,255,0.9), 0 1px 3px rgba(0,0,0,0.9)',
          }}>
            PChords
          </span>
          <span style={{
            color: 'rgba(160,190,255,0.65)', fontSize: 8, fontFamily: 'monospace',
            letterSpacing: '0.25em', textTransform: 'uppercase',
            marginTop: 2, fontWeight: 'normal',
          }}>
            Polyphonic Synth
          </span>
        </div>

        {/* Mini piano keys decoration */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', paddingRight: 6, paddingBottom: 3,
          gap: 1, zIndex: 1,
        }}>
          {([false,true,false,true,false,false,true,false] as boolean[]).map((blk, i) => (
            <div key={i} style={{
              width: blk ? 4 : 6,
              height: blk ? 13 : 22,
              background: blk
                ? 'linear-gradient(180deg,#222,#000)'
                : 'linear-gradient(180deg,#eee,#ccc)',
              border: `1px solid ${blk ? '#000' : 'rgba(0,0,0,0.4)'}`,
              borderTop: 'none',
              borderRadius: '0 0 2px 2px',
              boxShadow: blk ? '1px 2px 2px rgba(0,0,0,0.6)' : 'none',
            }} />
          ))}
        </div>

        {/* Root-note rainbow stripe along the bottom edge */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, display: 'flex', pointerEvents: 'none',
        }}>
          {ROOT_COLORS.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', gap: 3, padding: 4,
        overflow: 'hidden',
      }}>

        {/* ── Top grid row ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 3, height: 82 }}>

          {/* Root note grid  4 × 3 */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
            gap: 1, background: '#707070', border: '2px solid', padding: 1,
            borderColor: '#808080 #fff #fff #808080', minWidth: 112, flexShrink: 0,
          }}>
            {NOTE_NAMES.map((note, i) => {
              const active = rootNote === note;
              return (
                <button
                  key={note}
                  onMouseDown={() => handleRootDown(note)}
                  style={{
                    background:  ROOT_COLORS[i],
                    border:      '2px solid',
                    borderColor: active
                      ? '#606060 #e0e0e0 #e0e0e0 #606060'
                      : '#e8e8e8 #606060 #606060 #e8e8e8',
                    fontSize:    11, fontWeight: 'bold', cursor: 'pointer',
                    color:       ROOT_TEXT_DARK[i] ? '#000' : '#fff',
                    padding:     0, outline: 'none',
                    transform:   active ? 'translateY(1px)' : 'none',
                    boxSizing:   'border-box',
                  }}
                >
                  {note}
                </button>
              );
            })}
          </div>

          {/* Chord type grid  8 × 3 */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
            gap: 1, background: '#707070', border: '2px solid', padding: 1,
            borderColor: '#808080 #fff #fff #808080', flex: 1,
          }}>
            {CHORD_DEFS.map(chord => {
              const active = chordType === chord.name;
              return (
                <button
                  key={chord.name}
                  onMouseDown={() => handleChordDown(chord.name)}
                  style={{
                    background:  active ? ROW_ACTIVE[chord.row] : ROW_BG[chord.row],
                    border:      '2px solid',
                    borderColor: active
                      ? '#505050 #d8d8d8 #d8d8d8 #505050'
                      : '#e8e8e8 #505050 #505050 #e8e8e8',
                    fontSize:   9, fontWeight: 'bold', cursor: 'pointer',
                    padding:    '1px 0', outline: 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                    transform:  active ? 'translateY(1px)' : 'none',
                    boxSizing:  'border-box',
                  }}
                >
                  {chord.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Control bar ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          background: '#c8c8c8', border: '2px solid', padding: '1px 4px',
          borderColor: '#808080 #fff #fff #808080', height: 26, flexShrink: 0,
        }}>
          {/* Chord display */}
          <div style={{
            background: '#000', color: '#fff', fontWeight: 'bold', fontSize: 12,
            padding: '0 8px', minWidth: 52, textAlign: 'center',
            border: '1px solid #606060', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {rootNote}{chordType}
          </div>
          {/* Octave – click to cycle */}
          <div
            onClick={() => setOctave(o => (o >= 7 ? 2 : o + 1))}
            title="Click to change octave"
            style={{
              background: '#000', color: '#fff', fontWeight: 'bold', fontSize: 12,
              padding: '0 6px', minWidth: 38, textAlign: 'center', cursor: 'pointer',
              border: '1px solid #606060', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {rootNote}{octave}
          </div>
          {/* Waveform */}
          <select
            value={waveform}
            onChange={e => setWaveform(e.target.value as OscillatorType)}
            style={{
              fontSize: 11, height: 20, background: '#c0c0c0', outline: 'none',
              border: '2px solid', borderColor: '#808080 #fff #fff #808080', cursor: 'pointer',
            }}
          >
            <option value="sawtooth">Sawtooth</option>
            <option value="square">Square</option>
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
          </select>
          {/* Scale */}
          <select style={{
            fontSize: 11, height: 20, flex: 1, background: '#c0c0c0', outline: 'none',
            border: '2px solid', borderColor: '#808080 #fff #fff #808080', cursor: 'pointer',
          }}>
            <option>Ryukyu Scale</option>
            <option>Major Scale</option>
            <option>Minor Scale</option>
            <option>Pentatonic</option>
            <option>Blues Scale</option>
            <option>Chromatic</option>
          </select>
          {/* MIDI stub */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3, paddingInline: 4, height: 20,
            background: '#c0c0c0', border: '2px solid', borderColor: '#808080 #fff #fff #808080',
            fontSize: 10, fontWeight: 'bold',
          }}>
            <Music size={9} />MIDI
          </div>
          <select disabled style={{
            fontSize: 10, height: 20, background: '#c0c0c0', opacity: 0.7,
            border: '2px solid', borderColor: '#808080 #fff #fff #808080', cursor: 'not-allowed',
          }}>
            <option>No Midi Out</option>
          </select>
          <select disabled style={{
            fontSize: 10, height: 20, width: 44, background: '#c0c0c0', opacity: 0.7,
            border: '2px solid', borderColor: '#808080 #fff #fff #808080', cursor: 'not-allowed',
          }}>
            <option>Ch. 1</option>
          </select>
        </div>

        {/* ── Visual display (mirrors chord label area) ─────────────────────── */}
        <div style={{
          flex: 1, background: '#aaaaaa',
          border: '3px solid', borderColor: '#707070 #e8e8e8 #e8e8e8 #707070',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 24, flexShrink: 1,
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 11, color: '#444',
            opacity: 0.6, letterSpacing: 2,
          }}>
            KEY: 1–7 = C D E F G A B &nbsp;|&nbsp; 8 = C5
          </span>
        </div>

        {/* ── Piano keyboard ────────────────────────────────────────────────── */}
        {renderPiano()}
      </div>
    </div>
  );
};
