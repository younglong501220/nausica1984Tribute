import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RetroAudio } from '../audio/retroAudio';
import {
  GameStatus,
  Ohmu,
  OhmuType,
  Player,
  Flare,
  Particle,
  Spore,
  WindTurbine,
  FloatingText,
  PaletteMode,
  HighScoreEntry
} from './types';

interface GameCanvasProps {
  paletteMode: PaletteMode;
  scanlines: boolean;
  crtCurvature: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onGameStatusChange?: (status: GameStatus) => void;
  onScoreUpdate?: (score: number, wave: number, defense: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  paletteMode,
  scanlines,
  crtCurvature,
  onGameStatusChange,
  onScoreUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<GameStatus>('TITLE');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('nausicaa_high_score') || '1500', 10);
    } catch {
      return 1500;
    }
  });
  const [wave, setWave] = useState<number>(1);
  const [valleyDefense, setValleyDefense] = useState<number>(100);
  const [calmedCount, setCalmedCount] = useState<number>(0);
  const [totalCalmed, setTotalCalmed] = useState<number>(0);
  const [whistleActive, setWhistleActive] = useState<boolean>(false);
  const [whistleCdRatio, setWhistleCdRatio] = useState<number>(0);

  // Mutable game state held in refs for 60fps loop performance
  const stateRef = useRef<{
    status: GameStatus;
    score: number;
    highScore: number;
    wave: number;
    defense: number;
    calmedInWave: number;
    totalCalmed: number;
    player: Player;
    flares: Flare[];
    particles: Particle[];
    ohmus: Ohmu[];
    spores: Spore[];
    turbines: WindTurbine[];
    floatingTexts: FloatingText[];
    screenShake: number;
    spawnTimer: number;
    keys: Record<string, boolean>;
  }>({
    status: 'TITLE',
    score: 0,
    highScore: 1500,
    wave: 1,
    defense: 100,
    calmedInWave: 0,
    totalCalmed: 0,
    player: {
      x: 140,
      y: 240,
      w: 42,
      h: 24,
      speed: 5.2,
      vx: 0,
      vy: 0,
      flareCooldown: 0,
      whistleCooldown: 0,
      whistleActiveTimer: 0,
      tilt: 0
    },
    flares: [],
    particles: [],
    ohmus: [],
    spores: [],
    turbines: [
      { x: 34, y: 90, angle: 0, speed: 0.035, damage: 0 },
      { x: 34, y: 240, angle: 1.2, speed: 0.04, damage: 0 },
      { x: 34, y: 390, angle: 2.5, speed: 0.032, damage: 0 }
    ],
    floatingTexts: [],
    screenShake: 0,
    spawnTimer: 0,
    keys: {}
  });

  // Calculate goal per wave
  const getGoalForWave = (w: number) => {
    switch (w) {
      case 1: return 10;
      case 2: return 14;
      case 3: return 18;
      case 4: return 24;
      case 5: return 30; // Final showdown
      default: return 30;
    }
  };

  // Sync ref with initial state
  useEffect(() => {
    stateRef.current.highScore = highScore;
  }, [highScore]);

  // Handle external notifications
  useEffect(() => {
    if (onGameStatusChange) onGameStatusChange(gameState);
  }, [gameState, onGameStatusChange]);

  useEffect(() => {
    if (onScoreUpdate) onScoreUpdate(score, wave, valleyDefense);
  }, [score, wave, valleyDefense, onScoreUpdate]);

  // Start / Restart Game
  const startGame = useCallback(() => {
    RetroAudio.userGesture();
    RetroAudio.uiClick();

    const s = stateRef.current;
    s.status = 'PLAYING';
    s.score = 0;
    s.wave = 1;
    s.defense = 100;
    s.calmedInWave = 0;
    s.totalCalmed = 0;
    s.flares = [];
    s.particles = [];
    s.ohmus = [];
    s.floatingTexts = [];
    s.screenShake = 0;
    s.spawnTimer = 0;
    s.player.x = 150;
    s.player.y = 240;
    s.player.vx = 0;
    s.player.vy = 0;
    s.player.flareCooldown = 0;
    s.player.whistleCooldown = 0;
    s.player.whistleActiveTimer = 0;

    // Reset turbines
    s.turbines.forEach(t => t.damage = 0);

    setGameState('PLAYING');
    setScore(0);
    setWave(1);
    setValleyDefense(100);
    setCalmedCount(0);
    setTotalCalmed(0);

    // Initial floating banner
    s.floatingTexts.push({
      id: Math.random().toString(),
      x: 380,
      y: 200,
      text: 'WAVE 1 : 王蟲群先鋒逼近！',
      color: '#ffe600',
      life: 90,
      maxLife: 90
    });
  }, []);

  // Save high score
  const checkSaveHighScore = useCallback((finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('nausicaa_high_score', finalScore.toString());
        const entries: HighScoreEntry[] = JSON.parse(localStorage.getItem('nausicaa_hall_of_fame') || '[]');
        entries.push({
          name: 'NAUSICAÄ',
          score: finalScore,
          wave: stateRef.current.wave,
          date: new Date().toLocaleDateString(),
          title: finalScore > 5000 ? '傳奇守護者' : finalScore > 3000 ? '腐海調停者' : '滑翔之風'
        });
        entries.sort((a, b) => b.score - a.score);
        localStorage.setItem('nausicaa_hall_of_fame', JSON.stringify(entries.slice(0, 10)));
      } catch {
        // ignore
      }
    }
  }, [highScore]);

  // Activate Insect Whistle
  const triggerWhistle = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'PLAYING') return;
    if (s.player.whistleCooldown > 0) return;

    RetroAudio.userGesture();
    RetroAudio.insectWhistle();
    s.player.whistleCooldown = 240; // 4 seconds cooldown
    s.player.whistleActiveTimer = 75; // Active for 1.2 seconds

    // Push spinning sound rings
    for (let i = 0; i < 3; i++) {
      s.particles.push({
        id: Math.random().toString(),
        x: s.player.x,
        y: s.player.y,
        vx: 0,
        vy: 0,
        size: 20 + i * 25,
        color: '#7ef9ff',
        life: 40 + i * 10,
        maxLife: 40 + i * 10,
        type: 'WHISTLE_RING'
      });
    }

    // Distract nearby Ohmus
    s.ohmus.forEach(o => {
      const dist = Math.hypot(s.player.x - o.x, s.player.y - o.y);
      if (dist < 260 && o.state === 'ENRAGED') {
        o.whistleDistractedTimer = 90; // Stop or slow down for 1.5s
      }
    });

    s.floatingTexts.push({
      id: Math.random().toString(),
      x: s.player.x,
      y: s.player.y - 25,
      text: '蟲笛共鳴！',
      color: '#7ef9ff',
      life: 45,
      maxLife: 45
    });
  }, []);

  // Fire Flash Flare
  const triggerFlare = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'PLAYING') return;
    if (s.player.flareCooldown > 0) return;

    RetroAudio.userGesture();
    RetroAudio.flare();
    s.player.flareCooldown = 16; // rapid response

    s.flares.push({
      id: Math.random().toString(),
      x: s.player.x + 18,
      y: s.player.y,
      vx: 7.2,
      vy: s.player.vy * 0.25,
      life: 42,
      maxLife: 42
    });

    // Jet burst particle
    s.particles.push({
      id: Math.random().toString(),
      x: s.player.x - 14,
      y: s.player.y,
      vx: -2 - Math.random() * 2,
      vy: (Math.random() - 0.5) * 1.5,
      size: 4,
      color: '#55ffff',
      life: 15,
      maxLife: 15,
      type: 'JET_SMOKE'
    });
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid scrolling on space/arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      RetroAudio.userGesture();
      stateRef.current.keys[e.code] = true;

      if (stateRef.current.status === 'TITLE') {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
        }
      } else if (stateRef.current.status === 'GAMEOVER' || stateRef.current.status === 'VICTORY') {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
        }
      } else if (stateRef.current.status === 'PLAYING') {
        if (e.code === 'Space') {
          triggerFlare();
        } else if (e.code === 'KeyE' || e.code === 'KeyQ') {
          triggerWhistle();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame, triggerFlare, triggerWhistle]);

  // Init spores once
  useEffect(() => {
    const s = stateRef.current;
    if (s.spores.length === 0) {
      for (let i = 0; i < 50; i++) {
        s.spores.push({
          x: Math.random() * 760,
          y: Math.random() * 480,
          size: Math.random() * 2.5 + 1,
          vx: -(Math.random() * 0.9 + 0.3),
          vy: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.65 + 0.35,
          glow: Math.random() * Math.PI * 2
        });
      }
    }
  }, []);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Helper to spawn Ohmu
    const spawnOhmu = (w: number) => {
      const rand = Math.random();
      let type: OhmuType = 'STANDARD';
      let size = 38 + Math.random() * 10;
      let hp = 1;
      let speed = 1.3 + w * 0.18;

      if (w >= 2 && rand < 0.22) {
        // Baby Ohmu: small, erratic, super fast, high score
        type = 'BABY';
        size = 24;
        speed = 2.4 + w * 0.22;
        hp = 1;
      } else if (w >= 3 && rand > 0.82) {
        // Alpha Berserker: colossal, requires 2 flares
        type = 'ALPHA';
        size = 56;
        speed = 1.0 + w * 0.15;
        hp = 2;
      }

      stateRef.current.ohmus.push({
        id: Math.random().toString(),
        type,
        x: canvas.width + size + 20,
        y: Math.random() * (canvas.height - 140) + 70,
        speed,
        baseSpeed: speed,
        size,
        segments: type === 'BABY' ? 5 : type === 'ALPHA' ? 8 : 6,
        state: 'ENRAGED',
        eyeTimer: Math.random() * Math.PI,
        legsTimer: 0,
        calmProgress: 0,
        hitPoints: hp,
        maxHitPoints: hp,
        whistleDistractedTimer: 0
      });
    };

    // Flare explosion effect
    const createExplosion = (x: number, y: number) => {
      RetroAudio.explosion();
      const s = stateRef.current;
      const flashRadius = 115;

      // Camera shake
      s.screenShake = Math.max(s.screenShake, 5);

      // Flash light particles
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 / 24) * i;
        const spd = Math.random() * 4 + 1.5;
        s.particles.push({
          id: Math.random().toString(),
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 3 + 2,
          color: '#7ef9ff',
          life: 28,
          maxLife: 28,
          type: 'FLASH'
        });
      }

      let anyCalmed = false;

      s.ohmus.forEach(o => {
        if (o.state === 'ENRAGED') {
          const dist = Math.hypot(x - o.x, y - o.y);
          if (dist < flashRadius + o.size) {
            o.hitPoints--;
            if (o.hitPoints <= 0) {
              o.state = 'CALM';
              anyCalmed = true;
              const pts = (o.type === 'BABY' ? 300 : o.type === 'ALPHA' ? 500 : 150) * s.wave;
              s.score += pts;
              s.calmedInWave++;
              s.totalCalmed++;

              // Floating score
              s.floatingTexts.push({
                id: Math.random().toString(),
                x: o.x,
                y: o.y - 20,
                text: o.type === 'BABY' ? `+${pts} 幼蟲平息!` : o.type === 'ALPHA' ? `+${pts} 首領被感化!` : `+${pts}`,
                color: o.type === 'BABY' ? '#ffe600' : '#4ecdff',
                life: 45,
                maxLife: 45
              });

              // Healing spores from calmed Ohmu
              for (let p = 0; p < 8; p++) {
                s.particles.push({
                  id: Math.random().toString(),
                  x: o.x + (Math.random() - 0.5) * o.size,
                  y: o.y + (Math.random() - 0.5) * 20,
                  vx: -(Math.random() * 1.5 + 0.5),
                  vy: (Math.random() - 0.5) * 1.2,
                  size: 3,
                  color: '#ffe655',
                  life: 40,
                  maxLife: 40,
                  type: 'GOLDEN_HEAL'
                });
              }

              // Minor defense recovery on baby/alpha pacification
              if (o.type === 'BABY' || o.type === 'ALPHA') {
                s.defense = Math.min(100, s.defense + 3);
              }
            } else {
              // Alpha hit feedback
              s.floatingTexts.push({
                id: Math.random().toString(),
                x: o.x,
                y: o.y - 20,
                text: '首領頑強抵抗中!',
                color: '#ff8844',
                life: 30,
                maxLife: 30
              });
            }
          }
        }
      });

      if (anyCalmed) {
        RetroAudio.calm();
        const goal = getGoalForWave(s.wave);
        if (s.calmedInWave >= goal) {
          if (s.wave >= 5) {
            // Victory!
            s.status = 'VICTORY';
            setGameState('VICTORY');
            RetroAudio.victory();
            checkSaveHighScore(s.score);
          } else {
            // Wave Advance
            s.wave++;
            s.calmedInWave = 0;
            s.floatingTexts.push({
              id: Math.random().toString(),
              x: 380,
              y: 200,
              text: `WAVE ${s.wave} : 蟲群規模擴大！`,
              color: '#38ff70',
              life: 90,
              maxLife: 90
            });
            RetroAudio.victory();
          }
        }
      }
    };

    const update = () => {
      const s = stateRef.current;

      // Update background elements
      s.turbines.forEach(wt => {
        wt.angle += wt.speed * (s.defense > 30 ? 1 : 0.4);
      });

      s.spores.forEach(sp => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.glow += 0.05;
        if (sp.x < 0) sp.x = canvas.width;
        if (sp.y < 0) sp.y = canvas.height;
        if (sp.y > canvas.height) sp.y = 0;
      });

      // Update Floating Texts
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 0.6;
        ft.life--;
        if (ft.life <= 0) s.floatingTexts.splice(i, 1);
      }

      // Update Screen Shake
      if (s.screenShake > 0) {
        s.screenShake *= 0.88;
        if (s.screenShake < 0.2) s.screenShake = 0;
      }

      if (s.status !== 'PLAYING') return;

      // Player Movement
      let dx = 0;
      let dy = 0;
      const k = s.keys;
      if (k['ArrowUp'] || k['KeyW']) dy -= 1;
      if (k['ArrowDown'] || k['KeyS']) dy += 1;
      if (k['ArrowLeft'] || k['KeyA']) dx -= 1;
      if (k['ArrowRight'] || k['KeyD']) dx += 1;

      // Smooth inertia
      s.player.vx = s.player.vx * 0.75 + dx * s.player.speed * 0.25;
      s.player.vy = s.player.vy * 0.75 + dy * s.player.speed * 0.25;

      s.player.x += s.player.vx;
      s.player.y += s.player.vy;

      // Tilt based on vertical velocity
      s.player.tilt = (s.player.vy / s.player.speed) * 0.25;

      // Boundaries
      s.player.x = Math.max(78, Math.min(canvas.width - 55, s.player.x));
      s.player.y = Math.max(48, Math.min(canvas.height - 40, s.player.y));

      // Cooldowns
      if (s.player.flareCooldown > 0) s.player.flareCooldown--;
      if (s.player.whistleCooldown > 0) {
        s.player.whistleCooldown--;
        setWhistleCdRatio(s.player.whistleCooldown / 240);
      } else {
        setWhistleCdRatio(0);
      }

      if (s.player.whistleActiveTimer > 0) {
        s.player.whistleActiveTimer--;
        setWhistleActive(true);
      } else {
        setWhistleActive(false);
      }

      // Update Flares
      for (let i = s.flares.length - 1; i >= 0; i--) {
        const f = s.flares[i];
        f.x += f.vx;
        f.y += f.vy;
        f.life--;

        // Particle smoke trail
        if (Math.random() < 0.4) {
          s.particles.push({
            id: Math.random().toString(),
            x: f.x - 4,
            y: f.y,
            vx: -1,
            vy: (Math.random() - 0.5) * 0.5,
            size: 2.5,
            color: '#ffaa33',
            life: 14,
            maxLife: 14,
            type: 'JET_SMOKE'
          });
        }

        // Explode on lifetime or edge
        if (f.life <= 0 || f.x >= canvas.width - 25) {
          createExplosion(f.x, f.y);
          s.flares.splice(i, 1);
          continue;
        }

        // Check collision with enraged Ohmu
        for (const o of s.ohmus) {
          if (o.state === 'ENRAGED') {
            const dist = Math.hypot(f.x - o.x, f.y - o.y);
            if (dist < o.size + 14) {
              createExplosion(f.x, f.y);
              s.flares.splice(i, 1);
              break;
            }
          }
        }
      }

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.type === 'FLASH') {
          p.size += 0.4;
        }
        if (p.type === 'WHISTLE_RING') {
          p.size += 2.2;
        }
        p.life--;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Spawn Ohmu
      s.spawnTimer++;
      const spawnInterval = Math.max(38, 120 - s.wave * 18);
      if (s.spawnTimer > spawnInterval) {
        spawnOhmu(s.wave);
        s.spawnTimer = 0;
      }

      // Update Ohmus
      for (let i = s.ohmus.length - 1; i >= 0; i--) {
        const o = s.ohmus[i];
        o.eyeTimer += 0.12;
        o.legsTimer += 0.25;

        // Whistle distraction
        if (o.whistleDistractedTimer > 0) {
          o.whistleDistractedTimer--;
          o.speed = o.baseSpeed * 0.2; // severely slowed
        } else {
          o.speed = o.baseSpeed;
        }

        if (o.state === 'ENRAGED') {
          o.x -= o.speed;

          // Sound alarm if close to valley
          if (o.x < 180 && Math.random() < 0.015) {
            RetroAudio.alarm();
          }

          // Wall breach check
          if (o.x < 72) {
            const dmg = o.type === 'ALPHA' ? 28 : o.type === 'BABY' ? 8 : 16;
            s.defense -= dmg;
            s.screenShake = 12;
            RetroAudio.wallHit();

            // Mark turbine damage
            s.turbines.forEach(t => t.damage = Math.min(100, t.damage + 15));

            s.floatingTexts.push({
              id: Math.random().toString(),
              x: 100,
              y: o.y,
              text: `防線受損 -${dmg}%`,
              color: '#ff3b3b',
              life: 50,
              maxLife: 50
            });

            s.ohmus.splice(i, 1);

            if (s.defense <= 0) {
              s.defense = 0;
              s.status = 'GAMEOVER';
              setGameState('GAMEOVER');
              RetroAudio.gameOver();
              checkSaveHighScore(s.score);
            }
            continue;
          }
        } else if (o.state === 'CALM') {
          // Transition eye color
          if (o.calmProgress < 1) {
            o.calmProgress = Math.min(1, o.calmProgress + 0.05);
          }
          // Calmly retreat back to Sea of Decay
          o.x += o.speed * 0.9;
          if (o.x > canvas.width + o.size + 40) {
            s.ohmus.splice(i, 1);
            continue;
          }
        }
      }

      // Sync React state periodically
      setScore(s.score);
      setWave(s.wave);
      setValleyDefense(s.defense);
      setCalmedCount(s.calmedInWave);
      setTotalCalmed(s.totalCalmed);
    };

    // --- RENDER PASS (1984 PC-88 / MSX Vintage Style) ---
    const draw = () => {
      const s = stateRef.current;

      ctx.save();

      // Screen shake translation
      if (s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Sky & Atmospheric Gradient (Midnight Desert / Toxic Sea Sky)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#04070d');
      skyGrad.addColorStop(0.65, '#0b161f');
      skyGrad.addColorStop(1, '#11221e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Distant Horizon: Petrified Fungi & Spore Forest Canopy
      ctx.fillStyle = '#071618';
      ctx.beginPath();
      ctx.moveTo(70, canvas.height - 45);
      // Fungi mountains silhouette
      for (let x = 70; x <= canvas.width; x += 30) {
        const peak = Math.sin(x * 0.015) * 25 + Math.cos(x * 0.04) * 15;
        ctx.lineTo(x, canvas.height - 110 - peak);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(70, canvas.height);
      ctx.fill();

      // Distant Spore Pillars (巨型石化孢子樹)
      const pillars = [220, 360, 520, 680];
      pillars.forEach((px, idx) => {
        const h = 90 + (idx % 3) * 35;
        ctx.fillStyle = '#0d2424';
        ctx.fillRect(px - 6, canvas.height - 45 - h, 12, h);
        // Spore mushroom cap
        ctx.beginPath();
        ctx.ellipse(px, canvas.height - 45 - h, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Acid Lake Horizon (酸之湖邊緣微光)
      ctx.strokeStyle = '#184742';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(70, canvas.height - 45);
      ctx.lineTo(canvas.width, canvas.height - 45);
      ctx.stroke();

      // 4. Ground Terrain (荒漠與金色微塵)
      ctx.fillStyle = '#0a1410';
      ctx.fillRect(70, canvas.height - 45, canvas.width - 70, 45);
      // Terrain dashed pattern (PC-88 8-bit dither lines)
      ctx.strokeStyle = '#1a3326';
      ctx.lineWidth = 1;
      for (let y = canvas.height - 35; y < canvas.height; y += 8) {
        ctx.beginPath();
        ctx.setLineDash([8, 8]);
        ctx.moveTo(70, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 5. Left Side: Valley of the Wind Defense Line & Windmills
      // Defense Stone Wall & Barricades
      ctx.fillStyle = '#101d16';
      ctx.fillRect(0, 0, 72, canvas.height);
      ctx.strokeStyle = '#2d543c';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 72, canvas.height);

      // Stone Wall Brick Grid (8-bit texture)
      ctx.strokeStyle = '#1d3527';
      ctx.lineWidth = 1;
      for (let wy = 36; wy < canvas.height; wy += 22) {
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.lineTo(70, wy);
        ctx.stroke();
      }

      // Windmills (風之谷三座守護大風車)
      s.turbines.forEach((wt, idx) => {
        ctx.save();
        ctx.translate(wt.x, wt.y);

        // Windmill stone tower
        ctx.fillStyle = '#1a2e22';
        ctx.fillRect(-8, -16, 16, 32);
        ctx.strokeStyle = '#4e9c68';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-8, -16, 16, 32);

        // Windmill roof cone
        ctx.fillStyle = '#2d543c';
        ctx.beginPath();
        ctx.moveTo(-10, -16);
        ctx.lineTo(0, -28);
        ctx.lineTo(10, -16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Warning smoke if damaged
        if (s.defense < 50) {
          ctx.fillStyle = 'rgba(255, 80, 50, 0.4)';
          ctx.beginPath();
          ctx.arc(0, -12, 6 + Math.sin(wt.angle * 2) * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Windmill Rotating Sails
        ctx.rotate(wt.angle);
        ctx.strokeStyle = s.defense > 30 ? '#72ff72' : '#ff9944';
        ctx.lineWidth = 2;
        for (let a = 0; a < 4; a++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -26);
          ctx.stroke();

          // Canvas sail fabric
          ctx.fillStyle = 'rgba(120, 255, 160, 0.25)';
          ctx.fillRect(1, -24, 7, 20);
        }

        // Central hub
        ctx.fillStyle = '#fffae0';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Tower label
        ctx.font = '10px "Courier New", monospace';
        ctx.fillStyle = '#4e9c68';
        ctx.fillText(`W-${idx + 1}`, wt.x - 10, wt.y + 28);
      });

      // 6. Floating Sea of Decay Spores
      s.spores.forEach(sp => {
        const pulse = (Math.sin(sp.glow) + 1) * 0.5;
        ctx.fillStyle = `rgba(130, 255, 205, ${sp.alpha * (0.6 + pulse * 0.4)})`;
        ctx.fillRect(sp.x, sp.y, sp.size, sp.size);
      });

      // 7. Whistle Rings & Particles
      s.particles.forEach(p => {
        ctx.save();
        if (p.type === 'WHISTLE_RING') {
          const alpha = p.life / p.maxLife;
          ctx.strokeStyle = `rgba(126, 249, 255, ${alpha * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'GOLDEN_HEAL') {
          const alpha = p.life / p.maxLife;
          ctx.fillStyle = `rgba(255, 230, 80, ${alpha})`;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 8. Flares (Insect Whistle Grenades)
      s.flares.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);

        // Flare core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, -2, 10, 4);

        // Flare incandescent trail
        ctx.fillStyle = '#ffe600';
        ctx.fillRect(-10, -2, 5, 4);
        ctx.fillStyle = '#ff5500';
        ctx.fillRect(-14, -1, 4, 2);

        // Flare spinning whistle aura
        ctx.strokeStyle = '#7ef9ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // 9. Ohmu Rendering (Multi-Segmented Giant Insect with Eye Array & Crawling Legs)
      s.ohmus.forEach(o => {
        ctx.save();
        ctx.translate(o.x, o.y);

        const isEnraged = o.state === 'ENRAGED';
        const isCalm = o.state === 'CALM';

        // Blend colors based on calmProgress
        // Enraged: #38241c (brownish chitin shell), Alpha: #501d1d, Baby: #302018
        const shellBase = o.type === 'ALPHA' ? '#461a1a' : o.type === 'BABY' ? '#32221b' : '#34221b';
        const shellCalm = '#18383e'; // tranquil forest green-blue
        const shellBorder = isEnraged ? (o.type === 'ALPHA' ? '#a5362a' : '#824128') : '#488c94';

        // Animated crawling legs underneath
        const legCount = o.segments + 2;
        ctx.strokeStyle = isEnraged ? '#663322' : '#336666';
        ctx.lineWidth = o.type === 'BABY' ? 1.5 : 2;
        for (let l = 0; l < legCount; l++) {
          const legX = (l - legCount / 2) * (o.size * 0.22);
          const legWiggle = Math.sin(o.legsTimer + l * 0.9) * 5;
          // Bottom legs
          ctx.beginPath();
          ctx.moveTo(legX, o.size * 0.35);
          ctx.lineTo(legX - 4, o.size * 0.5 + legWiggle);
          ctx.stroke();
          // Top legs
          ctx.beginPath();
          ctx.moveTo(legX, -o.size * 0.35);
          ctx.lineTo(legX - 4, -o.size * 0.5 - legWiggle);
          ctx.stroke();
        }

        // Draw overlapping carapace segments (back to front for depth)
        for (let seg = o.segments; seg >= 1; seg--) {
          const segOffset = (seg - 1) * (o.size * 0.27);
          const segWidth = o.size * (0.4 + seg * 0.09);
          const segHeight = o.size * (0.34 + seg * 0.08);

          ctx.fillStyle = isCalm ? shellCalm : shellBase;
          ctx.strokeStyle = shellBorder;
          ctx.lineWidth = 1.8;

          ctx.beginPath();
          ctx.ellipse(segOffset, 0, segWidth, segHeight, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Segment ridge highlights
          ctx.strokeStyle = isEnraged ? 'rgba(255, 140, 100, 0.25)' : 'rgba(120, 250, 255, 0.25)';
          ctx.beginPath();
          ctx.arc(segOffset - segWidth * 0.4, 0, segHeight * 0.7, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }

        // Head Antennae & Sensory Tendrils
        ctx.strokeStyle = isEnraged ? '#ff6030' : '#88f0ff';
        ctx.lineWidth = 1.5;
        for (let t = -2; t <= 2; t++) {
          const tWiggle = Math.sin(o.eyeTimer * 2 + t * 1.2) * 5;
          ctx.beginPath();
          ctx.moveTo(-o.size * 0.25, t * 5);
          ctx.lineTo(-o.size * 0.65, t * 9 + tWiggle);
          ctx.stroke();
        }

        // Array of Compound Eyes (7 eyes in curved matrix)
        const eyeCount = o.type === 'ALPHA' ? 7 : o.type === 'BABY' ? 4 : 5;
        const eyeRadius = Math.max(2.5, o.size * 0.12);

        for (let e = 0; e < eyeCount; e++) {
          const angle = ((e - (eyeCount - 1) / 2) / (eyeCount - 1)) * 1.4;
          const ex = -o.size * 0.16 + Math.cos(angle) * (o.size * 0.1);
          const ey = Math.sin(angle) * (o.size * 0.45);
          const eyePulse = Math.sin(o.eyeTimer * 1.5 + e * 0.8) * 1.2;

          ctx.save();
          // Eye glow
          if (isEnraged) {
            ctx.fillStyle = o.type === 'ALPHA' ? '#ff1111' : '#ff3333';
            ctx.shadowColor = '#ff2222';
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = '#2ee2ff';
            ctx.shadowColor = '#2ee2ff';
            ctx.shadowBlur = 10;
          }

          ctx.beginPath();
          ctx.arc(ex, ey, Math.max(2, eyeRadius + eyePulse), 0, Math.PI * 2);
          ctx.fill();

          // Inner bright iris reflection
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex - 1, ey - 1, Math.max(1, eyeRadius * 0.35), 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // Alpha Ohmu Horn Ridge
        if (o.type === 'ALPHA') {
          ctx.fillStyle = '#ff8866';
          ctx.font = 'bold 11px "Courier New", monospace';
          ctx.fillText(`ALPHA HP:${o.hitPoints}`, -20, -o.size * 0.6);
        } else if (o.type === 'BABY') {
          ctx.fillStyle = '#ffe600';
          ctx.font = '9px "Courier New", monospace';
          ctx.fillText('幼生', -10, -o.size * 0.55);
        }

        ctx.restore();
      });

      // 10. Mehve Glider & Nausicaä (Player)
      if (s.status === 'PLAYING') {
        ctx.save();
        ctx.translate(s.player.x, s.player.y);
        ctx.rotate(s.player.tilt);

        // Mehve Wings (Aerodynamic Pure White Jet Glider)
        ctx.fillStyle = '#f8faff';
        ctx.strokeStyle = '#92b3d6';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(22, 0); // Nose tip
        ctx.lineTo(-15, -14); // Left wingtip
        ctx.lineTo(-8, -4);  // Inner wing join
        ctx.lineTo(-18, 0);  // Tail jet engine
        ctx.lineTo(-8, 4);   // Inner wing join
        ctx.lineTo(-15, 14); // Right wingtip
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Control flap details on wings
        ctx.strokeStyle = '#c4daf0';
        ctx.lineWidth = 1;
        ctx.strokeRect(-12, -10, 5, 20);

        // Pilot Nausicaä (Blue tunic, helmet, goggles)
        // Blue Flight Suit
        ctx.fillStyle = '#216cd6';
        ctx.fillRect(-6, -5, 11, 10);
        // Face & Flying Goggles
        ctx.fillStyle = '#ffd1aa';
        ctx.fillRect(4, -3, 5, 6);
        ctx.fillStyle = '#223344'; // Goggles
        ctx.fillRect(6, -2, 2, 4);
        // Cap / Auburn Hair
        ctx.fillStyle = '#9b3d22';
        ctx.fillRect(-1, -6, 6, 4);

        // Jet Engine Exhaust Glow (Cyan Plasma)
        const thrust = Math.random() * 5 + 6;
        ctx.fillStyle = '#55ffff';
        ctx.beginPath();
        ctx.moveTo(-18, -3);
        ctx.lineTo(-18 - thrust, 0);
        ctx.lineTo(-18, 3);
        ctx.closePath();
        ctx.fill();

        // Insect Whistle Active Aura (if spinning)
        if (s.player.whistleActiveTimer > 0) {
          ctx.strokeStyle = '#7ef9ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 26 + Math.sin(Date.now() * 0.02) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 11. Floating Score Texts
      s.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 12. Top HUD Bar (Retro 1984 Computer Game Style)
      ctx.fillStyle = '#0a140f';
      ctx.fillRect(0, 0, canvas.width, 36);
      ctx.strokeStyle = '#3a8053';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, 34);

      ctx.font = '14px "VT323", "Courier New", monospace';
      ctx.fillStyle = '#72ff72';

      // Score & High Score
      ctx.fillText(`SCORE: ${s.score.toString().padStart(6, '0')}`, 14, 23);
      ctx.fillText(`HI: ${s.highScore.toString().padStart(6, '0')}`, 160, 23);
      ctx.fillText(`WAVE: ${s.wave}/5`, 275, 23);

      // Defense Bar
      ctx.fillText(`DEFENSE:`, 365, 23);
      ctx.fillStyle = '#1c2e22';
      ctx.fillRect(435, 10, 110, 16);
      ctx.strokeStyle = '#4e9c68';
      ctx.strokeRect(435, 10, 110, 16);

      const defColor = s.defense > 50 ? '#38ff70' : s.defense > 25 ? '#ffe600' : '#ff3838';
      ctx.fillStyle = defColor;
      ctx.fillRect(436, 11, Math.max(0, (s.defense / 100) * 108), 14);

      // Defense text percentage
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(`${Math.round(s.defense)}%`, 475, 22);

      // Calmed Count Goal
      const currentGoal = getGoalForWave(s.wave);
      ctx.fillStyle = '#ffe600';
      ctx.font = '14px "VT323", "Courier New", monospace';
      ctx.fillText(`CALMED: ${s.calmedInWave}/${currentGoal}`, 565, 23);

      // Whistle Ready Indicator
      const whistleReady = s.player.whistleCooldown === 0;
      ctx.fillStyle = whistleReady ? '#7ef9ff' : '#667788';
      ctx.fillText(`[E]笛: ${whistleReady ? 'READY' : 'CD'}`, 680, 23);

      // 13. Screen State Overlays
      if (s.status === 'TITLE') {
        drawTitleScreen(ctx, canvas);
      } else if (s.status === 'GAMEOVER') {
        drawGameOverScreen(ctx, canvas, s.score, s.wave);
      } else if (s.status === 'VICTORY') {
        drawVictoryScreen(ctx, canvas, s.score, s.totalCalmed);
      }

      ctx.restore();
    };

    // Draw Title Screen
    const drawTitleScreen = (c: CanvasRenderingContext2D, cv: HTMLCanvasElement) => {
      c.fillStyle = 'rgba(3, 10, 8, 0.88)';
      c.fillRect(60, 50, cv.width - 120, cv.height - 100);
      c.strokeStyle = '#5dfc9e';
      c.lineWidth = 3;
      c.strokeRect(60, 50, cv.width - 120, cv.height - 100);

      c.textAlign = 'center';

      // 1984 Logo Title
      c.fillStyle = '#ffe600';
      c.font = 'bold 26px "Courier New", monospace';
      c.fillText('風之谷：王蟲的襲擊 (1984)', cv.width / 2, 125);

      c.fillStyle = '#72ff72';
      c.font = '14px "Courier New", monospace';
      c.fillText('NAUSICAÄ OF THE VALLEY OF THE WIND : ATTACK OF THE OHMU', cv.width / 2, 155);

      c.fillStyle = '#a6dfb8';
      c.font = '13px "Courier New", monospace';
      c.fillText('PC-8801 / MSX 1984 VINTAGE CHIP TRIBUTE', cv.width / 2, 185);

      // Instructions block
      c.fillStyle = '#ffffff';
      c.font = '13px "Courier New", monospace';
      c.fillText('【WASD / 方向鍵】駕馭滑翔翼「雨燕」翱翔巡航', cv.width / 2, 235);
      c.fillText('【空白鍵 SPACE】投擲閃光彈安撫狂暴紅眼王蟲', cv.width / 2, 260);
      c.fillText('【E 鍵】吹響高頻「旋轉蟲笛」迷惑牽制王蟲群', cv.width / 2, 285);
      c.fillText('目標：阻止王蟲踏平左側風之谷風車防線！', cv.width / 2, 315);

      // Blink action prompt
      const blink = Math.floor(Date.now() / 450) % 2 === 0;
      if (blink) {
        c.fillStyle = '#ffe600';
        c.font = 'bold 18px "Courier New", monospace';
        c.fillText('★ 按 [SPACE] 空白鍵 或 [ENTER] 啟動出擊 ★', cv.width / 2, 380);
      }

      c.textAlign = 'left';
    };

    // Draw Game Over Screen
    const drawGameOverScreen = (c: CanvasRenderingContext2D, cv: HTMLCanvasElement, finalScore: number, finalWave: number) => {
      c.fillStyle = 'rgba(25, 4, 4, 0.9)';
      c.fillRect(70, 70, cv.width - 140, cv.height - 140);
      c.strokeStyle = '#ff4444';
      c.lineWidth = 3;
      c.strokeRect(70, 70, cv.width - 140, cv.height - 140);

      c.textAlign = 'center';
      c.fillStyle = '#ff3333';
      c.font = 'bold 26px "Courier New", monospace';
      c.fillText('風之谷 防線淪陷...', cv.width / 2, 140);

      c.fillStyle = '#ffaaaa';
      c.font = '14px "Courier New", monospace';
      c.fillText('THE VALLEY HAS FALLEN TO THE RED-EYED STAMPEDE', cv.width / 2, 175);

      c.fillStyle = '#ffffff';
      c.font = '15px "Courier New", monospace';
      c.fillText(`守護輪次: 第 ${finalWave} 波 | 最終功勳得分: ${finalScore}`, cv.width / 2, 230);

      const blink = Math.floor(Date.now() / 450) % 2 === 0;
      if (blink) {
        c.fillStyle = '#ffe600';
        c.font = 'bold 16px "Courier New", monospace';
        c.fillText('按 [SPACE] 空白鍵 再次迎風守護！', cv.width / 2, 310);
      }
      c.textAlign = 'left';
    };

    // Draw Victory Screen
    const drawVictoryScreen = (c: CanvasRenderingContext2D, cv: HTMLCanvasElement, finalScore: number, total: number) => {
      c.fillStyle = 'rgba(2, 14, 18, 0.92)';
      c.fillRect(60, 60, cv.width - 120, cv.height - 120);
      c.strokeStyle = '#7ef9ff';
      c.lineWidth = 3;
      c.strokeRect(60, 60, cv.width - 120, cv.height - 120);

      c.textAlign = 'center';
      c.fillStyle = '#ffe600';
      c.font = 'bold 24px "Courier New", monospace';
      c.fillText('奇蹟降臨！王蟲平息，大地化為金黃！', cv.width / 2, 130);

      c.fillStyle = '#7ef9ff';
      c.font = '14px "Courier New", monospace';
      c.fillText('THE MIRACLE OF THE VALLEY - PEACE RESTORED', cv.width / 2, 165);

      c.fillStyle = '#ffffff';
      c.font = '15px "Courier New", monospace';
      c.fillText(`成功安撫王蟲總計: ${total} 頭 | 總榮譽積分: ${finalScore}`, cv.width / 2, 225);

      c.fillStyle = '#38ff70';
      c.font = '14px "Courier New", monospace';
      c.fillText('「那身穿藍衣的人，將降臨在金色的原野上...」', cv.width / 2, 265);

      const blink = Math.floor(Date.now() / 450) % 2 === 0;
      if (blink) {
        c.fillStyle = '#ffe600';
        c.font = 'bold 16px "Courier New", monospace';
        c.fillText('按 [SPACE] 空白鍵 重溫風之傳奇', cv.width / 2, 330);
      }
      c.textAlign = 'left';
    };

    // Main animation loop
    const loop = () => {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [checkSaveHighScore]);

  // Touch handlers for mobile
  const handleTouchMove = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', isPressed: boolean) => {
    RetroAudio.userGesture();
    const k = stateRef.current.keys;
    if (direction === 'UP') k['ArrowUp'] = isPressed;
    if (direction === 'DOWN') k['ArrowDown'] = isPressed;
    if (direction === 'LEFT') k['ArrowLeft'] = isPressed;
    if (direction === 'RIGHT') k['ArrowRight'] = isPressed;
  };

  // Palette Filter Class
  const getPaletteFilterClass = () => {
    switch (paletteMode) {
      case 'GREEN_PHOSPHOR':
        return 'filter sepia(1) hue-rotate(85deg) saturate(3.5) contrast(1.2)';
      case 'AMBER_PHOSPHOR':
        return 'filter sepia(1) hue-rotate(5deg) saturate(4) contrast(1.1)';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* CRT Screen Housing */}
      <div
        className={`relative overflow-hidden rounded-lg border-4 border-[#243329] bg-black shadow-[0_0_40px_rgba(0,255,120,0.15)] ${
          crtCurvature ? 'rounded-2xl crt-vignette' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={760}
          height={480}
          style={{ filter: getPaletteFilterClass() ? undefined : undefined }}
          className={`block w-full max-w-[760px] h-auto aspect-[760/480] bg-black cursor-crosshair ${
            paletteMode === 'GREEN_PHOSPHOR'
              ? 'brightness-110 contrast-125'
              : paletteMode === 'AMBER_PHOSPHOR'
              ? 'brightness-105 contrast-120'
              : ''
          }`}
          onClick={() => {
            RetroAudio.userGesture();
            if (gameState === 'TITLE' || gameState === 'GAMEOVER' || gameState === 'VICTORY') {
              startGame();
            } else if (gameState === 'PLAYING') {
              triggerFlare();
            }
          }}
        />

        {/* CRT Scanline Filter Overlay */}
        {scanlines && (
          <div
            className="absolute inset-0 pointer-events-none crt-scanlines crt-flicker opacity-75"
            aria-hidden="true"
          />
        )}

        {/* Bezel Vintage Badges */}
        <div className="absolute top-2 right-3 pointer-events-none text-[10px] text-[#4e9c68] font-mono tracking-widest bg-black/70 px-2 py-0.5 border border-[#2d543c] hidden sm:block">
          PC-8801mkII / MSX 64KB
        </div>
      </div>

      {/* Touch Controls Bar (for mobile & touch devices) */}
      <div className="w-full max-w-[760px] mt-4 flex items-center justify-between gap-4 px-2 select-none md:hidden">
        {/* Virtual D-Pad */}
        <div className="grid grid-cols-3 gap-1 w-36 h-36">
          <div />
          <button
            type="button"
            className="arcade-btn bg-[#182e22] active:bg-[#2e593d] border border-[#3e7d54] text-[#72ff72] flex items-center justify-center font-bold text-lg rounded"
            onTouchStart={() => handleTouchMove('UP', true)}
            onTouchEnd={() => handleTouchMove('UP', false)}
            onMouseDown={() => handleTouchMove('UP', true)}
            onMouseUp={() => handleTouchMove('UP', false)}
            aria-label="向上飛行"
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            className="arcade-btn bg-[#182e22] active:bg-[#2e593d] border border-[#3e7d54] text-[#72ff72] flex items-center justify-center font-bold text-lg rounded"
            onTouchStart={() => handleTouchMove('LEFT', true)}
            onTouchEnd={() => handleTouchMove('LEFT', false)}
            onMouseDown={() => handleTouchMove('LEFT', true)}
            onMouseUp={() => handleTouchMove('LEFT', false)}
            aria-label="向左飛行"
          >
            ◀
          </button>
          <div className="bg-[#0b1510] border border-[#1b3524] rounded flex items-center justify-center text-[10px] text-[#4e9c68]">
            MEHVE
          </div>
          <button
            type="button"
            className="arcade-btn bg-[#182e22] active:bg-[#2e593d] border border-[#3e7d54] text-[#72ff72] flex items-center justify-center font-bold text-lg rounded"
            onTouchStart={() => handleTouchMove('RIGHT', true)}
            onTouchEnd={() => handleTouchMove('RIGHT', false)}
            onMouseDown={() => handleTouchMove('RIGHT', true)}
            onMouseUp={() => handleTouchMove('RIGHT', false)}
            aria-label="向右飛行"
          >
            ▶
          </button>
          <div />
          <button
            type="button"
            className="arcade-btn bg-[#182e22] active:bg-[#2e593d] border border-[#3e7d54] text-[#72ff72] flex items-center justify-center font-bold text-lg rounded"
            onTouchStart={() => handleTouchMove('DOWN', true)}
            onTouchEnd={() => handleTouchMove('DOWN', false)}
            onMouseDown={() => handleTouchMove('DOWN', true)}
            onMouseUp={() => handleTouchMove('DOWN', false)}
            aria-label="向下飛行"
          >
            ▼
          </button>
          <div />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Whistle Button */}
          <button
            type="button"
            onClick={triggerWhistle}
            disabled={whistleCdRatio > 0}
            className={`arcade-btn flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 text-xs font-bold transition-transform ${
              whistleCdRatio > 0
                ? 'bg-[#152024] border-[#2c444c] text-gray-500 opacity-60'
                : 'bg-[#10343a] border-[#22d3ee] text-[#7ef9ff] active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            }`}
          >
            <span>蟲笛</span>
            <span className="text-[10px] mt-0.5">{whistleCdRatio > 0 ? 'CD' : 'E KEY'}</span>
          </button>

          {/* Flash Flare Button */}
          <button
            type="button"
            onClick={() => {
              if (gameState === 'TITLE' || gameState === 'GAMEOVER' || gameState === 'VICTORY') {
                startGame();
              } else {
                triggerFlare();
              }
            }}
            className="arcade-btn flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-[#ffe600] bg-[#3a320c] active:bg-[#594d12] text-[#ffe600] text-sm font-bold active:scale-95 shadow-[0_0_20px_rgba(255,230,0,0.35)]"
          >
            <span>{gameState === 'PLAYING' ? '閃光彈' : '出擊'}</span>
            <span className="text-[10px] text-[#ffea70] mt-0.5">SPACE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
