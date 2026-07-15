'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Sound ─────────────────────────────────────────────────────────────────── */
type SndFn = (freq: number, dur: number, type?: string, vol?: number) => void;

function buildSnd(mutedRef: React.MutableRefObject<boolean>): SndFn {
  let ctx: AudioContext | null = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  return (freq, dur, type = 'sine', vol = 0.07) => {
    if (mutedRef.current) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = type as OscillatorType;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.start(); osc.stop(ac.currentTime + dur);
    } catch {}
  };
}

/* ── Registry ──────────────────────────────────────────────────────────────── */
type GameId = 'runner' | 'snake' | 'wordrush' | 'memory' | 'breakout' | 'reflex' | 'car' | 'g2048';

const GAME_TABS: { id: GameId; label: string; hint: string }[] = [
  { id: 'runner',   label: '🏃 Runner',   hint: 'Tap canvas or Space to jump · avoid barriers' },
  { id: 'snake',    label: '🐍 Snake',    hint: 'Swipe on canvas · Arrow keys on desktop' },
  { id: 'wordrush', label: '⌨️ Words',    hint: 'Type the falling word + Enter to catch it' },
  { id: 'memory',   label: '🃏 Memory',   hint: 'Tap cards to flip · match all pairs' },
  { id: 'breakout', label: '🎯 Breakout', hint: 'Move mouse / touch to steer the paddle' },
  { id: 'reflex',   label: '⚡ Reflex',   hint: 'Tap the moment the circle turns green' },
  { id: 'car',      label: '🚗 Car',      hint: 'Move mouse / touch to steer · dodge traffic' },
  { id: 'g2048',    label: '🔢 2048',     hint: 'Swipe or arrow keys to merge tiles' },
];

function cssVar(name: string, fb: string) {
  if (typeof document === 'undefined') return fb;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
}

const CANVAS_STYLE: React.CSSProperties = {
  width: '100%', maxWidth: 560, display: 'block',
  border: '1px solid var(--tc-border)', borderRadius: 'var(--tc-r,0)',
};

/* ══════════════════════════════════════════════════════════
   1. RUNNER
══════════════════════════════════════════════════════════ */
function RunnerGame({ snd }: { snd: SndFn }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const bestRef   = useRef(0);
  const prevGround = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const CW = rect.width, CH = rect.height;
    canvas.width = CW * dpr; canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr);

    const GROUND = CH - 28, CW26 = 28, CH26 = 28, CHAR_X = 72, GRAV = 0.55, OBS_W = 14;
    const g = {
      charY: GROUND - CH26, velY: 0, grounded: true,
      obstacles: [] as { x: number; h: number }[], score: 0, speed: 4.2,
      tick: 0, nextObs: 90, dead: false, started: false,
    };

    const doJump = () => {
      if (g.dead) {
        Object.assign(g, { charY: GROUND - CH26, velY: 0, grounded: true, obstacles: [], score: 0, speed: 4.2, tick: 0, nextObs: 90, dead: false, started: true });
      } else if (g.grounded) {
        g.velY = -14; g.grounded = false; g.started = true;
        snd(440, 0.05, 'sine', 0.07); setTimeout(() => snd(660, 0.05, 'sine', 0.04), 45);
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = cssVar('--tc-page-bg', cssVar('--tc-bg', '#111')); ctx.fillRect(0, 0, CW, CH);
      ctx.strokeStyle = cssVar('--tc-border', '#333'); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(CW, GROUND); ctx.stroke();

      if (g.started && !g.dead) {
        g.velY += GRAV;
        g.charY = Math.min(g.charY + g.velY, GROUND - CH26);
        const wasAir = !prevGround.current;
        g.grounded = g.charY >= GROUND - CH26;
        if (g.grounded) { g.velY = 0; if (wasAir) snd(90, 0.04, 'square', 0.05); }
        prevGround.current = g.grounded;
        g.tick++; g.score = Math.floor(g.tick / 6);
        if (g.tick % 120 === 0) g.speed = Math.min(g.speed + 0.35, 16);
        if (g.score > 0 && g.score % 50 === 0 && g.tick % 6 === 0) snd(880, 0.07, 'sine', 0.06);
        g.nextObs--;
        if (g.nextObs <= 0) {
          g.obstacles.push({ x: CW + 10, h: 18 + Math.random() * 34 });
          g.nextObs = Math.floor(Math.max(48, 95 - g.score / 6));
        }
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const o = g.obstacles[i]; o.x -= g.speed;
          ctx.fillStyle = cssVar('--tc-muted', '#555');
          ctx.fillRect(o.x, GROUND - o.h, OBS_W, o.h);
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
          const mx = o.x + OBS_W / 2, my = GROUND - o.h - 9;
          ctx.beginPath(); ctx.moveTo(mx - 4, my - 4); ctx.lineTo(mx + 4, my + 4); ctx.moveTo(mx + 4, my - 4); ctx.lineTo(mx - 4, my + 4); ctx.stroke();
          if (o.x + OBS_W < 0) { g.obstacles.splice(i, 1); continue; }
          const M = 5;
          if (CHAR_X + CW26 - M > o.x + M && CHAR_X + M < o.x + OBS_W - M && g.charY + CH26 - M > GROUND - o.h + M) {
            g.dead = true; bestRef.current = Math.max(bestRef.current, g.score);
            [440,330,220].forEach((f,i) => setTimeout(() => snd(f, 0.1, 'square', 0.07), i*110));
          }
        }
      }

      const bob = g.grounded && !g.dead ? Math.sin(g.tick * 0.14) * 2 : 0;
      ctx.fillStyle = cssVar('--tc-accent', '#6366f1');
      ctx.fillRect(CHAR_X, g.charY + bob, CW26, CH26);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('GO', CHAR_X + CW26 / 2, g.charY + CH26 / 2 + bob);

      const pad = (n: number) => String(n).padStart(5, '0');
      ctx.font = 'bold 12px monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      if (bestRef.current > 0) { ctx.fillStyle = cssVar('--tc-muted', '#555'); ctx.fillText(`HI ${pad(bestRef.current)}`, CW - 80, 10); }
      ctx.fillStyle = cssVar('--tc-text', '#eee'); ctx.fillText(pad(g.score), CW - 12, 10);

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (!g.started) { ctx.fillStyle = cssVar('--tc-muted', '#888'); ctx.font = '12px monospace'; ctx.fillText('TAP / SPACE TO START', CW / 2, CH / 2 - 8); }
      else if (g.dead) {
        ctx.fillStyle = cssVar('--tc-text', '#eee'); ctx.font = 'bold 14px monospace'; ctx.fillText('GAME OVER', CW / 2, CH / 2 - 18);
        ctx.fillStyle = cssVar('--tc-muted', '#888'); ctx.font = '11px monospace';
        ctx.fillText(`SCORE ${g.score}   BEST ${bestRef.current}`, CW / 2, CH / 2 + 2);
        ctx.fillText('TAP OR SPACE TO RESTART', CW / 2, CH / 2 + 22);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); doJump(); } };
    window.addEventListener('keydown', onKey); canvas.addEventListener('click', doJump);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('keydown', onKey); canvas.removeEventListener('click', doJump); };
  }, [snd]);

  return <canvas ref={canvasRef} style={{ ...CANVAS_STYLE, height: 200, cursor: 'pointer' }} />;
}

