import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Volume2, VolumeX, Power, ChevronUp, ChevronDown, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RetroTVProps {
  onClose: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

/* ── Playlist-based channel lineup ── */
const CHANNELS = [
  // ── Original Channels ──
  { id: 'mtv',        name: 'MTV: Music Television',       network: 'MTV',     genre: 'Music',     playlistId: 'PLBAB9C51DF3128C1F',                       firstVideoId: 'QnXjISlKLuE' },
  { id: 'cnn',        name: 'CNN: Election Coverage',       network: 'CNN',     genre: 'News',      playlistId: 'PLmEH-9v7NBQuVvqTXja6-oV1zRulnLcsU',       firstVideoId: 'JqV1sx2iDeM' },
  { id: 'bbc',        name: 'BBC: UK News',                 network: 'BBC',     genre: 'News',      playlistId: 'PL-76vVZWSq23WWPtSooV60caL1LIdSwWN',        firstVideoId: 'vKY1dCcUhQ8' },
  { id: 'fox',        name: 'FOX Broadcasting',             network: 'FOX',     genre: 'Network',   playlistId: 'PL-WXPR0O2Et9dDAi2etqXM4bdB66gCdKN',       firstVideoId: 'N-UHWCHYv4k' },
  { id: 'prime',      name: 'PRIME: The Townies Marathon',   network: 'PRIME',   genre: 'Drama',     playlistId: 'PLSE7WP8DOhZPxGtRPc8Bh82kc8NiUYY1F',       firstVideoId: 'BkXz4JuPFOE' },
  { id: 'movienet',   name: 'Movie Network',                network: 'MOVIE',   genre: 'Cinema',    playlistId: 'PLZFj6hhmDCGbTbckeDcH7NRefct0zL8iz',        firstVideoId: 'V8rAp4vRYXQ' },
  { id: 'history',    name: 'History Channel',              network: 'HIST',    genre: 'History',   playlistId: 'PL-WXPR0O2Et9HTA5pib5Z3k8LglmJMjid',       firstVideoId: 'CVURWAPk3ZM' },
  { id: 'weather',    name: 'The Weather Channel',          network: 'TWC',     genre: 'Weather',   playlistId: 'PLVRcj4e-mqYGMPYCrPop5vUsMBx22SK7Y',        firstVideoId: 'Kv3Ja8JzxNU' },
  { id: 'prevue',     name: 'Prevue Channel / TV Guide',    network: 'PREVUE',  genre: 'Guide',     playlistId: 'PL0JpUQy6tFg8UszhnqiSsLhIaMD3eE1iY',       firstVideoId: 'X1lh5ysxleM' },
  { id: 'cnbc',       name: 'CNBC: Business News',          network: 'CNBC',    genre: 'Business',  playlistId: 'PLbOWkzaBawnHsEezfkr-0iBv7U7uzVD6L',        firstVideoId: 'AeQHuRa7d_Q' },
  { id: 'scifi',      name: 'Sci-Fi Channel',               network: 'SCIFI',   genre: 'Sci-Fi',    playlistId: 'PL2g337uFdyjZJ2ZVUuofCXCoKJ5gc4gsZ',        firstVideoId: 'Evcdc4Ix-lk' },
  { id: 'scifi2',     name: 'Sci-Fi Channel 2',             network: 'SCIFI',   genre: 'Sci-Fi',    playlistId: 'PLDBiu4lIMMyOy_DAbfqIRrb-Dco_NP-eT',        firstVideoId: 'BRx1T6_wU0c' },
  { id: 'ae',         name: 'A&E Television',               network: 'A&E',     genre: 'Drama',     playlistId: 'PLYbocufkwRFCdl4O3BWQOoKZS0-uKqTYH',        firstVideoId: 'HOKqqv42XSA' },
  { id: 'sky',        name: 'SKY Television',               network: 'SKY',     genre: 'Network',   playlistId: 'PL9byBpWzyZgRTyePCwvz2ojhnLYTSZdzS',        firstVideoId: 'H_4AHBlqgX0' },
  { id: 'disney',     name: 'Disney Channel',               network: 'DISNEY',  genre: 'Kids',      playlistId: 'PL2yNoNP2fgnRu2TACgM4o0w5kKCod9uRu',       firstVideoId: 'rjti7VHRSlM' },
  { id: 'disneyca',   name: 'Disney Channel Canada',        network: 'DISNEY',  genre: 'Kids',      playlistId: 'PLoo4TvRoDvK5u32XyqCmcH2Y0itvXlf5N',       firstVideoId: 'ff_Gk37ydK4' },
  { id: 'nick',       name: 'Nickelodeon',                  network: 'NICK',    genre: 'Cartoons',  playlistId: 'PLIvBV9LwIX-kep3vABZo16Sf6FN2oGsml',        firstVideoId: 'J4g1oObOy1Q' },
  { id: 'teletoon',   name: 'Teletoon',                     network: 'TOON',    genre: 'Cartoons',  playlistId: 'PLCS0ITaepkX6QezuSuGR4TCbr6SzyYqmI',        firstVideoId: '1L0XDAoLZtw' },
  { id: 'animetv',    name: 'AnimeTV',                      network: 'ANIME',   genre: 'Anime',     playlistId: 'PLo60BvbiWBuqUwSRFou3pbPV2IAWaP0rg',        firstVideoId: 'z3hMX65Khtg' },
  { id: 'bbc2',       name: 'BBC TWO',                      network: 'BBC2',    genre: 'Variety',   playlistId: 'PLJZlpNzwsxJ6E4kOREoJIkp5b0ZtsTTma',        firstVideoId: '15qH6f712WI' },
  { id: 'ytv',        name: 'YTV: Animorphs Marathon',      network: 'YTV',     genre: 'Sci-Fi',    playlistId: 'PLH__5dktuLHyjKk1tGZBesEva1kAILYNq',        firstVideoId: 'kT0YONYm6CI' },
  { id: 'pbs',        name: 'PBS Kids',                     network: 'PBS',     genre: 'Kids',      playlistId: 'PLM1dSozoFG9unMxr6IdDE0P_ZPkCaJjHc',        firstVideoId: 'x7vWiSfKs54' },
  { id: 'lifetime',   name: 'Lifetime Movie Network',       network: 'LMN',     genre: 'Cinema',    playlistId: 'PLs-2EWm6ahLWu0rJG9SpqtnAb3bCbaiiO',        firstVideoId: 'W2z_G_QwdO8' },
  { id: 'itv',        name: 'ITV: Classic Gameshow',        network: 'ITV',     genre: 'Variety',   playlistId: 'PLFldE1pnPqYplSPYb2kLEOdP4dMbYHPA4',        firstVideoId: 'Fh3udfNkPZQ' },
  { id: 'tvland',     name: 'TV Land Classics',             network: 'TVL',     genre: 'Classic',   playlistId: 'PL_-h39wZ2CXh-eCQNwp-y-s5UKrnSwzH-',       firstVideoId: 'hOGDggRqkgI' },
  { id: 'cart',       name: 'CART: Motorsport',             network: 'CART',    genre: 'Sports',    playlistId: 'PLVAwMSjIsbSXGXLQgFupU7a6JHdCC22yu',        firstVideoId: 'dttZ41CXvEk' },
  // ── International ──
  { id: 'indiatv',    name: 'IndiaTV',                      network: 'INDIA',   genre: 'Intl',      playlistId: 'PLWR7bmgI-Nvobv2KUcFWl0swHc6ah8OUk',        firstVideoId: 'xWIAaARfhg0' },
  { id: 'ktp',        name: 'KTP: Portuguesa TV',           network: 'KTP',     genre: 'Intl',      playlistId: 'PLmidRR3H_L0gfyuMjOZA8xMOMuNNTS6ch',        firstVideoId: 'rge7NLPefNc' },
  { id: 'rppo',       name: 'RPPO Television',              network: 'RPPO',    genre: 'Intl',      playlistId: 'PLOfNM6q6NXC0A0Uep8AcA8WdTChZdrRmU',        firstVideoId: '2BwaVVabYaQ' },
  { id: 'tv1sa',      name: 'TV1: South Africa',            network: 'TV1',     genre: 'Intl',      playlistId: 'PLmidRR3H_L0ilKQK_OELWouXKs2QF-nmp',        firstVideoId: 'MMcidg9Q_Dw' },
  { id: 'tvca',       name: 'TVCA',                         network: 'TVCA',    genre: 'Intl',      playlistId: 'PLGXm-WGHn3s9Ejw6ZTMXFfU7EO5Uu4w0y',        firstVideoId: 'v3h_53TB2xE' },
  // ── Canadian ──
  { id: 'cbc',        name: 'CBC Television',               network: 'CBC',     genre: 'Canadian',  playlistId: 'PLjVRVyRgpZFI9qrKRaOaqPSKYBMh4991x',        firstVideoId: 'Xr44aoHkI1M' },
  { id: 'cbc2',       name: 'CBC Newsworld',                network: 'CBC',     genre: 'Canadian',  playlistId: 'PLWLmxdVQpQ1SCOm83j1r2yeNB2iBcwfZf',        firstVideoId: 'pQiriB1KQSY' },
  { id: 'ctv',        name: 'CTV Network',                  network: 'CTV',     genre: 'Canadian',  playlistId: 'PLbxaPFc-LhMd1NoCgEyXAPoMPIXuedtE4',        firstVideoId: 'uIppeQbInMk' },
  // ── Local / Affiliate ──
  { id: 'wfmy',       name: 'WFMY-TV 2 Greensboro',         network: 'WFMY',    genre: 'Local',     playlistId: 'PLr_zi8Ju-xyXPY60QXQ82XmUtT_zXGCYL',        firstVideoId: '3UTGxGq9zCk' },
  { id: 'wunl',       name: 'WUNL-TV 26 UNC-TV',            network: 'WUNL',    genre: 'Local',     playlistId: 'PLr_zi8Ju-xyU0wYO280sQMQ53OkJ_Xxkl',        firstVideoId: 'dCWZTyLD4Vw' },
  { id: 'wtae',       name: 'WTAE-TV 4 Pittsburgh',         network: 'WTAE',    genre: 'Local',     playlistId: 'PL537A8B918D7E3E49',                         firstVideoId: 'TlMb2nRkqVI' },
  { id: 'ntv',        name: 'NTV: Nippon Television',       network: 'NTV',     genre: 'Intl',      playlistId: '',                                           firstVideoId: 'kREHOT62Cgw' },
  { id: 'ntv2',       name: 'NTV 2: Late Night',            network: 'NTV',     genre: 'Intl',      playlistId: '',                                           firstVideoId: 'RF1cQ1J6hRo' },
  { id: 'bell',       name: 'Bell ExpressVu',               network: 'BELL',    genre: 'Variety',   playlistId: '',                                           firstVideoId: 'c7LrKfx5sAI' },
  // ── User Requested ──
  { id: 'toondisney', name: 'Toon Disney',                  network: 'TOOND',   genre: 'Kids',      playlistId: 'PLu0otkhM9DLuPnVYFiX_TG0fF6xSJP1XE',       firstVideoId: '9AZriOPoB8Y' },
  { id: 'gladiators', name: 'UK Gladiators',                network: 'ITV2',    genre: 'Sports',    playlistId: 'PLRGrUaCDVSW4-TKW3Sij8LFdQ5NTs7rQW',       firstVideoId: 'fQh80OH5lZA' },
  { id: 'truecolors', name: 'True Colors',                  network: 'FOX2',    genre: 'Comedy',    playlistId: 'PLeMWYHBgbfrFnAKasAzcsCD91E3BCzadq',       firstVideoId: 'YHwVej3QY8o' },
  { id: 'ghoststories',name:'Ghost Stories',                network: 'TRVL',    genre: 'Paranormal',playlistId: 'PL-WXPR0O2Et-GEUp0pxllW-KrXSQKpHkl',       firstVideoId: 'hM3EhV0yFFQ' },
  { id: 'swoon',      name: 'Colosseum Stafford',           network: 'RAVE',    genre: 'Music',     playlistId: 'PLEuYmSbbik1cdHY1uLtPvpkHXe_TLq6hU',       firstVideoId: '2DlkFKATsck' },
  { id: 'gretzky',    name: 'Sports Special',               network: 'TSN',     genre: 'Sports',    playlistId: 'PL92IdmcSjYKL6hqd-_WUFHoe_mdaTgMYW',       firstVideoId: '0O9uDxDZIhE' },
  { id: 'megaman',    name: 'Mega Man HD',                  network: 'YTVA',    genre: 'Cartoons',  playlistId: 'PLAcsA84mgITc2iEbREbwjzy1JSahBnGAa',       firstVideoId: '57JXaCsWY4c' },
  { id: 'wishbone',   name: 'Wishbone',                     network: 'PBS2',    genre: 'Kids',      playlistId: 'PLvgUzMqtKcKwWeKpFGox9No6opqcqLgLA',       firstVideoId: 'D-7WUuSVNVs' },
  { id: 'heydude',    name: 'Hey Dude',                     network: 'NICK2',   genre: 'Kids',      playlistId: 'PLgpnEU2vS3nzyYHLyPfjr9Qy2n0oGz1Yr',       firstVideoId: '9AaiQVAG0gQ' },
  { id: 'streetfighter',name:'Street Fighter',              network: 'USA',     genre: 'Action',    playlistId: 'PLV4Ztn9euy7RI4i-tvyOHhd4Ab-2L1lxc',       firstVideoId: 'Siz1AZiOeXc' },
  { id: 'addams',     name: 'Addams Family',                network: 'MGM',     genre: 'Classic',   playlistId: 'PLwwhtOnMyjuxQy81h7uJMCdsR-bS-uVaD',       firstVideoId: 'CT0cVo9Rf5s' },
  { id: 'marioshow',  name: 'Super Mario Bros.',            network: 'DIC',     genre: 'Cartoons',  playlistId: 'PL2K7WaT-AJjJD-FUhinRgKjeavHEugooA',       firstVideoId: 'ce2__uqY_Sk' },
  { id: 'malcolm',    name: 'Malcolm In The Middle',        network: 'FOX3',    genre: 'Comedy',    playlistId: 'PLRDC-DZ_uWhrGjkPnVmvCd4Uf-I-_h_EA',       firstVideoId: '0X4uF8HEmzo' },
  { id: 'streets',    name: 'Streets Of San Francisco',     network: 'NBC',     genre: 'Drama',     playlistId: 'PLU6WsvMB8C4xhE-6tyDD1lL4VznTyfpE8',       firstVideoId: 'Axe9oajEwTc' },
  { id: 'weather_interactive', name: 'The Weather Channel', network: 'TWCi', genre: 'Interactive', playlistId: 'interactive',                            firstVideoId: '' },
];

/* ── Build iframe embed URL for a channel ── */
const buildEmbedUrl = (channel: typeof CHANNELS[0]) => {
  const base = `https://www.youtube.com/embed/${channel.firstVideoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=0`;
  return channel.playlistId ? `${base}&list=${channel.playlistId}` : base;
};

// ── stylized network logos ──────────────────────────────────────────────────
const ChannelLogo: React.FC<{ network: string }> = ({ network }) => {
  const base = 'w-8 h-6 flex items-center justify-center font-bold text-[9px] border';
  switch (network) {
    case 'MTV':
      return <div className={`${base} bg-[#FFFF00] font-black italic text-black border-black shadow-[1px_1px_0px_#fff]`}>M<span className="text-[6px] not-italic ml-0.5 mt-1 border-l border-black pl-0.5">TV</span></div>;
    case 'CNN':
      return <div className={`${base} bg-red-600 text-white border-white`}>CNN</div>;
    case 'BBC':
      return <div className={`${base} bg-[#1a1a1a] text-white border-gray-400`}>BBC</div>;
    case 'BBC2':
      return <div className={`${base} bg-[#2e7d32] text-white border-white`}>BBC2</div>;
    case 'FOX':
      return <div className={`${base} bg-[#003087] text-white border-blue-300`}>FOX</div>;
    case 'PRIME':
      return <div className={`${base} bg-[#1a237e] text-yellow-300 border-yellow-600`}>PRM</div>;
    case 'MOVIE':
      return <div className={`${base} bg-black text-[#ff6600] border-[#ff6600]`}>MOV</div>;
    case 'HIST':
      return <div className={`${base} bg-[#5d4037] text-[#ffd54f] border-[#ffd54f] font-serif text-[8px]`}>H</div>;
    case 'TWC':
      return <div className={`${base} bg-[#0d47a1] text-white border-blue-300 text-[7px]`}>TWC</div>;
    case 'PREVUE':
      return <div className={`${base} bg-[#1b5e20] text-yellow-400 border-yellow-500 text-[7px]`}>PVU</div>;
    case 'CNBC':
      return <div className={`${base} bg-[#005e9e] text-white border-blue-200 text-[7px]`}>CNBC</div>;
    case 'SCIFI':
      return <div className={`${base} bg-[#1a1a2e] text-[#00e5ff] border-[#00e5ff] text-[7px]`}>SCI</div>;
    case 'A&E':
      return <div className={`${base} bg-[#212121] text-white border-gray-400`}>A&E</div>;
    case 'SKY':
      return <div className={`${base} bg-[#00205b] text-white border-sky-300 text-[8px]`}>SKY</div>;
    case 'DISNEY':
      return <div className={`${base} bg-[#1565c0] text-white border-white rounded-sm text-[7px] font-black`}>DIS</div>;
    case 'NICK':
      return <div className="w-8 h-6 bg-orange-500 rounded-full flex items-center justify-center font-black text-white text-[7px]">NICK</div>;
    case 'ANIME':
      return <div className={`${base} bg-[#e91e63] text-white border-pink-200 text-[7px] font-black`}>ANI</div>;
    case 'YTV':
      return <div className={`${base} bg-[#7b1fa2] text-yellow-300 border-yellow-400`}>YTV</div>;
    case 'TOON':
      return <div className={`${base} bg-[#e65100] text-white border-white rounded-sm text-[7px]`}>TOON</div>;
    case 'PBS':
      return <div className={`${base} bg-[#1565c0] text-white border-white text-[8px]`}>PBS</div>;
    case 'LMN':
      return <div className={`${base} bg-[#880e4f] text-white border-pink-300 text-[7px]`}>LMN</div>;
    case 'ITV':
      return <div className={`${base} bg-[#311b92] text-yellow-400 border-yellow-500`}>ITV</div>;
    case 'TVL':
      return <div className={`${base} bg-[#004d40] text-white border-teal-300 text-[7px]`}>TVL</div>;
    case 'CART':
      return <div className={`${base} bg-[#b71c1c] text-white border-red-300 text-[7px]`}>CART</div>;
    case 'INDIA':
      return <div className={`${base} bg-[#ff6f00] text-white border-orange-300 text-[7px]`}>ITV</div>;
    case 'KTP':
      return <div className={`${base} bg-[#1b5e20] text-white border-green-300 text-[8px]`}>KTP</div>;
    case 'RPPO':
      return <div className={`${base} bg-[#4a148c] text-yellow-300 border-purple-300 text-[7px]`}>RPO</div>;
    case 'TV1':
      return <div className={`${base} bg-[#0277bd] text-white border-sky-200 text-[8px]`}>TV1</div>;
    case 'TVCA':
      return <div className={`${base} bg-[#37474f] text-white border-gray-400 text-[7px]`}>TVCA</div>;
    case 'CBC':
      return <div className={`${base} bg-[#d32f2f] text-white border-red-200 text-[8px]`}>CBC</div>;
    case 'CTV':
      return <div className={`${base} bg-[#1565c0] text-white border-blue-200 text-[8px]`}>CTV</div>;
    case 'WFMY':
      return <div className={`${base} bg-[#455a64] text-yellow-300 border-gray-400 text-[7px]`}>WFM</div>;
    case 'WUNL':
      return <div className={`${base} bg-[#33691e] text-white border-green-300 text-[7px]`}>UNC</div>;
    case 'WTAE':
      return <div className={`${base} bg-[#c62828] text-white border-red-200 text-[7px]`}>WTAE</div>;
    case 'NTV':
      return <div className={`${base} bg-[#e8eaf6] text-[#1a237e] border-[#1a237e] text-[8px] font-black`}>NTV</div>;
    case 'BELL':
      return <div className={`${base} bg-[#0d47a1] text-white border-blue-200 text-[7px]`}>BELL</div>;
    case 'TWCi':
      return <div className={`${base} bg-[#004080] text-white border-blue-400 font-bold`}>TWC</div>;
    case 'TOOND':
      return <div className={`${base} bg-[#1565c0] text-red-400 border-white rounded-sm text-[6px] font-black leading-[6px] pt-0.5`}>TOON<br/>DIS</div>;
    case 'ITV2':
      return <div className={`${base} bg-[#000000] text-yellow-400 border-yellow-500`}>ITV2</div>;
    case 'TRVL':
      return <div className={`${base} bg-[#1e88e5] text-white border-white text-[7px] italic`}>TRVL</div>;
    case 'RAVE':
      return <div className={`${base} bg-pink-600 text-yellow-300 border-yellow-300 text-[7px] font-black`}>RAVE</div>;
    case 'TSN':
      return <div className={`${base} bg-[#c62828] text-white border-white text-[8px] font-bold`}>TSN</div>;
    case 'YTVA':
      return <div className={`${base} bg-[#4a148c] text-green-400 border-green-500`}>YTV+</div>;
    case 'PBS2':
      return <div className={`${base} bg-[#0277bd] text-white border-white text-[8px]`}>PBS2</div>;
    case 'NICK2':
      return <div className="w-8 h-6 bg-orange-400 rounded-full flex items-center justify-center font-black text-white text-[6px]">NICK+</div>;
    case 'USA':
      return <div className={`${base} bg-[#0d47a1] text-red-500 border-white text-[8px] font-black`}>USA</div>;
    case 'MGM':
      return <div className={`${base} bg-[#ffb300] text-black border-black text-[7px] font-serif`}>MGM</div>;
    case 'DIC':
      return <div className="w-8 h-6 bg-red-600 rounded-xl flex items-center justify-center font-black text-yellow-300 text-[8px] border border-yellow-300">DIC</div>;
    case 'FOX2':
    case 'FOX3':
      return <div className={`${base} bg-[#003087] text-white border-blue-300 font-bold`}>FOX</div>;
    case 'NBC':
      return <div className={`${base} bg-black border-gray-600`}>
        <span className="text-red-500 text-[6px]">N</span>
        <span className="text-green-500 text-[6px]">B</span>
        <span className="text-blue-500 text-[6px]">C</span>
      </div>;
    default:
      return <div className={`${base} bg-gray-700 text-gray-400`}>TV</div>;
  }
};

/* ── Meridian. Logo Component ── */
const MeridianLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: { text: '16px', sub: '7px' }, md: { text: '24px', sub: '8px' }, lg: { text: '36px', sub: '10px' } };
  const s = sizes[size];
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div>
        <span style={{ fontSize: s.text, fontWeight: 900, letterSpacing: '-0.5px', color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif' }}>Meridian</span>
        <span style={{ fontSize: s.text, fontWeight: 900, color: '#cc0000' }}>.</span>
      </div>
      <span style={{ fontSize: s.sub, letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', marginTop: '-2px' }}>Broadcasting Network</span>
    </div>
  );
};

export const RetroTV: React.FC<RetroTVProps> = ({ onClose, isMaximized = false, onToggleMaximize }) => {
  /* ── Setup / Loading State ── */
  const [setupStage, setSetupStage] = useState<'dialog' | 'loading' | 'ready'>('dialog');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStep, setLoadStep] = useState('');

  const [isMuted, setIsMuted] = useState(false);
  const [isPowered, setIsPowered] = useState(true);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true); // Start true to hide initial yt load
  const [volume, setVolume] = useState(0.8);
  const [iframeKey, setIframeKey] = useState(0);

  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const switchingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const staticAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize static audio
  useEffect(() => {
    staticAudioRef.current = new Audio('/Sounds/TV white noise static.mp3');
    staticAudioRef.current.loop = true;
    
    return () => {
      if (staticAudioRef.current) {
        staticAudioRef.current.pause();
        staticAudioRef.current = null;
      }
    };
  }, []);

  // Update static audio volume
  useEffect(() => {
    if (staticAudioRef.current) {
      staticAudioRef.current.volume = isMuted ? 0 : volume * 0.4;
    }
  }, [volume, isMuted]);

  // Play/pause static audio based on buffering state
  useEffect(() => {
    if (!staticAudioRef.current) return;
    
    if (isPowered && isBuffering && setupStage === 'ready') {
      const playPromise = staticAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.log('Audio playback prevented:', e));
      }
    } else {
      staticAudioRef.current.pause();
    }
  }, [isBuffering, isPowered, setupStage]);

  useEffect(() => {
    if (setupStage === 'ready') {
      setIsBuffering(true);
      bufferingTimeoutRef.current = setTimeout(() => setIsBuffering(false), 6000); // 6s hides youtube UI popup
    }
  }, [setupStage]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (switchingTimeoutRef.current) clearTimeout(switchingTimeoutRef.current);
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
    };
  }, []);

  /* ── Fake loading sequence after user confirms coax ── */
  const startLoadingSequence = () => {
    setSetupStage('loading');
    const steps = [
      { text: 'Initializing Meridian. TV Service...', pct: 5 },
      { text: 'Detecting coaxial input on COM3...', pct: 12 },
      { text: 'Coaxial signal found — strength: EXCELLENT', pct: 20 },
      { text: 'Connecting to cable box... OK', pct: 28 },
      { text: 'Establishing link to http://www.mbn-online.net...', pct: 35 },
      { text: 'Downloading channel manifest from mbn-online.net/tv/guide.dat...', pct: 45 },
      { text: `Parsing EPG data... ${CHANNELS.length} channels found`, pct: 55 },
      { text: 'Loading network logos and metadata...', pct: 64 },
      { text: 'Syncing program schedule with MBN servers...', pct: 72 },
      { text: 'Initializing DualLink Pro v2.3 decoder...', pct: 80 },
      { text: 'Buffering video stream... please wait...', pct: 88 },
      { text: 'Verifying VesperaNET subscriber credentials... OK', pct: 94 },
      { text: 'Meridian. TV ready — tuning to default channel...', pct: 100 },
    ];
    let i = 0;
    loadingIntervalRef.current = setInterval(() => {
      if (i < steps.length) {
        setLoadStep(steps[i].text);
        setLoadProgress(steps[i].pct);
        i++;
      } else {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        loadingTimeoutRef.current = setTimeout(() => setSetupStage('ready'), 400);
      }
    }, 500);
  };

  const jumpToChannel = (index: number) => {
    if (!isPowered) return;
    
    if (switchingTimeoutRef.current) clearTimeout(switchingTimeoutRef.current);
    if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);

    setIsSwitching(true);
    setIsBuffering(true);

    switchingTimeoutRef.current = setTimeout(() => {
      setCurrentChannelIndex(index);
      setIframeKey(k => k + 1); // remount iframe
      setIsSwitching(false);

      if (CHANNELS[index].id === 'weather_interactive') {
        window.dispatchEvent(new CustomEvent("launch-app", { detail: "weather_channel" }));
        setIsBuffering(false);
      } else {
        bufferingTimeoutRef.current = setTimeout(() => {
          setIsBuffering(false);
        }, 6000); // 6s hides youtube UI popup
      }
    }, 450);
  };

  const changeChannel = (dir: number) => {
    let nextIndex = currentChannelIndex + dir;
    if (nextIndex < 0) nextIndex = CHANNELS.length - 1;
    if (nextIndex >= CHANNELS.length) nextIndex = 0;
    jumpToChannel(nextIndex);
  };

  const currentChannel = CHANNELS[currentChannelIndex];

  /* ════════════════════════════════════════════
     CABLE SETUP DIALOG
     ════════════════════════════════════════════ */
  if (setupStage === 'dialog') {
    return (
      <div className="w-full h-full flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center select-none" style={{ zIndex: 1000 }}>
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] p-0 w-[440px]">
          {/* Dialog title bar */}
          <div className="bg-[#000080] text-white px-3 py-1.5 flex items-center justify-between">
            <span className="text-sm font-bold">Meridian. TV — Cable Setup</span>
            <button onClick={onClose} className="p-0.5 hover:bg-[#800000] rounded">
              <X size={14} />
            </button>
          </div>
          {/* Dialog body */}
          <div className="p-5">
            {/* Meridian logo */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b-2 border-gray-400">
              <div className="bg-black px-3 py-2 rounded-sm">
                <MeridianLogo size="md" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Meridian. TV</div>
                <div className="text-[11px] text-gray-600">Cable Television Viewer v2.3</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="flex gap-3 mb-4">
              <div className="text-3xl">📡</div>
              <div className="text-[12px] text-gray-800 leading-relaxed">
                <p className="font-bold mb-2">Please confirm your cable connection before continuing:</p>
                <ol className="list-decimal ml-4 space-y-1.5">
                  <li>Ensure your <strong>coaxial cable</strong> from your cable TV provider is securely plugged into your <strong>cable box</strong>.</li>
                  <li>Verify your <strong>cable box</strong> is connected to your <strong>Vespera PC</strong> via the <strong>DualLink Pro</strong> capture card (COM3 port).</li>
                  <li>Make sure the cable box is <strong>powered on</strong> and receiving signal.</li>
                </ol>
              </div>
            </div>

            {/* Diagram */}
            <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white p-3 mb-4 text-center">
              <div className="text-[11px] font-mono text-gray-700 flex items-center justify-center gap-2">
                <span className="bg-gray-200 border border-gray-400 px-2 py-1 rounded-sm text-[10px]">🏠 Wall Coax</span>
                <span className="text-gray-400">→→→</span>
                <span className="bg-gray-200 border border-gray-400 px-2 py-1 rounded-sm text-[10px]">📦 Cable Box</span>
                <span className="text-gray-400">→→→</span>
                <span className="bg-gray-200 border border-gray-400 px-2 py-1 rounded-sm text-[10px]">🖥️ Vespera PC</span>
              </div>
              <div className="text-[9px] text-gray-500 mt-2 italic">Connection diagram — all cables must be secure</div>
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer text-[12px] text-gray-800">
              <input type="checkbox" defaultChecked className="accent-[#000080]" />
              <span>I confirm my coaxial cable and cable box are properly connected.</span>
            </label>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-6 py-1.5 text-[12px] font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={startLoadingSequence}
                className="px-6 py-1.5 text-[12px] font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white cursor-pointer"
              >
                Confirm & Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     LOADING SEQUENCE
     ════════════════════════════════════════════ */
  if (setupStage === 'loading') {
    return (
      <div className="w-full h-full flex-1 bg-black flex flex-col items-center justify-center select-none" style={{ zIndex: 1000 }}>
        <div className="max-w-md w-full flex flex-col items-center gap-6 px-8">
          {/* Meridian Logo */}
          <div className="mb-2">
            <MeridianLogo size="lg" />
          </div>

          {/* TV sub-brand */}
          <div className="text-xs text-gray-500 tracking-[0.4em] uppercase -mt-4">Television Service</div>

          {/* Progress bar */}
          <div className="w-full space-y-2">
            <div className="h-5 bg-black border border-gray-600 p-[2px]">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${loadProgress}%`,
                  background: 'linear-gradient(90deg, #000080, #0000cc, #000080)',
                }}
              />
            </div>
            <div className="flex justify-between text-gray-500 text-[10px] font-mono">
              <span className="truncate max-w-[280px]">{loadStep}</span>
              <span>{loadProgress}%</span>
            </div>
          </div>

          {/* Fake log output */}
          <div className="w-full bg-[#0a0a0a] border border-gray-800 p-3 font-mono text-[10px] text-green-500 h-24 overflow-hidden">
            {loadProgress >= 5 && <div>{'>'} init meridian_tv_service --coax COM3</div>}
            {loadProgress >= 12 && <div>{'>'} probe: coaxial signal detected (75Ω impedance)</div>}
            {loadProgress >= 28 && <div>{'>'} handshake: cable_box OK (Motorola DCT2000)</div>}
            {loadProgress >= 35 && <div>{'>'} http GET www.mbn-online.net/tv/guide.dat ... 200 OK</div>}
            {loadProgress >= 55 && <div>{'>'} epg: parsed {CHANNELS.length} channels, {CHANNELS.length * 8} programs loaded</div>}
            {loadProgress >= 80 && <div>{'>'} decoder: DualLink Pro v2.3 firmware OK</div>}
            {loadProgress >= 94 && <div>{'>'} auth: VesperaNET subscriber verified ✓</div>}
            {loadProgress >= 100 && <div className="text-yellow-400">{'>'} STATUS: READY — tuning channel 2...</div>}
          </div>

          <div className="text-[9px] text-gray-600 italic">Meridian. TV © 1996 Meridian Broadcasting Network</div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     MAIN TV INTERFACE
     ════════════════════════════════════════════ */
  return (
    <div 
      className={`bg-[#1a1a1a] border-2 border-t-[#444] border-l-[#444] border-b-black border-r-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex transition-all ${
        'w-full h-full flex-1 ' + (isMaximized ? 'flex-row' : 'flex-col')
      }`}
      style={{ zIndex: 1000 }}
    >
      <div className={`flex flex-col flex-1 ${isMaximized ? 'h-full border-r-2 border-[#333]' : ''}`}>
        {/* Title bar — Meridian branded */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between" style={{ minHeight: '28px' }}>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-red-500 rounded-full border border-red-800 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3)]"></div>
            <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full border border-yellow-700 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3)]"></div>
            <div className="w-3.5 h-3.5 bg-green-500 rounded-full border border-green-700 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3)]"></div>
            <span className="ml-2 text-sm font-bold tracking-tight">
              <span className="uppercase" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>Meridian</span>
              <span style={{ color: '#cc0000', fontWeight: 900 }}>.</span>
              <span className="text-xs ml-1 opacity-70 font-normal">TV</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMuted(!isMuted)} className="p-1 hover:bg-[#0000a0] rounded active:bg-[#000040]">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={onToggleMaximize} className="p-1 hover:bg-[#0000a0] rounded active:bg-[#000040]">
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={onClose} className="p-1 hover:bg-[#800000] rounded active:bg-[#400000]"><X size={16} /></button>
          </div>
        </div>

        {/* ── CRT Screen Area ── */}
        <div className="flex-1 bg-black relative overflow-hidden">
          {/* The video iframe fills the entire screen area */}
          {isPowered && !isSwitching && currentChannel.id !== 'weather_interactive' && (
            <iframe
              key={iframeKey}
              src={buildEmbedUrl(currentChannel)}
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
            />
          )}

          {/* Interactive Channel Placeholder */}
          {isPowered && !isSwitching && currentChannel.id === 'weather_interactive' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#001040] text-blue-500 font-mono z-10 p-8 text-center">
               <div className="text-5xl mb-4 font-black tracking-widest text-[#004080] border-4 border-[#004080] p-4 rounded-xl bg-black">
                 TWC
               </div>
               <div className="text-lg font-bold tracking-widest text-blue-300 animate-pulse">
                 INTERACTIVE WEATHER ENGINE LAUNCHED
               </div>
               <div className="text-xs uppercase mt-4 opacity-70 border-t border-blue-800 pt-2 w-full">
                 Check your VesperaOS Desktop for interactive radar
               </div>
            </div>
          )}

          {/* Click shield */}
          <div 
            className="absolute inset-0 z-30 bg-transparent cursor-default" 
            style={{ pointerEvents: 'auto' }}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* ── CRT Scanline overlay ── */}
          <div 
            className="absolute inset-0 z-20 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.4) 1px, rgba(0,0,0,0.4) 2px)',
              backgroundSize: '100% 2px',
            }}
          />

          {/* ── CRT Vignette ── */}
          <div 
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 85%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* ── Subtle screen edge glow ── */}
          <div 
            className="absolute inset-0 z-20 pointer-events-none rounded-sm"
            style={{
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4), inset 0 0 60px rgba(0,0,0,0.2)',
            }}
          />

          {/* Power off CRT effect */}
          {!isPowered && (
            <motion.div initial={{ scaleX: 1, scaleY: 1 }} animate={{ scaleX: 0, scaleY: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-black flex items-center justify-center z-50">
              <div className="w-2 h-0.5 bg-white rounded-full blur-[2px] shadow-[0_0_8px_white]" />
            </motion.div>
          )}

          {/* Channel switching static */}
          <AnimatePresence>
            {isSwitching && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.5 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 z-[100] pointer-events-none"
                style={{
                  backgroundImage: `url('/Television_static_HD.gif')`,
                  backgroundSize: 'cover',
                  mixBlendMode: 'overlay',
                }}
              />
            )}
          </AnimatePresence>

          {/* Buffering static overlay - hides YouTube UI while loading */}
          <AnimatePresence>
            {isBuffering && !isSwitching && (
              <motion.div 
                initial={{ opacity: 1 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-[90] pointer-events-none bg-black flex items-center justify-center"
              >
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-screen"
                  style={{
                    backgroundImage: `url('/Television_static_HD.gif')`,
                    backgroundSize: 'cover',
                  }}
                />
                <span className="relative z-10 text-green-500/80 font-mono text-[10px] tracking-[0.5em] animate-pulse">
                  TUNING...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Channel OSD — fades after 4 seconds */}
          {isPowered && !isSwitching && (
            <motion.div 
              className="absolute top-4 left-5 z-[110] pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 4, duration: 1.5 }}
              key={`osd-${currentChannelIndex}-${iframeKey}`}
            >
              <div 
                className="px-3 py-1.5 rounded-sm"
                style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
              >
                <div className="text-green-400 font-mono text-lg font-bold tracking-widest" style={{ textShadow: '0 0 6px rgba(74,222,128,0.5)' }}>
                  CH {currentChannelIndex + 2}
                </div>
                <div className="text-green-400/70 font-mono text-[10px] tracking-wider">
                  {currentChannel.network} — {currentChannel.name.includes(':') ? currentChannel.name.split(':')[1].trim() : currentChannel.name}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Control Bar — brushed metal look ── */}
        <div 
          className="w-full flex items-center justify-between px-6 text-[#999]"
          style={{
            height: '52px',
            background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 40%, #222 100%)',
            borderTop: '1px solid #555',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Power button */}
          <button onClick={() => setIsPowered(!isPowered)} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${isPowered ? 'bg-green-900/60 border-green-500 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-gray-800 border-gray-600 text-gray-500'}`}>
            <Power size={16} />
          </button>

          {/* Signal LED */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all ${isPowered ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`} />
            <span className="text-[8px] font-mono text-[#666] uppercase">{isPowered ? 'Signal' : 'Off'}</span>
          </div>

          {/* Channel buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#666]">CH</span>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => changeChannel(1)} className="p-0.5 bg-[#3a3a3a] border border-[#555] rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-[#4a4a4a] active:bg-[#222]"><ChevronUp size={12} /></button>
              <button onClick={() => changeChannel(-1)} className="p-0.5 bg-[#3a3a3a] border border-[#555] rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-[#4a4a4a] active:bg-[#222]"><ChevronDown size={12} /></button>
            </div>
          </div>

          {/* Volume */}
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5 h-3 items-end">
              {[...Array(5)].map((_, i) => <div key={i} className={`w-1 rounded-sm transition-all ${i / 4 < volume ? 'bg-green-500 shadow-[0_0_3px_rgba(34,197,94,0.5)]' : 'bg-[#444]'}`} style={{ height: `${20 + i * 20}%` }} />)}
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={() => setVolume(v => Math.max(0, v - 0.1))} className="text-[9px] hover:text-white uppercase text-[#666]">Vol−</button>
              <button onClick={() => setVolume(v => Math.min(1, v + 0.1))} className="text-[9px] hover:text-white uppercase text-[#666]">Vol+</button>
            </div>
          </div>

          {/* Device info */}
          <div className="hidden md:flex flex-col items-end">
             <div className="text-[9px] font-mono tracking-tighter text-[#555]">DualLink Pro v2.3</div>
             <div className="text-[8px] text-[#444] tracking-wider">CALIFORNIA ELECTRONICS</div>
          </div>
        </div>

        {/* Status bar */}
        <div 
          className="px-3 py-0.5 flex items-center justify-between text-[10px]"
          style={{ background: '#222', borderTop: '1px solid #333' }}
        >
          <span className="text-[#888] font-bold uppercase truncate">{isPowered ? currentChannel.name : 'System Offline'}</span>
          <span className="text-[#666] font-mono italic text-[9px]">{isPowered ? 'PLAYLIST AUTO-PLAY' : 'WAITING...'}</span>
        </div>
      </div>


      {/* Channel Guide Sidebar */}
      {isMaximized && (
        <div className="w-[300px] h-full bg-[#000080] border-l-4 border-black flex flex-col shadow-[-4px_0_10px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="bg-[#000040] text-yellow-400 p-3 border-b-2 border-yellow-400/30 flex items-center gap-2">
            <List size={18} />
            <span className="font-mono text-sm font-bold tracking-widest uppercase">Select Program</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1">
            {CHANNELS.map((ch, idx) => {
              const isActive = currentChannelIndex === idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => jumpToChannel(idx)}
                  className={`w-full text-left p-2.5 font-mono text-[11px] transition-all flex gap-3 items-center group relative border-b border-yellow-400/10 ${
                    isActive 
                      ? 'bg-yellow-400 text-black shadow-[4px_4px_0_black] z-10' 
                      : 'text-yellow-200/70 hover:bg-[#0000a0] hover:text-yellow-100'
                  }`}
                >
                  <div className="shrink-0 scale-90">
                    <ChannelLogo network={ch.network || ''} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1 overflow-hidden">
                      <span className="font-bold truncate">CH {idx + 2}: {ch.name.includes(':') ? ch.name.split(':')[1].trim() : ch.name}</span>
                      {ch.genre && (
                        <span className={`text-[8px] px-1 border uppercase font-bold ${
                          isActive ? 'bg-black text-yellow-400 border-black' : 'bg-blue-900/40 text-yellow-500 border-yellow-700/50'
                        }`}>
                          {ch.genre}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isActive && <List size={12} className="shrink-0 animate-pulse" />}
                </button>
              );
            })}
          </div>

          <div className="bg-black/40 p-2 text-[9px] font-mono text-blue-300 flex justify-between items-center italic">
            <span>MERIDIAN CABLE NETWORK</span>
            <span>v2.3 GUIDE</span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000040; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4444ff; border: 2px solid #000040; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6666ff; }
      `}} />
    </div>
  );
};
