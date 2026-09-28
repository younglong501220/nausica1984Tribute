/**
 * Type definitions for Nausicaä 1984: Attack of the Ohmu
 */

export type OhmuType = 'STANDARD' | 'BABY' | 'ALPHA';
export type OhmuState = 'ENRAGED' | 'CALM' | 'FLEEING';

export interface Ohmu {
  id: string;
  type: OhmuType;
  x: number;
  y: number;
  speed: number;
  baseSpeed: number;
  size: number;
  segments: number;
  state: OhmuState;
  eyeTimer: number;
  legsTimer: number;
  calmProgress: number; // 0 (red) to 1 (pure deep blue / gold)
  hitPoints: number;
  maxHitPoints: number;
  whistleDistractedTimer: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  vx: number;
  vy: number;
  flareCooldown: number;
  whistleCooldown: number;
  whistleActiveTimer: number;
  tilt: number;
}

export interface Flare {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'FLASH' | 'SPORE' | 'GOLDEN_HEAL' | 'JET_SMOKE' | 'WHISTLE_RING';
}

export interface Spore {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  glow: number;
}

export interface WindTurbine {
  x: number;
  y: number;
  angle: number;
  speed: number;
  damage: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';
export type PaletteMode = 'PC88_COLOR' | 'GREEN_PHOSPHOR' | 'AMBER_PHOSPHOR';

export interface HighScoreEntry {
  name: string;
  score: number;
  wave: number;
  date: string;
  title: string;
}