/* ══════════════════════════════════════════════════════════
   2. SNAKE  (with touch swipe)
══════════════════════════════════════════════════════════ */
function SnakeGame({ snd }: { snd: SndFn }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const bestRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const CW = rect.width, CH = rect.height;
    canvas.width = CW * dpr; canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr);

    const CELL = 16, COLS = Math.floor(CW / CELL), ROWS = Math.floor(CH / CELL), TICK = 120;
    type Pt = { x: number; y: number };
    const randFood = (snake: Pt[]): Pt => {
      let p: Pt;
      do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
      while (snake.some(s => s.x === p.x && s.y === p.y)); return p;
    };
    const initSnake = (): Pt[] => [
      { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
      { x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) },
      { x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) },
    ];
    const g = { snake: initSnake(), dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
      food: { x: 0, y: 0 }, score: 0, dead: false, started: false, lastTick: 0 };
    g.food = randFood(g.snake);

    const reset = () => {
      g.snake = initSnake(); g.dir = { x: 1, y: 0 }; g.nextDir = { x: 1, y: 0 };
      g.food = randFood(g.snake); g.score = 0; g.dead = false; g.started = true; g.lastTick = 0;
    };

    // Keyboard
    const onKey = (e: KeyboardEvent) => {
      const c = e.code;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space'].includes(c)) e.preventDefault();
      if (!g.started) { g.started = true; return; }
      if (g.dead && c === 'Space') { reset(); return; }
      if (c === 'ArrowUp'   || c === 'KeyW') { if (g.dir.y !== 1)  g.nextDir = { x: 0, y: -1 }; }
      if (c === 'ArrowDown' || c === 'KeyS') { if (g.dir.y !== -1) g.nextDir = { x: 0, y: 1 }; }
      if (c === 'ArrowLeft' || c === 'KeyA') { if (g.dir.x !== 1)  g.nextDir = { x: -1, y: 0 }; }
      if (c === 'ArrowRight'|| c === 'KeyD') { if (g.dir.x !== -1) g.nextDir = { x: 1, y: 0 }; }
    };
    window.addEventListener('keydown', onKey);

    // Touch swipe
    let tx = 0, ty = 0;
    const onTouchStart = (e: TouchEvent) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        if (!g.started) g.started = true; else if (g.dead) reset(); return;
      }
      if (!g.started) g.started = true;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) { if (g.dir.x !== -1) g.nextDir = { x: 1, y: 0 }; }
        else         { if (g.dir.x !== 1)  g.nextDir = { x: -1, y: 0 }; }
      } else {
        if (dy > 0) { if (g.dir.y !== -1) g.nextDir = { x: 0, y: 1 }; }
        else         { if (g.dir.y !== 1)  g.nextDir = { x: 0, y: -1 }; }
      }
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: true });

    const loop = (ts: number) => {
      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = cssVar('--tc-page-bg', cssVar('--tc-bg', '#111')); ctx.fillRect(0, 0, CW, CH);
      ctx.strokeStyle = cssVar('--tc-border', '#1e1e1e'); ctx.lineWidth = 0.3;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,CH); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(CW,y*CELL); ctx.stroke(); }

      if (g.started && !g.dead && ts - g.lastTick >= TICK) {
        g.lastTick = ts; g.dir = g.nextDir;
        const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || g.snake.some(s => s.x === head.x && s.y === head.y)) {
          g.dead = true; bestRef.current = Math.max(bestRef.current, g.score); snd(150, 0.3, 'square', 0.08);
        } else {
          g.snake.unshift(head);
          if (head.x === g.food.x && head.y === g.food.y) {
            g.score++; g.food = randFood(g.snake);
            snd(660, 0.06, 'sine', 0.08); setTimeout(() => snd(880, 0.06, 'sine', 0.05), 60);
          } else { g.snake.pop(); }
        }
      }

      const acc = cssVar('--tc-accent', '#6366f1');
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.arc(g.food.x*CELL+CELL/2, g.food.y*CELL+CELL/2, CELL/2-1, 0, Math.PI*2); ctx.fill();
      g.snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? acc : cssVar('--tc-sec', '#888');
        const p = i === 0 ? 1 : 2;
        ctx.fillRect(s.x*CELL+p, s.y*CELL+p, CELL-p*2, CELL-p*2);
      });

      ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.font = 'bold 12px monospace';
      ctx.fillStyle = cssVar('--tc-text', '#eee'); ctx.fillText(`${g.score}`, CW-8, 8);
      if (bestRef.current > 0) { ctx.fillStyle = cssVar('--tc-muted', '#555'); ctx.font = '10px monospace'; ctx.fillText(`HI ${bestRef.current}`, CW-38, 8); }

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (!g.started) { ctx.fillStyle = cssVar('--tc-muted', '#888'); ctx.font = '12px monospace'; ctx.fillText('SWIPE · ARROW KEYS · TAP TO START', CW/2, CH/2); }
      else if (g.dead) {
        ctx.fillStyle = cssVar('--tc-text', '#eee'); ctx.font = 'bold 14px monospace'; ctx.fillText('GAME OVER', CW/2, CH/2-18);
        ctx.fillStyle = cssVar('--tc-muted', '#888'); ctx.font = '11px monospace';
        ctx.fillText(`SCORE ${g.score}   BEST ${bestRef.current}`, CW/2, CH/2+2);
        ctx.fillText('SWIPE OR SPACE TO RESTART', CW/2, CH/2+22);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [snd]);

  return <canvas ref={canvasRef} style={{ ...CANVAS_STYLE, height: 280, cursor: 'pointer', touchAction: 'none' }} />;
}

/* ══════════════════════════════════════════════════════════
   3. WORD RUSH
══════════════════════════════════════════════════════════ */
const WORD_BANK = [
  'connect','message','reply','draft','voice','inbox','share','email','signal',
  'speak','sync','send','note','brief','hello','radio','ping','wave','post',
  'link','call','buzz','ring','alert','flag','read','chat','text','memo',
  'prompt','agent','token','model','context','embed','stream','fetch','parse',
  'deploy','build','debug','merge','commit','branch','review','query','cache',
];

