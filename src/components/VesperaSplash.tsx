/**
 * VesperaSplash — Vespera OS Application Splash Screen API
 *
 * A reusable floating splash screen that renders over the entire OS desktop
 * via a React Portal. Designed to look like traditional 90s software splash
 * screens (Adobe, Office, etc.) — a standalone rectangle floating above
 * everything, with no window chrome.
 *
 * Usage:
 *   import { VesperaSplash } from './VesperaSplash';
 *   {!splashDone && (
 *     <VesperaSplash
 *       appName="MyApp"
 *       subtitle="Professional Edition"
 *       version="1.0"
 *       developer="Acme Corp"
 *       publisher="Vespera Systems"
 *       icon="/Icons/myapp.png"
 *       onDone={() => setSplashDone(true)}
 *     />
 *   )}
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface VesperaSplashProps {
  /** Main application name (large) */
  appName: string;
  /** Subtitle shown below the app name */
  subtitle?: string;
  /** Version string e.g. "Version 1.0" */
  version?: string;
  /** Developer name shown in copyright line */
  developer?: string;
  /** Publisher name shown in copyright line */
  publisher?: string;
  /** Copyright year string (defaults to current year) */
  year?: string;
  /** Path to the application icon (32×32 or 48×48 recommended) */
  icon?: string;
  /** Optional license line shown in italic below copyright */
  licensedTo?: string;
  /** Messages cycled through as the loading bar fills */
  loadingMessages?: string[];
  /** Total duration in ms before onDone is called (default 3000) */
  durationMs?: number;
  /** Accent color for title and loading bar (default #ff8c00 orange) */
  accentColor?: string;
  /** Background gradient start color (default deep navy) */
  bgFrom?: string;
  /** Background gradient end color */
  bgTo?: string;
  /** Callback fired when the splash finishes */
  onDone: () => void;
}

export const VesperaSplash: React.FC<VesperaSplashProps> = ({
  appName,
  subtitle,
  version,
  developer,
  publisher,
  year,
  icon,
  licensedTo,
  loadingMessages = [
    'Initializing application...',
    'Loading resources...',
    'Preparing workspace...',
    'Ready.',
  ],
  durationMs = 3000,
  accentColor = '#ff8c00',
  bgFrom = '#07073a',
  bgTo = '#12124e',
  onDone,
}) => {
  const [pct, setPct] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const BLOCKS = 22;
  const displayYear = year || '1996';

  useEffect(() => {
    const steps = [0, 20, 45, 70, 88, 100];
    const msgStep = Math.floor(durationMs / loadingMessages.length);
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Advance loading bar
    steps.forEach((p, i) => {
      timers.push(setTimeout(() => setPct(p), (i / steps.length) * (durationMs * 0.85)));
    });

    // Cycle messages
    loadingMessages.forEach((_, i) => {
      timers.push(setTimeout(() => setMsgIndex(i), i * msgStep));
    });

    // Fade out then call onDone
    timers.push(setTimeout(() => setFading(true), durationMs - 350));
    timers.push(setTimeout(() => onDone(), durationMs));

    return () => timers.forEach(clearTimeout);
  }, []);

  const filled = Math.round((pct / 100) * BLOCKS);

  const splash = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Subtle desktop dim
        background: 'rgba(0,0,0,0.35)',
        opacity: fading ? 0 : 1,
        transition: fading ? 'opacity 0.35s ease-out' : 'none',
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* The floating splash box — no window chrome, but with bevel edge */}
      <div
        style={{
          width: 500,
          background: `linear-gradient(160deg, ${bgFrom} 0%, ${bgTo} 100%)`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
          borderStyle: 'solid',
          borderWidth: '2px',
          borderTopColor: '#5a5a9a',
          borderLeftColor: '#5a5a9a',
          borderBottomColor: '#0a0a2a',
          borderRightColor: '#0a0a2a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          userSelect: 'none',
          // Subtle CRT scanline overlay
          position: 'relative',
        }}
      >
        {/* Scanline texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 2px)',
        }} />

        {/* Main content row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '28px 28px 20px 28px', position: 'relative', zIndex: 2 }}>
          {/* Icon */}
          {icon && (
            <img
              src={icon}
              alt={appName}
              style={{
                width: 64, height: 64,
                imageRendering: 'pixelated',
                flexShrink: 0,
                filter: `drop-shadow(0 0 10px ${accentColor}88)`,
              }}
            />
          )}

          {/* Text block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{
              fontFamily: 'Arial Black, Arial, sans-serif',
              fontSize: 30,
              fontWeight: 900,
              color: accentColor,
              letterSpacing: 0.5,
              lineHeight: 1.1,
            }}>
              {appName}
            </div>

            {subtitle && (
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#c8c8ff', marginTop: 2 }}>
                {subtitle}
              </div>
            )}

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {version && (
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#9090bb' }}>
                  {version}
                </div>
              )}
              {(developer || publisher) && (
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#9090bb' }}>
                  {developer && publisher
                    ? `© ${displayYear} ${developer}. Published by ${publisher}.`
                    : developer
                    ? `© ${displayYear} ${developer}.`
                    : `Published by ${publisher}.`}
                </div>
              )}
              {licensedTo && (
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#606088', fontStyle: 'italic', marginTop: 1 }}>
                  Licensed to: {licensedTo}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading section */}
        <div style={{ padding: '0 16px 14px 16px', position: 'relative', zIndex: 2 }}>
          {/* Status message */}
          <div style={{
            fontFamily: 'Courier New, monospace',
            fontSize: 10,
            color: '#7070aa',
            marginBottom: 5,
            height: 14,
            overflow: 'hidden',
          }}>
            {loadingMessages[msgIndex] || ''}
          </div>

          {/* Segmented loading bar */}
          <div style={{
            height: 14,
            background: '#00001e',
            border: '1px solid #2a2a5a',
            display: 'flex',
            alignItems: 'center',
            padding: '2px 3px',
            gap: 2,
          }}>
            {Array.from({ length: BLOCKS }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '100%',
                  background: i < filled ? accentColor : '#0a0a2e',
                  transition: 'background 0.25s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(splash, document.body);
};
