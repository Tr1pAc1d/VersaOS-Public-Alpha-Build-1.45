import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/** Isolated from vespera_vfs / vespera_display — additive only */
const STORAGE_KEY = 'vespera_network_link';

export type LinkStatus = 'online' | 'offline' | 'dialing';

export interface NetworkLinkPersisted {
  v: 1;
  /** When false (default), the sim behaves as always online — no change for existing players */
  strictDialUp: boolean;
  linkStatus: LinkStatus;
}

function parseStored(): NetworkLinkPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { v: 1, strictDialUp: false, linkStatus: 'online' };
    }
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object' || p.v !== 1) {
      return { v: 1, strictDialUp: false, linkStatus: 'online' };
    }
    const strictDialUp = Boolean(p.strictDialUp);
    let linkStatus: LinkStatus = 'online';
    if (p.linkStatus === 'offline' || p.linkStatus === 'online' || p.linkStatus === 'dialing') {
      linkStatus = p.linkStatus;
    }
    if (linkStatus === 'dialing') {
      linkStatus = 'offline';
    }
    return { v: 1, strictDialUp, linkStatus };
  } catch {
    return { v: 1, strictDialUp: false, linkStatus: 'online' };
  }
}

function writeStored(state: NetworkLinkPersisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}

interface NetworkLinkContextValue {
  strictDialUp: boolean;
  setStrictDialUp: (value: boolean) => void;
  linkStatus: LinkStatus;
  /** Effective connectivity for apps: true unless strict mode is on and not connected */
  isLinkUp: boolean;
  connect: () => void;
  disconnect: () => void;
}

const NetworkLinkContext = createContext<NetworkLinkContextValue | null>(null);

const DIAL_DURATION_MS = 7500;

export const NetworkLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = parseStored();
  const [strictDialUp, setStrictDialUpState] = useState(initial.strictDialUp);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(initial.linkStatus);

  useEffect(() => {
    writeStored({ v: 1, strictDialUp, linkStatus });
  }, [strictDialUp, linkStatus]);

  const setStrictDialUp = useCallback((value: boolean) => {
    setStrictDialUpState(value);
    if (!value) {
      setLinkStatus('online');
    } else {
      setLinkStatus('offline');
    }
  }, []);

  const connect = useCallback(() => {
    if (!strictDialUp) return;
    setLinkStatus('dialing');
  }, [strictDialUp]);

  const disconnect = useCallback(() => {
    setLinkStatus('offline');
  }, []);

  useEffect(() => {
    if (linkStatus !== 'dialing') return;
    const t = window.setTimeout(() => {
      setLinkStatus('online');
    }, DIAL_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [linkStatus]);

  const isLinkUp = !strictDialUp || linkStatus === 'online';

  const value = useMemo(
    () => ({
      strictDialUp,
      setStrictDialUp,
      linkStatus,
      isLinkUp,
      connect,
      disconnect,
    }),
    [strictDialUp, setStrictDialUp, linkStatus, isLinkUp, connect, disconnect]
  );

  return <NetworkLinkContext.Provider value={value}>{children}</NetworkLinkContext.Provider>;
};

export function useNetworkLink(): NetworkLinkContextValue {
  const ctx = useContext(NetworkLinkContext);
  if (!ctx) {
    return {
      strictDialUp: false,
      setStrictDialUp: () => {},
      linkStatus: 'online',
      isLinkUp: true,
      connect: () => {},
      disconnect: () => {},
    };
  }
  return ctx;
}

/** URLs that work without a live VesperaNET session (intranet / cached home) */
export function isOfflineAllowedUrl(internalUrl: string): boolean {
  return internalUrl === 'home' || internalUrl.startsWith('vespera:');
}