function WordRushGame({ snd }: { snd: SndFn }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const rafRef    = useRef<number>(0);
  const stateRef  = useRef({
    words: [] as { word: string; x: number; y: number; speed: number }[],
    score: 0, lives: 3, tick: 0, nextWord: 80, speed: 0.8,
    dead: false, started: false, typed: '',
  });

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const CW = rect.width, CH = rect.height;
    canvas.width = CW * dpr; canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr);
    const g = stateRef.current;

    const spawnWord = () => {
      const pool = WORD_BANK.filter(w => !g.words.some(fw => fw.word === w));
      if (!pool.length) return;
      const word = pool[Math.floor(Math.random() * pool.length)];
      ctx.font = 'bold 14px monospace';
      const tw = ctx.measureText(word).width;
      g.words.push({ word, x: tw/2 + Math.random()*(CW-tw-20)+10, y: -20, speed: g.speed + Math.random()*0.4 });
    };

    const loop = () => {
      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = cssVar('--tc-page-bg', cssVar('--tc-bg', '#111')); ctx.fillRect(0, 0, CW, CH);

      if (g.started && !g.dead) {
        g.tick++;
        if (g.tick % 200 === 0) g.speed = Math.min(g.speed + 0.15, 2.5);
        g.nextWord--;
        if (g.nextWord <= 0 && g.words.length < 7) { spawnWord(); g.nextWord = Math.floor(Math.max(55, 100 - g.score*5)); }

        const typed = g.typed.toLowerCase();
        for (let i = g.words.length - 1; i >= 0; i--) {
          const w = g.words[i]; w.y += w.speed;
          const matched = w.word === typed;
          const partial = !matched && w.word.startsWith(typed) && typed.length > 0;
          ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = matched ? cssVar('--tc-accent','#6366f1') : partial ? '#fff' : cssVar('--tc-sec','#999');
          ctx.fillText(w.word, w.x, w.y);
          if (w.y > CH) {
            g.words.splice(i, 1); g.lives--;
            snd(180, 0.2, 'sawtooth', 0.07);
            if (g.lives <= 0) g.dead = true;
          }
        }

        ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = 'bold 12px monospace';
        ctx.fillStyle = cssVar('--tc-text','#eee'); ctx.fillText(`${g.score}`, 10, 10);
        ctx.fillStyle = '#ef4444'; ctx.font = '14px monospace';
        ctx.fillText('♥'.repeat(g.lives), CW/2 - 24, 8);
        ctx.fillStyle = cssVar('--tc-muted','#555');
        ctx.fillText('♡'.repeat(3-g.lives), CW/2-24+g.lives*16, 8);

        if (g.typed) {
          ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
          ctx.fillStyle = cssVar('--tc-accent','#6366f1'); ctx.font = 'bold 13px monospace';
          ctx.fillText(g.typed, CW/2, CH - 8);
        }
      }

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (!g.started) { ctx.fillStyle = cssVar('--tc-muted','#888'); ctx.font = '12px monospace'; ctx.fillText('CLICK THE INPUT BELOW AND START TYPING', CW/2, CH/2); }
      else if (g.dead) {
        ctx.fillStyle = cssVar('--tc-text','#eee'); ctx.font = 'bold 14px monospace'; ctx.fillText('GAME OVER', CW/2, CH/2-18);
        ctx.fillStyle = cssVar('--tc-muted','#888'); ctx.font = '11px monospace';
        ctx.fillText(`WORDS TYPED: ${g.score}`, CW/2, CH/2+2);
        ctx.fillText('CLICK INPUT TO RESTART', CW/2, CH/2+22);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [snd]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const g = stateRef.current;
    if (g.dead) {
      Object.assign(g, { words: [], score: 0, lives: 3, tick: 0, nextWord: 80, speed: 0.8, dead: false, started: true, typed: '' });
      if (inputRef.current) inputRef.current.value = ''; return;
    }
    g.started = true; g.typed = e.target.value;
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const g = stateRef.current;
    if (e.key === 'Enter') {
      e.preventDefault();
      const typed = g.typed.trim().toLowerCase();
      const idx = g.words.findIndex(w => w.word === typed);
      if (idx !== -1) {
        g.words.splice(idx, 1); g.score++;
        [523,659,784].forEach((f,i) => setTimeout(() => snd(f, 0.08, 'sine', 0.06), i*40));
      } else { snd(200, 0.1, 'sawtooth', 0.05); }
      g.typed = ''; if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', maxWidth: 560 }}>
      <canvas ref={canvasRef} style={{ ...CANVAS_STYLE, height: 220 }} />
      <input ref={inputRef} autoComplete="off" spellCheck={false} placeholder="type the word here…"
        onChange={handleInput} onKeyDown={handleKey}
        style={{ width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-geist-mono),monospace', background: 'var(--tc-chip)', border: '1px solid var(--tc-border)', color: 'var(--tc-text)', borderRadius: 'var(--tc-r,0)', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4. MEMORY MATCH  (4×4 = 8 pairs, bigger cards)
══════════════════════════════════════════════════════════ */
const MEM_EMOJIS = ['💬','📨','📧','📱','🔔','📢','✉️','⚡'];
type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function MemoryGame({ snd }: { snd: SndFn }) {
  const makeCards = (): Card[] => {
    const pairs = [...MEM_EMOJIS, ...MEM_EMOJIS];
    for (let i = pairs.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [pairs[i],pairs[j]]=[pairs[j],pairs[i]]; }
    return pairs.map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
  };

  const [cards, setCards] = useState<Card[]>(makeCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves,   setMoves]   = useState(0);
  const [won,     setWon]     = useState(false);
  const lockRef = useRef(false);

  const handleFlip = useCallback((id: number) => {
    if (lockRef.current) return;
    setCards(prev => {
      const c = prev[id]; if (c.flipped || c.matched) return prev;
      const next = prev.map((card, i) => i===id ? {...card, flipped: true} : card);
      const nowFlipped = [...flipped, id];
      if (nowFlipped.length === 2) {
        lockRef.current = true; setMoves(m => m+1);
        const [a, b] = nowFlipped;
        if (next[a].emoji === next[b].emoji) {
          const matched = next.map((card, i) => i===a||i===b ? {...card, matched: true} : card);
          setFlipped([]); lockRef.current = false;
          [523,659,784,1047].forEach((f,i) => setTimeout(() => snd(f, 0.1, 'sine', 0.06), i*55));
          if (matched.every(c => c.matched)) {
            setWon(true);
            setTimeout(() => [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => snd(f,0.12,'sine',0.07),i*60)), 200);
          }
          return matched;
        } else {
          snd(200, 0.15, 'square', 0.06);
          setTimeout(() => { setCards(cs => cs.map((card,i) => i===a||i===b ? {...card,flipped:false} : card)); setFlipped([]); lockRef.current = false; }, 900);
        }
        setFlipped([]);
      } else { setFlipped(nowFlipped); snd(660, 0.04, 'sine', 0.05); }
      return next;
    });
  }, [flipped, snd]);

  const restart = () => { setCards(makeCards()); setFlipped([]); setMoves(0); setWon(false); lockRef.current = false; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--tc-muted)', fontFamily: 'monospace' }}>MOVES: {moves}</span>
        {won && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tc-accent)' }}>✓ SOLVED IN {moves} MOVES</span>}
        <button onClick={restart} style={{ fontSize: 11, color: 'var(--tc-muted)', background: 'none', border: '1px solid var(--tc-border)', padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', borderRadius: 'var(--tc-r,0)' }}>RESTART</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '100%' }}>
        {cards.map((card, i) => (
          <button key={card.id} onClick={() => handleFlip(i)}
            style={{ aspectRatio: '1', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: card.matched ? 'default' : 'pointer', border: `2px solid ${card.matched ? 'var(--tc-accent)' : 'var(--tc-border)'}`, background: card.flipped||card.matched ? 'var(--tc-chip)' : 'var(--tc-hover)', borderRadius: 'var(--tc-r,0)', transition: 'all .15s', opacity: card.matched ? 0.5 : 1 }}>
            {card.flipped||card.matched ? card.emoji : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5. BREAKOUT
══════════════════════════════════════════════════════════ */
const BRICK_COLS = 8, BRICK_ROWS = 4;
const ROW_COLORS = ['#6366f1','#818cf8','#a5b4fc','rgba(165,180,252,0.55)'];
const ROW_PTS    = [40, 30, 20, 10];

function BreakoutGame({ snd }: { snd: SndFn }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const bestRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const CW = rect.width, CH = rect.height;
    canvas.width = CW * dpr; canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr);

    const PAD_W=90, PAD_H=10, PAD_Y=CH-26, BALL_R=7;
    const BRICK_GAP=4, BRICK_PAD_X=8, BRICK_PAD_Y=32;
    const BRICK_W=(CW-BRICK_PAD_X*2-BRICK_GAP*(BRICK_COLS-1))/BRICK_COLS;
    const BRICK_H=16;
    const INIT_SPD=5;

    const makeBricks = () => Array.from({length:BRICK_ROWS},(_,r)=>Array.from({length:BRICK_COLS},(_,c)=>({r,c,alive:true})));
    const g = { bx:CW/2, by:CH/2, vx:INIT_SPD*0.6, vy:-INIT_SPD*0.8, padX:CW/2, bricks:makeBricks(), score:0, lives:3, dead:false, won:false, started:false };

    const reset = () => { g.bx=CW/2; g.by=CH/2; g.vx=INIT_SPD*0.6; g.vy=-INIT_SPD*0.8; g.bricks=makeBricks(); g.score=0; g.lives=3; g.dead=false; g.won=false; g.started=true; };

    const onMouse = (e: MouseEvent) => { const r=canvas.getBoundingClientRect(); g.padX=Math.max(PAD_W/2,Math.min(CW-PAD_W/2,e.clientX-r.left)); };
    const onTouch = (e: TouchEvent) => { e.preventDefault(); const r=canvas.getBoundingClientRect(); g.padX=Math.max(PAD_W/2,Math.min(CW-PAD_W/2,e.touches[0].clientX-r.left)); };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
      if (!g.started && e.code==='Space') { g.started=true; return; }
      if ((g.dead||g.won) && e.code==='Space') { reset(); return; }
      if (e.code==='ArrowLeft')  g.padX=Math.max(PAD_W/2, g.padX-20);
      if (e.code==='ArrowRight') g.padX=Math.min(CW-PAD_W/2, g.padX+20);
    };
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive:false });
    canvas.addEventListener('click', () => { if (!g.started) g.started=true; else if (g.dead||g.won) reset(); });
    window.addEventListener('keydown', onKey);

    const loop = () => {
      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = cssVar('--tc-page-bg', cssVar('--tc-bg','#111')); ctx.fillRect(0,0,CW,CH);
      for (const row of g.bricks) for (const b of row) {
        if (!b.alive) continue;
        const bx=BRICK_PAD_X+b.c*(BRICK_W+BRICK_GAP), by=BRICK_PAD_Y+b.r*(BRICK_H+BRICK_GAP);
        ctx.fillStyle=ROW_COLORS[b.r]; ctx.beginPath(); ctx.roundRect(bx,by,BRICK_W,BRICK_H,3); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(bx+2,by+2,BRICK_W-4,3);
      }
      ctx.fillStyle=cssVar('--tc-accent','#6366f1');
      ctx.beginPath(); ctx.roundRect(g.padX-PAD_W/2,PAD_Y,PAD_W,PAD_H,5); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(g.padX-PAD_W/2+4,PAD_Y+2,PAD_W-8,3);
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(g.bx,g.by,BALL_R,0,Math.PI*2); ctx.fill();

      ctx.textAlign='left'; ctx.textBaseline='top'; ctx.font='bold 12px monospace';
      ctx.fillStyle=cssVar('--tc-text','#eee'); ctx.fillText(`${g.score}`,10,8);
      ctx.fillStyle='#ef4444'; ctx.fillText('♥'.repeat(g.lives)+'♡'.repeat(3-g.lives), CW/2-28, 8);
      if (bestRef.current>0) { ctx.textAlign='right'; ctx.fillStyle=cssVar('--tc-muted','#555'); ctx.font='10px monospace'; ctx.fillText(`HI ${bestRef.current}`,CW-8,8); }

      if (g.started && !g.dead && !g.won) {
        g.bx+=g.vx; g.by+=g.vy;
        if (g.bx-BALL_R<0)  { g.bx=BALL_R;      g.vx=Math.abs(g.vx);  snd(180,0.03,'square',0.04); }
        if (g.bx+BALL_R>CW) { g.bx=CW-BALL_R;   g.vx=-Math.abs(g.vx); snd(180,0.03,'square',0.04); }
        if (g.by-BALL_R<0)  { g.by=BALL_R;       g.vy=Math.abs(g.vy);  snd(220,0.03,'square',0.04); }
        if (g.by+BALL_R>=PAD_Y && g.by+BALL_R<=PAD_Y+PAD_H+2 && g.bx>=g.padX-PAD_W/2 && g.bx<=g.padX+PAD_W/2 && g.vy>0) {
          const hit=(g.bx-g.padX)/(PAD_W/2);
          const spd=Math.hypot(g.vx,g.vy);
          const angle=hit*65*(Math.PI/180);
          g.vx=spd*Math.sin(angle); g.vy=-Math.abs(spd*Math.cos(angle)); g.by=PAD_Y-BALL_R;
          snd(300,0.04,'triangle',0.07);
        }
        if (g.by+BALL_R>CH) {
          g.lives--; snd(150,0.25,'sawtooth',0.08);
          if (g.lives<=0) { g.dead=true; bestRef.current=Math.max(bestRef.current,g.score); [330,220,165].forEach((f,i)=>setTimeout(()=>snd(f,0.12,'square',0.07),i*110)); }
          else { g.bx=CW/2; g.by=CH/2; g.vx=INIT_SPD*0.6*(Math.random()>0.5?1:-1); g.vy=-INIT_SPD*0.8; }
        }
        outer: for (const row of g.bricks) for (const b of row) {
          if (!b.alive) continue;
          const bx=BRICK_PAD_X+b.c*(BRICK_W+BRICK_GAP), by=BRICK_PAD_Y+b.r*(BRICK_H+BRICK_GAP);
          if (g.bx+BALL_R>bx && g.bx-BALL_R<bx+BRICK_W && g.by+BALL_R>by && g.by-BALL_R<by+BRICK_H) {
            b.alive=false; g.score+=ROW_PTS[b.r];
            const oL=(g.bx+BALL_R)-bx, oR=(bx+BRICK_W)-(g.bx-BALL_R);
            const oT=(g.by+BALL_R)-by, oB=(by+BRICK_H)-(g.by-BALL_R);
            if (Math.min(oL,oR)<Math.min(oT,oB)) g.vx*=-1; else g.vy*=-1;
            snd(350+b.r*70,0.04,'square',0.06);
            if (g.bricks.flat().every(b=>!b.alive)) { g.won=true; bestRef.current=Math.max(bestRef.current,g.score); [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>snd(f,0.12,'sine',0.07),i*70)); }
            break outer;
          }
        }
      }

      ctx.textAlign='center'; ctx.textBaseline='middle';
      if (!g.started) { ctx.fillStyle=cssVar('--tc-muted','#888'); ctx.font='11px monospace'; ctx.fillText('MOVE MOUSE / TOUCH · CLICK OR SPACE TO START', CW/2, CH/2+30); }
      else if (g.dead) {
        ctx.fillStyle=cssVar('--tc-text','#eee'); ctx.font='bold 14px monospace'; ctx.fillText('GAME OVER', CW/2, CH/2-16);
        ctx.fillStyle=cssVar('--tc-muted','#888'); ctx.font='11px monospace';
        ctx.fillText(`SCORE ${g.score}   BEST ${bestRef.current}`, CW/2, CH/2+4);
        ctx.fillText('CLICK OR SPACE TO RESTART', CW/2, CH/2+24);
      } else if (g.won) {
        ctx.fillStyle=cssVar('--tc-accent','#6366f1'); ctx.font='bold 14px monospace'; ctx.fillText('YOU WIN!', CW/2, CH/2-16);
        ctx.fillStyle=cssVar('--tc-muted','#888'); ctx.font='11px monospace';
        ctx.fillText(`SCORE ${g.score}`, CW/2, CH/2+4);
        ctx.fillText('CLICK OR SPACE TO PLAY AGAIN', CW/2, CH/2+24);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(rafRef.current); canvas.removeEventListener('mousemove',onMouse); canvas.removeEventListener('touchmove',onTouch); window.removeEventListener('keydown',onKey); };
  }, [snd]);

  return <canvas ref={canvasRef} style={{ ...CANVAS_STYLE, height: 300, cursor: 'none', touchAction: 'none' }} />;
}

/* ══════════════════════════════════════════════════════════
   6. REFLEX TEST  (fixed: stateRef avoids stale closure)
══════════════════════════════════════════════════════════ */
type ReflexPhase = 'idle' | 'waiting' | 'go' | 'result' | 'early';

function ReflexGame({ snd }: { snd: SndFn }) {
  const [phase,  setPhase]  = useState<ReflexPhase>('idle');
  const phaseRef = useRef<ReflexPhase>('idle');
  const [time,   setTime]   = useState<number | null>(null);
  const [best,   setBest]   = useState<number | null>(null);
  const [times,  setTimes]  = useState<number[]>([]);
  const [rounds, setRounds] = useState(0);
  const goAt    = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setState = useCallback((p: ReflexPhase) => { phaseRef.current = p; setPhase(p); }, []);

  const start = useCallback(() => {
    setState('waiting');
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      setState('go');
      goAt.current = performance.now();
      snd(1047, 0.07, 'sine', 0.1);
    }, delay);
  }, [setState, snd]);

  const handleClick = useCallback(() => {
    const p = phaseRef.current;
    if (p === 'idle' || p === 'result' || p === 'early') { start(); return; }
    if (p === 'waiting') {
      clearTimeout(timerRef.current);
      setState('early');
      snd(200, 0.25, 'sawtooth', 0.09);
      return;
    }
    if (p === 'go') {
      const ms = Math.round(performance.now() - goAt.current);
      setTime(ms);
      setBest(b => b === null || ms < b ? ms : b);
      setTimes(t => [...t.slice(-4), ms]);
      setRounds(r => r + 1);
      setState('result');
      const f = ms < 200 ? 1319 : ms < 350 ? 880 : ms < 500 ? 660 : 440;
      snd(f, 0.12, 'sine', 0.08);
    }
  }, [start, setState, snd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handleClick(); } };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(timerRef.current); };
  }, [handleClick]);

  const circleColor = phase==='go' ? '#22c55e' : phase==='waiting' ? '#ef4444' : phase==='early' ? '#f97316' : phase==='result' ? 'var(--tc-accent)' : 'var(--tc-border)';
  const rating = time===null ? '' : time<200 ? '⚡ Lightning' : time<300 ? '🎯 Sharp' : time<450 ? '✓ Good' : time<600 ? '~ Average' : '😴 Slow';
  const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : null;
  const mono = 'var(--font-geist-mono),monospace';

  return (
    <div onClick={handleClick} style={{ width:'100%', maxWidth:560, minHeight:280, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, cursor:'pointer', userSelect:'none', border:'1px solid var(--tc-border)', borderRadius:'var(--tc-r,0)', padding:'32px 0', background:'var(--tc-faint)', touchAction:'manipulation' }}>
      <div style={{ width:130, height:130, borderRadius:'50%', background:circleColor, transition:'background 0.08s', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: phase==='go' ? '0 0 50px rgba(34,197,94,0.6)' : phase==='early' ? '0 0 30px rgba(249,115,22,0.4)' : 'none' }}>
        <span style={{ fontSize:12, fontFamily:mono, color:'#fff', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>
          {phase==='idle'?'TAP':phase==='waiting'?'WAIT…':phase==='go'?'NOW!':phase==='early'?'EARLY':time!==null?`${time}ms`:''}
        </span>
      </div>

      <div style={{ textAlign:'center', fontFamily:mono }}>
        {phase==='result' && time!==null && (
          <div style={{ fontSize:28, fontWeight:900, color:'var(--tc-text)', marginBottom:4 }}>
            {time}<span style={{ fontSize:13, fontWeight:500, color:'var(--tc-muted)', marginLeft:4 }}>ms</span>
          </div>
        )}
        {rating && <div style={{ fontSize:13, color:'var(--tc-accent)', fontWeight:700, marginBottom:10 }}>{rating}</div>}
        {rounds > 0 && (
          <div style={{ display:'flex', gap:24, justifyContent:'center', fontSize:10, color:'var(--tc-muted)', textTransform:'uppercase', letterSpacing:'.08em' }}>
            {best!==null && <span>BEST {best}ms</span>}
            {avg!==null && <span>AVG {avg}ms</span>}
            <span>ROUNDS {rounds}</span>
          </div>
        )}
        {times.length > 1 && (
          <div style={{ display:'flex', alignItems:'flex-end', gap:5, justifyContent:'center', marginTop:14, height:32 }}>
            {times.map((t,i) => {
              const h = Math.max(4, Math.min(32, 32-(t-150)/18));
              return <div key={i} style={{ width:14, height:h, background:t<300?'var(--tc-accent)':'var(--tc-muted)', borderRadius:3 }} />;
            })}
          </div>
        )}
        <div style={{ fontSize:10, color:'var(--tc-muted)', marginTop:14, textTransform:'uppercase', letterSpacing:'.08em' }}>
          {phase==='idle'?'Tap / Space to start':phase==='waiting'?'Click the moment it turns green!':phase==='early'?'Too early — try again':phase==='go'?'TAP NOW!':'Tap / Space for next round'}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   7. CAR DODGE  (new)
══════════════════════════════════════════════════════════ */
function CarGame({ snd }: { snd: SndFn }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const bestRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const CW = rect.width, CH = rect.height;
    canvas.width = CW * dpr; canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d')!; ctx.scale(dpr, dpr);

    const RX = CW * 0.12, RW = CW * 0.76, RR = RX + RW;
    const LANE_W = RW / 3, CAR_W = 32, CAR_H = 50, PLY = CH - 75;
    const ENEMY_COLS = ['#ef4444','#f97316','#eab308','#a855f7','#ec4899','#22c55e'];

    type Enemy = { x: number; y: number; w: number; h: number; spd: number; color: string };
    const g = {
      px: CW/2, tx: CW/2, lives: 3, score: 0, spd: 2.8, tick: 0,
      nextE: 80, roadOff: 0, treeOff: 0,
      enemies: [] as Enemy[], dead: false, started: false,
      keys: { left: false, right: false },
    };

    const spawnEnemy = () => {
      const lane = Math.floor(Math.random() * 3);
      const ew = 28+Math.random()*12, eh = 42+Math.random()*16;
      g.enemies.push({ x: RX+LANE_W*lane+LANE_W/2, y: -eh, w: ew, h: eh, spd: g.spd+Math.random()*1.8, color: ENEMY_COLS[Math.floor(Math.random()*ENEMY_COLS.length)] });
    };

    const reset = () => {
      g.px=CW/2; g.tx=CW/2; g.lives=3; g.score=0; g.spd=2.8; g.tick=0;
      g.nextE=80; g.roadOff=0; g.treeOff=0; g.enemies=[]; g.dead=false; g.started=true;
      g.keys.left=false; g.keys.right=false;
    };

    const drawCar = (x: number, y: number, w: number, h: number, color: string, isPlayer: boolean) => {
      ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x-w/2, y-h/2, w, h, 5); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(x-w/2+4, y-h/2+8, w-8, h*0.3);
      ctx.fillRect(x-w/2+4, y+h*0.1, w-8, h*0.22);
      ctx.fillStyle='#111';
      ctx.fillRect(x-w/2-3, y-h/2+5, 5, 10); ctx.fillRect(x+w/2-2, y-h/2+5, 5, 10);
      ctx.fillRect(x-w/2-3, y+h/2-15, 5, 10); ctx.fillRect(x+w/2-2, y+h/2-15, 5, 10);
      if (isPlayer) {
        ctx.fillStyle='#fbbf24';
        ctx.fillRect(x-w/2+3, y-h/2, 6, 3); ctx.fillRect(x+w/2-9, y-h/2, 6, 3);
        ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(x-w/2+2, y-h/2+1, w-4, 5);
      } else {
        ctx.fillStyle='#ef4444';
        ctx.fillRect(x-w/2+3, y+h/2-3, 6, 3); ctx.fillRect(x+w/2-9, y+h/2-3, 6, 3);
      }
    };

    const onMouse = (e: MouseEvent) => {
      if (!g.started || g.dead) return;
      const r = canvas.getBoundingClientRect();
      g.tx = Math.max(RX+CAR_W/2, Math.min(RR-CAR_W/2, e.clientX-r.left));
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (!g.started || g.dead) return;
      const r = canvas.getBoundingClientRect();
      g.tx = Math.max(RX+CAR_W/2, Math.min(RR-CAR_W/2, e.touches[0].clientX-r.left));
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft','ArrowRight','KeyA','KeyD','Space'].includes(e.code)) e.preventDefault();
      if (!g.started && e.code==='Space') { g.started=true; return; }
      if (g.dead && e.code==='Space') { reset(); return; }
      if (e.code==='ArrowLeft'||e.code==='KeyA')  g.keys.left=true;
      if (e.code==='ArrowRight'||e.code==='KeyD') g.keys.right=true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code==='ArrowLeft'||e.code==='KeyA')  g.keys.left=false;
      if (e.code==='ArrowRight'||e.code==='KeyD') g.keys.right=false;
    };
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive:false });
    canvas.addEventListener('click', () => { if (!g.started) g.started=true; else if (g.dead) reset(); });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    const loop = () => {
      // Grass
      ctx.fillStyle='#15803d'; ctx.fillRect(0,0,CW,CH);
      // Road
      ctx.fillStyle='#374151'; ctx.fillRect(RX,0,RW,CH);
      // Road edges
      ctx.strokeStyle='#fff'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(RX,0); ctx.lineTo(RX,CH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(RR,0); ctx.lineTo(RR,CH); ctx.stroke();
      // Lane dashes (scrolling)
      if (g.started && !g.dead) { g.roadOff=(g.roadOff+g.spd)%44; g.treeOff=(g.treeOff+g.spd*1.4)%CH; }
      ctx.setLineDash([22,22]); ctx.lineDashOffset=-g.roadOff; ctx.lineWidth=1.5;
      for (let lane=1; lane<3; lane++) { const lx=RX+LANE_W*lane; ctx.beginPath(); ctx.moveTo(lx,0); ctx.lineTo(lx,CH); ctx.stroke(); }
      ctx.setLineDash([]);
      // Trees
      for (let i=0; i<5; i++) {
        const y=((i*CH/4.5+g.treeOff)%CH+CH)%CH - 20;
        ctx.fillStyle='#166534'; ctx.beginPath(); ctx.arc(RX*0.45,y,14,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#14532d'; ctx.beginPath(); ctx.arc(RX*0.45,y+10,10,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#166534'; ctx.beginPath(); ctx.arc(CW-RX*0.45,y,14,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#14532d'; ctx.beginPath(); ctx.arc(CW-RX*0.45,y+10,10,0,Math.PI*2); ctx.fill();
      }

      if (g.started && !g.dead) {
        if (g.keys.left)  g.tx=Math.max(RX+CAR_W/2, g.tx-5);
        if (g.keys.right) g.tx=Math.min(RR-CAR_W/2, g.tx+5);
        g.px += (g.tx - g.px) * 0.18;
        g.tick++; g.score=Math.floor(g.tick/8);
        if (g.tick%280===0) g.spd=Math.min(g.spd+0.5, 9);
        g.nextE--;
        if (g.nextE<=0) { spawnEnemy(); g.nextE=Math.floor(Math.max(32,85-g.score/5)); }
        const M=10;
        for (let i=g.enemies.length-1; i>=0; i--) {
          const e=g.enemies[i]; e.y+=e.spd;
          drawCar(e.x, e.y, e.w, e.h, e.color, false);
          if (e.y>CH+e.h) { g.enemies.splice(i,1); continue; }
          if (Math.abs(e.x-g.px)<(e.w/2+CAR_W/2-M) && Math.abs(e.y-PLY)<(e.h/2+CAR_H/2-M)) {
            g.enemies.splice(i,1); g.lives--;
            snd(150,0.3,'sawtooth',0.1);
            if (g.lives<=0) {
              g.dead=true; bestRef.current=Math.max(bestRef.current,g.score);
              [330,220,165].forEach((f,i)=>setTimeout(()=>snd(f,0.12,'square',0.07),i*100));
            }
          }
        }
      }

      drawCar(g.px, PLY, CAR_W, CAR_H, '#3b82f6', true);

      // HUD
      ctx.textAlign='left'; ctx.textBaseline='top'; ctx.font='bold 12px monospace';
      ctx.fillStyle='#fff'; ctx.fillText(`${g.score}`, RX+10, 10);
      ctx.fillStyle='#ef4444'; ctx.font='14px monospace';
      ctx.fillText('♥'.repeat(g.lives)+'♡'.repeat(3-g.lives), CW/2-22, 8);
      if (bestRef.current>0) { ctx.textAlign='right'; ctx.fillStyle='rgba(255,255,255,0.65)'; ctx.font='10px monospace'; ctx.fillText(`BEST ${bestRef.current}`,RR-8,10); }

      ctx.textAlign='center'; ctx.textBaseline='middle';
      if (!g.started) {
        ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,CW,CH);
        ctx.fillStyle='#fff'; ctx.font='12px monospace'; ctx.fillText('MOVE MOUSE / TOUCH TO STEER', CW/2, CH/2-12);
        ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='10px monospace'; ctx.fillText('ARROW KEYS · TAP TO START', CW/2, CH/2+12);
      } else if (g.dead) {
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,CW,CH);
        ctx.fillStyle='#fff'; ctx.font='bold 15px monospace'; ctx.fillText('CRASHED!', CW/2, CH/2-18);
        ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='11px monospace';
        ctx.fillText(`SCORE ${g.score}   BEST ${bestRef.current}`, CW/2, CH/2+4);
        ctx.fillText('TAP OR SPACE TO RESTART', CW/2, CH/2+24);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove',onMouse); canvas.removeEventListener('touchmove',onTouch);
      window.removeEventListener('keydown',onKeyDown); window.removeEventListener('keyup',onKeyUp);
    };
  }, [snd]);

  return <canvas ref={canvasRef} style={{ ...CANVAS_STYLE, height: 320, cursor: 'none', touchAction: 'none' }} />;
}

