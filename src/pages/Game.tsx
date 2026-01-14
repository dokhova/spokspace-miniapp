import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "../styles/game.css";
import { useLang } from "../i18n/lang";

type Color = "green" | "yellow" | "blue" | "pink";

const GRID = 7;
const COLORS: Color[] = ["green", "yellow", "blue", "pink"];
const MOVES_TOTAL = 20;
const BEST_KEY = "calmDotsBestResult";

function randColor(): Color {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function indexToRC(i: number) {
  return { r: Math.floor(i / GRID), c: i % GRID };
}

function rcToIndex(r: number, c: number) {
  return r * GRID + c;
}

function areAdjacent(a: number, b: number) {
  const A = indexToRC(a);
  const B = indexToRC(b);
  const dr = Math.abs(A.r - B.r);
  const dc = Math.abs(A.c - B.c);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export default function Game() {
  const { lang } = useLang();

  const strings = useMemo(() => {
    return lang === "ru"
      ? {
          tagGame: "ИГРА",
          tagFocus: "ФОКУС",
          tagTime: "5–10 МИН",
          title: "Спокойные точки",
          subtitle: "Соедини линию одинаковых цветов и сделай ход",
          moves: "ХОДЫ",
          score: "СЧЁТ",
          best: "ЛУЧШЕЕ",
          again: "Начать заново",
          result: (score: number) => `Этот ритм набрал ${score}`,
        }
      : {
          tagGame: "GAME",
          tagFocus: "FOCUS",
          tagTime: "5–10 MIN",
          title: "Calm Dots",
          subtitle: "Connect a line of same-colored dots to make a move",
          moves: "MOVES",
          score: "SCORE",
          best: "BEST",
          again: "Play Again",
          result: (score: number) => `This rhythm scored ${score}`,
        };
  }, [lang]);

  const [grid, setGrid] = useState<Color[]>(() =>
    Array.from({ length: GRID * GRID }, randColor)
  );

  const [movesLeft, setMovesLeft] = useState(MOVES_TOTAL);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => {
    const raw = localStorage.getItem(BEST_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  const selectingRef = useRef(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [path, setPath] = useState<number[]>([]);

  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem(BEST_KEY, String(score));
    }
  }, [score, best]);

  function getDotCenter(idx: number): { x: number; y: number } | null {
    const board = boardRef.current;
    if (!board) return null;
    const el = board.querySelector(
      `[data-dot-index="${idx}"]`
    ) as HTMLElement | null;
    if (!el) return null;

    const b = board.getBoundingClientRect();
    const r = el.getBoundingClientRect();

    return {
      x: r.left - b.left + r.width / 2,
      y: r.top - b.top + r.height / 2,
    };
  }

  useLayoutEffect(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = board.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, rect.width, rect.height);

    if (path.length < 2) return;

    const points = path
      .map((idx) => getDotCenter(idx))
      .filter(Boolean) as { x: number; y: number }[];

    if (points.length < 2) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(255,255,255,0.45)";

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }, [path, grid]);

  function resetGame() {
    setGrid(Array.from({ length: GRID * GRID }, randColor));
    setMovesLeft(MOVES_TOTAL);
    setScore(0);
    setPath([]);
    selectingRef.current = false;
    setGameOver(false);
  }

  function clearSelection() {
    setPath([]);
    selectingRef.current = false;
  }

  function removeAndDrop(selected: number[]) {
    const next: (Color | null)[] = grid.slice();
    for (const i of selected) next[i] = null;

    for (let c = 0; c < GRID; c++) {
      const col: Color[] = [];
      for (let r = GRID - 1; r >= 0; r--) {
        const i = rcToIndex(r, c);
        const v = next[i];
        if (v !== null) col.push(v);
      }
      for (let r = GRID - 1; r >= 0; r--) {
        const i = rcToIndex(r, c);
        next[i] = col.length ? col.shift()! : null;
      }
    }

    for (let i = 0; i < next.length; i++) {
      if (next[i] === null) next[i] = randColor();
    }

    setGrid(next as Color[]);
  }

  function commitMove() {
    if (gameOver) return;
    if (path.length < 2) {
      clearSelection();
      return;
    }

    setMovesLeft((m) => {
      const next = Math.max(0, m - 1);
      if (next === 0) setGameOver(true);
      return next;
    });
    setScore((s) => s + path.length);

    const selected = path.slice();
    clearSelection();

    removeAndDrop(selected);
  }

  function getDotIndexFromPoint(x: number, y: number): number | null {
    const el = document.elementFromPoint(x, y);
    const dot = el?.closest?.("[data-dot-index]") as HTMLElement | null;
    if (!dot) return null;
    const raw = dot.getAttribute("data-dot-index");
    if (!raw) return null;
    const idx = Number(raw);
    return Number.isFinite(idx) ? idx : null;
  }

  function startPointer(x: number, y: number) {
    if (gameOver) return;
    const idx = getDotIndexFromPoint(x, y);
    if (idx === null) return;

    selectingRef.current = true;
    setPath([idx]);
  }

  function movePointer(x: number, y: number) {
    if (!selectingRef.current) return;

    const idx = getDotIndexFromPoint(x, y);
    if (idx === null) return;

    setPath((prev) => {
      if (!prev.length) return prev;

      const last = prev[prev.length - 1];

      if (prev.length > 1 && idx === prev[prev.length - 2]) {
        return prev.slice(0, -1);
      }

      if (idx === last) return prev;
      if (!areAdjacent(idx, last)) return prev;
      if (prev.includes(idx)) return prev;

      const color0 = grid[prev[0]];
      if (grid[idx] !== color0) return prev;

      return [...prev, idx];
    });
  }

  function endPointer() {
    if (!selectingRef.current) return;
    commitMove();
  }

  return (
    <div className="game">
      <div className="game__tags">
        <span>{strings.tagGame}</span>
        <span>•</span>
        <span>{strings.tagFocus}</span>
        <span>•</span>
        <span>{strings.tagTime}</span>
      </div>

      <h1 className="game__title">{strings.title}</h1>
      <p className="game__subtitle">{strings.subtitle}</p>

      <div
        ref={boardRef}
        className="game__board"
        onPointerDown={(e) => startPointer(e.clientX, e.clientY)}
        onPointerMove={(e) => movePointer(e.clientX, e.clientY)}
        onPointerUp={() => endPointer()}
        onPointerCancel={() => endPointer()}
      >
        <canvas ref={canvasRef} className="game__canvas" />
        <div className="dotsGrid">
          {grid.map((color, i) => (
            <div
              key={i}
              data-dot-index={i}
              className={`dot ${color} ${path.includes(i) ? "selected" : ""}`}
              aria-label={`dot-${i}`}
            />
          ))}
        </div>
      </div>

      <div className="game__stats">
        <div className="stat">
          <div className="stat__value">{movesLeft}</div>
          <div className="stat__label">{strings.moves}</div>
        </div>

        <div className="stat">
          <div className="stat__value">{score}</div>
          <div className="stat__label">{strings.score}</div>
        </div>

        <div className="stat">
          <div className="stat__value">{best || "-"}</div>
          <div className="stat__label">{strings.best}</div>
        </div>
      </div>

      {gameOver && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__card">
            <div className="modal__title">{strings.result(score)}</div>
            <button className="modal__btn" onClick={resetGame}>
              {strings.again}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