/* ══════════════════════════════════════════════════════════
   8. 2048  (new — React DOM, keyboard + swipe)
══════════════════════════════════════════════════════════ */
const N = 4;
type Grid2048 = (number | null)[][];

function make2048Grid(): Grid2048 {
  const g: Grid2048 = Array.from({length:N},()=>Array(N).fill(null));
  addRandom2048(g); addRandom2048(g); return g;
}
function addRandom2048(g: Grid2048) {
  const empties: [number,number][] = [];
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) if (!g[r][c]) empties.push([r,c]);
  if (!empties.length) return;
  const [r,c]=empties[Math.floor(Math.random()*empties.length)];
  g[r][c]=Math.random()<0.9?2:4;
}
function slideLeft2048(row: (number|null)[]): { row: (number|null)[]; score: number } {
  const nums = row.filter(Boolean) as number[];
  let score=0; const merged: number[]=[];
  let i=0;
  while (i<nums.length) {
    if (i+1<nums.length && nums[i]===nums[i+1]) { merged.push(nums[i]*2); score+=nums[i]*2; i+=2; }
    else { merged.push(nums[i]); i++; }
  }
  while (merged.length<N) merged.push(0);
  return { row: merged.map(x=>x||null), score };
}
function transpose2048(g: Grid2048): Grid2048 { return g[0].map((_,c)=>g.map(r=>r[c])); }
function reverseRows2048(g: Grid2048): Grid2048 { return g.map(r=>[...r].reverse()); }

function move2048(grid: Grid2048, dir: 'left'|'right'|'up'|'down'): { grid: Grid2048; score: number; moved: boolean } {
  let g = dir==='right' ? reverseRows2048(grid) : dir==='up' ? transpose2048(grid) : dir==='down' ? reverseRows2048(transpose2048(grid)) : grid.map(r=>[...r]);
  let totalScore=0, moved=false;
  g = g.map(row => {
    const {row:newRow, score} = slideLeft2048(row);
    totalScore+=score;
    if (newRow.some((v,i)=>v!==row[i])) moved=true;
    return newRow;
  });
  if (dir==='right') g=reverseRows2048(g);
  else if (dir==='up') g=transpose2048(g);
  else if (dir==='down') g=transpose2048(reverseRows2048(g));
  return { grid: g, score: totalScore, moved };
}
function hasNoMoves(grid: Grid2048): boolean {
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
    if (!grid[r][c]) return false;
    if (c+1<N && grid[r][c]===grid[r][c+1]) return false;
    if (r+1<N && grid[r][c]===grid[r+1][c]) return false;
  } return true;
}
const TILE_COLORS: Record<number,string> = {
  2:'#4f46e5', 4:'#6d28d9', 8:'#7c3aed', 16:'#9333ea', 32:'#c026d3',
  64:'#db2777', 128:'#e11d48', 256:'#dc2626', 512:'#ea580c', 1024:'#d97706', 2048:'#ca8a04',
};

function Game2048({ snd }: { snd: SndFn }) {
  const [grid,   setGrid]   = useState<Grid2048>(make2048Grid);
  const [score,  setScore]  = useState(0);
  const [best,   setBest]   = useState(0);
  const [over,   setOver]   = useState(false);
  const [won,    setWon]    = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const doMove = useCallback((dir: 'left'|'right'|'up'|'down') => {
    setGrid(prev => {
      const { grid: next, score: sc, moved } = move2048(prev, dir);
      if (!moved) return prev;
      addRandom2048(next);
      setScore(s => {
        const ns=s+sc;
        setBest(b=>Math.max(b,ns));
        return ns;
      });
      if (sc>0) {
        const f = sc>=2048?1319:sc>=512?880:sc>=128?660:440;
        snd(f, 0.08, 'sine', 0.07);
      } else { snd(220, 0.03, 'triangle', 0.04); }
      if (next.flat().some(v=>v===2048)) setWon(true);
      if (hasNoMoves(next)) setOver(true);
      return next;
    });
  }, [snd]);

  const restart = useCallback(() => { setGrid(make2048Grid()); setScore(0); setOver(false); setWon(false); snd(523,0.06,'sine',0.06); }, [snd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) return;
      e.preventDefault();
      const map: Record<string,'left'|'right'|'up'|'down'> = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
      doMove(map[e.code]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    let sx=0, sy=0;
    const ts = (e: TouchEvent) => { sx=e.touches[0].clientX; sy=e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if (Math.abs(dx)<30 && Math.abs(dy)<30) return;
      if (Math.abs(dx)>Math.abs(dy)) doMove(dx>0?'right':'left');
      else doMove(dy>0?'down':'up');
    };
    el.addEventListener('touchstart', ts, { passive:true });
    el.addEventListener('touchend',   te, { passive:true });
    return () => { el.removeEventListener('touchstart',ts); el.removeEventListener('touchend',te); };
  }, [doMove]);

  const mono = 'var(--font-geist-mono),monospace';

  return (
    <div ref={containerRef} style={{ width:'100%', maxWidth:560, display:'flex', flexDirection:'column', gap:12, userSelect:'none', touchAction:'none' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ textAlign:'center', background:'var(--tc-chip)', border:'1px solid var(--tc-border)', borderRadius:'var(--tc-r,0)', padding:'6px 14px' }}>
            <div style={{ fontSize:9, color:'var(--tc-muted)', letterSpacing:'.1em', fontFamily:mono }}>SCORE</div>
            <div style={{ fontSize:18, fontWeight:900, color:'var(--tc-text)', fontFamily:mono }}>{score}</div>
          </div>
          <div style={{ textAlign:'center', background:'var(--tc-chip)', border:'1px solid var(--tc-border)', borderRadius:'var(--tc-r,0)', padding:'6px 14px' }}>
            <div style={{ fontSize:9, color:'var(--tc-muted)', letterSpacing:'.1em', fontFamily:mono }}>BEST</div>
            <div style={{ fontSize:18, fontWeight:900, color:'var(--tc-text)', fontFamily:mono }}>{best}</div>
          </div>
        </div>
        <button onClick={restart} style={{ fontSize:11, fontFamily:mono, color:'var(--tc-muted)', background:'none', border:'1px solid var(--tc-border)', padding:'6px 14px', cursor:'pointer', borderRadius:'var(--tc-r,0)' }}>NEW GAME</button>
      </div>

      {/* Grid */}
      <div style={{ position:'relative', background:'var(--tc-chip)', borderRadius:8, padding:8, border:'1px solid var(--tc-border)' }}>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${N},1fr)`, gap:8 }}>
          {grid.flat().map((val,i) => {
            const digits = val ? String(val).length : 0;
            const fs = digits<=2 ? 26 : digits===3 ? 20 : 15;
            return (
              <div key={i} style={{ aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', background: val ? (TILE_COLORS[val]||'#065f46') : 'var(--tc-hover)', borderRadius:6, fontFamily:mono, fontSize:fs, fontWeight:900, color:'#fff', textShadow:val?'0 1px 2px rgba(0,0,0,0.4)':'none', transition:'all .1s' }}>
                {val || ''}
              </div>
            );
          })}
        </div>
        {(over||won) && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'rgba(0,0,0,0.72)', borderRadius:8 }}>
            <div style={{ fontSize:22, fontWeight:900, color:won?'#fbbf24':'#eee', fontFamily:mono }}>{won?'2048!':'GAME OVER'}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontFamily:mono }}>SCORE: {score}</div>
            <button onClick={restart} style={{ marginTop:4, fontSize:11, fontFamily:mono, padding:'8px 20px', background:'var(--tc-accent)', color:'#fff', border:'none', cursor:'pointer', borderRadius:'var(--tc-r,0)', fontWeight:700 }}>PLAY AGAIN</button>
          </div>
        )}
      </div>

      <div style={{ fontSize:10, color:'var(--tc-muted)', fontFamily:mono, textTransform:'uppercase', letterSpacing:'.08em', textAlign:'center' }}>
        Swipe · Arrow keys to merge tiles
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN OFFLINE SHELL
══════════════════════════════════════════════════════════ */
export default function OfflineGame() {
  const [offline,     setOffline]     = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const [activeGame,  setActiveGame]  = useState<GameId>('runner');
  const [muted,       setMuted]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mutedRef = useRef(false);
  const sndRef   = useRef<SndFn | null>(null);
  if (!sndRef.current) sndRef.current = buildSnd(mutedRef);
  const snd = sndRef.current;

  const toggleMute = () => { setMuted(m => { mutedRef.current = !m; return !m; }); };

  useEffect(() => {
    if (!navigator.onLine) setOffline(true);
    const goOff = () => { setOffline(true); setReconnected(false); };
    const goOn  = () => {
      setReconnected(true);
      timerRef.current = setTimeout(() => { setOffline(false); setReconnected(false); }, 2200);
    };
    window.addEventListener('offline', goOff);
    window.addEventListener('online',  goOn);
    return () => { window.removeEventListener('offline',goOff); window.removeEventListener('online',goOn); clearTimeout(timerRef.current); };
  }, []);

  if (!offline) return null;

  const hint = GAME_TABS.find(g => g.id === activeGame)?.hint ?? '';
  const mono = 'var(--font-geist-mono),monospace';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'var(--tc-page-bg,var(--tc-bg))', display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 12px', fontFamily:mono, overflowY:'auto' }}>

      {reconnected && (
        <div style={{ position:'fixed', top:20, background:'#00c853', color:'#000', fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', padding:'7px 18px', border:'2px solid #000', zIndex:1 }}>
          ✓ Connection restored — resuming…
        </div>
      )}

      <div style={{ textAlign:'center', marginBottom:14, marginTop:8 }}>
        <div style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--tc-muted)', marginBottom:6 }}>No internet connection</div>
        <h2 style={{ fontSize:18, fontWeight:900, color:'var(--tc-text)', margin:0, letterSpacing:'-.3px' }}>Play while you reconnect</h2>
      </div>

      {/* Game tabs + mute */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center', alignItems:'center', marginBottom:16, maxWidth:560, width:'100%' }}>
        {GAME_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveGame(tab.id)}
            style={{ padding:'6px 10px', fontSize:11, fontFamily:mono, cursor:'pointer', border:`1px solid ${activeGame===tab.id?'var(--tc-text)':'var(--tc-border)'}`, background:activeGame===tab.id?'var(--tc-chip)':'transparent', color:activeGame===tab.id?'var(--tc-text)':'var(--tc-muted)', borderRadius:'var(--tc-r,0)', transition:'all .1s' }}>
            {tab.label}
          </button>
        ))}
        <button onClick={toggleMute} title={muted?'Unmute':'Mute'}
          style={{ padding:'6px 10px', fontSize:14, cursor:'pointer', border:'1px solid var(--tc-border)', background:'transparent', color:'var(--tc-muted)', borderRadius:'var(--tc-r,0)' }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Active game */}
      <div style={{ width:'100%', maxWidth:560, display:'flex', justifyContent:'center' }}>
        {activeGame==='runner'   && <RunnerGame   key="runner"   snd={snd} />}
        {activeGame==='snake'    && <SnakeGame    key="snake"    snd={snd} />}
        {activeGame==='wordrush' && <WordRushGame key="wordrush" snd={snd} />}
        {activeGame==='memory'   && <MemoryGame   key="memory"   snd={snd} />}
        {activeGame==='breakout' && <BreakoutGame key="breakout" snd={snd} />}
        {activeGame==='reflex'   && <ReflexGame   key="reflex"   snd={snd} />}
        {activeGame==='car'      && <CarGame      key="car"      snd={snd} />}
        {activeGame==='g2048'    && <Game2048     key="g2048"    snd={snd} />}
      </div>

      <p style={{ fontSize:10, color:'var(--tc-muted)', margin:'12px 0 0', letterSpacing:'.08em', textTransform:'uppercase', textAlign:'center' }}>{hint}</p>
    </div>
  );
}
