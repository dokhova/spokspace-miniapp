import type { CSSProperties } from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLang } from "../../i18n/lang";
import { pick } from "../../i18n/pick";
import { tUI } from "../../i18n/strings";
import { practices } from "./practiceConfig";
import { useBreathingEngine } from "./useBreathingEngine";
import "../../styles/practice-player.css";

type Status = "idle" | "running" | "paused" | "done";

export default function PracticePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const breathRef = useRef<HTMLDivElement | null>(null);
  const breathRafRef = useRef<number | null>(null);
  const breathStartRef = useRef<number | null>(null);
  const breathOffsetRef = useRef(0);
  const breathPhaseRef = useRef<string | null>(null);

  const practice = useMemo(() => {
    if (!id) return null;
    return practices[id] ?? null;
  }, [id]);

  const [status, setStatus] = useState<Status>("idle");
  const { lang, setLang } = useLang();

  if (!practice) {
    return (
      <div className="player player--fallback">
        <button className="player__back" onClick={() => navigate(-1)}>
          ✕
        </button>
        <div className="player__center">{tUI("practiceNotFound", lang)}</div>
      </div>
    );
  }

  const onBack = () => navigate(-1);
  const isBreathing = practice.kind === "breathing";
  const isRunning = status === "running";
  const breathingConfig = isBreathing
    ? practice.breathing
    : {
        inhale: 0,
        hold: 0,
        exhale: 0,
        hold2: 0,
        cycles: 1,
      };
  const breathing = useBreathingEngine(
    breathingConfig,
    isRunning && isBreathing,
    () => setStatus("done")
  );
  const audioSrc =
    practice.kind === "breathing" ? practice.audio?.default : practice.audio?.[lang];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === "running") {
      audio.play().catch(() => {});
      return;
    }

    audio.pause();

    if (status === "idle") {
      audio.currentTime = 0;
    }
  }, [status, audioSrc]);

  useEffect(() => {
    return () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (!isBreathing) return;

    const getPhaseDuration = () => {
      switch (breathing.phase) {
        case "inhale":
          return breathingConfig.inhale;
        case "hold":
          return breathingConfig.hold;
        case "exhale":
          return breathingConfig.exhale;
        case "hold2":
          return breathingConfig.hold2 ?? 0;
        default:
          return breathingConfig.inhale;
      }
    };

    const setScale = (value: number) => {
      const node = breathRef.current;
      if (!node) return;
      node.style.setProperty("--breath-scale", value.toFixed(3));
    };

    const minScale = 0.7;
    const maxScale = 1.15;

    const phaseChanged = breathPhaseRef.current !== breathing.phase;
    if (phaseChanged) {
      breathPhaseRef.current = breathing.phase;
      breathOffsetRef.current = 0;
      breathStartRef.current = status === "running" ? Date.now() : null;
      const initialScale =
        breathing.phase === "inhale"
          ? minScale
          : breathing.phase === "hold"
          ? maxScale
          : breathing.phase === "exhale"
          ? maxScale
          : minScale;
      setScale(initialScale);
    }

    const duration = getPhaseDuration() * 1000;
    if (duration <= 0) return;

    const step = () => {
      if (status !== "running") return;
      if (!breathStartRef.current) {
        breathStartRef.current = Date.now();
      }

      const elapsed =
        Date.now() - breathStartRef.current + breathOffsetRef.current;
      const progress = Math.min(elapsed / duration, 1);

      let scale = minScale;
      switch (breathing.phase) {
        case "inhale":
          scale = minScale + (maxScale - minScale) * progress;
          break;
        case "hold":
          scale = maxScale;
          break;
        case "exhale":
          scale = maxScale - (maxScale - minScale) * progress;
          break;
        case "hold2":
          scale = minScale;
          break;
      }

      setScale(scale);
      breathRafRef.current = window.requestAnimationFrame(step);
    };

    if (status === "running") {
      breathRafRef.current = window.requestAnimationFrame(step);
    } else {
      if (breathStartRef.current) {
        breathOffsetRef.current += Date.now() - breathStartRef.current;
        breathStartRef.current = null;
      }
      if (breathRafRef.current) {
        window.cancelAnimationFrame(breathRafRef.current);
        breathRafRef.current = null;
      }
    }

    return () => {
      if (breathRafRef.current) {
        window.cancelAnimationFrame(breathRafRef.current);
        breathRafRef.current = null;
      }
    };
  }, [
    isBreathing,
    breathing.phase,
    breathingConfig.inhale,
    breathingConfig.hold,
    breathingConfig.exhale,
    breathingConfig.hold2,
    status,
  ]);

  const playerBackground = practice.playerBackground ?? practice.previewBg;
  const isCosmic = practice.id === "stars" || practice.id === "place";
  const cosmicCore = practice.id === "stars" ? "#FFD527" : "#4285F4";
  const cosmicRing = practice.id === "stars" ? "rgba(255, 213, 39, 0.35)" : "rgba(133, 183, 255, 0.35)";
  const cosmicGlow1 = practice.id === "stars" ? "rgba(255, 213, 39, 0.5)" : "rgba(66, 133, 244, 0.45)";
  const cosmicGlow2 = practice.id === "stars" ? "rgba(255, 213, 39, 0.18)" : "rgba(66, 133, 244, 0.18)";

  return (
    <div
      className={`player ${isBreathing ? "player--breathing" : "player--meditation"}${isCosmic ? " player--cosmic" : ""}`}
      style={
        {
          background: playerBackground,
          "--breath-core": playerBackground,
          "--cosmic-core": cosmicCore,
          "--cosmic-ring": cosmicRing,
          "--cosmic-glow-1": cosmicGlow1,
          "--cosmic-glow-2": cosmicGlow2,
        } as CSSProperties
      }
    >
      <button className="player__back" onClick={onBack} aria-label="Back">
        ✕
      </button>

      <div className="player__lang-switcher">
        <button
          className={`player__lang-btn ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
          type="button"
        >
          EN
        </button>
        <button
          className={`player__lang-btn ${lang === "ru" ? "active" : ""}`}
          onClick={() => setLang("ru")}
          type="button"
        >
          RU
        </button>
      </div>

      <audio ref={audioRef} src={audioSrc} />

      <div className="player__center">
        {isBreathing ? (
          <div className="breath">
            <div className="breath__stars">
              <span className="breath__star breath__star--1" />
              <span className="breath__star breath__star--2" />
              <span className="breath__star breath__star--3" />
              <span className="breath__star breath__star--4" />
              <span className="breath__star breath__star--5" />
              <span className="breath__star breath__star--6" />
            </div>
            <div
              className={[
                "breath__circles",
                status === "running" ? "is-running" : "",
                status === "paused" ? "is-paused" : "",
                `phase-${breathing.phase}`,
              ].join(" ")}
              ref={breathRef}
            >
              <div className="breath__circle breath__circle--outer" />
              <div className="breath__circle breath__circle--middle" />
              <div className="breath__circle breath__circle--inner" />
            </div>

            <div className="breath__phase">
              {breathing.phase === "inhale"
                ? tUI("inhale", lang)
                : breathing.phase === "exhale"
                ? tUI("exhale", lang)
                : tUI("hold", lang)}
            </div>
            {status !== "idle" && (
              <div className="breath__cycle">
                {tUI("cycle", lang)} {breathing.cycle} {tUI("of", lang)}{" "}
                {breathing.totalCycles}
              </div>
            )}
          </div>
        ) : isCosmic ? (
          <div className={`player__cosmic ${status === "running" ? "is-running" : ""}`}>
            <div className="player__cosmic-stars">
              <span className="player__cosmic-star player__cosmic-star--1" />
              <span className="player__cosmic-star player__cosmic-star--2" />
              <span className="player__cosmic-star player__cosmic-star--3" />
              <span className="player__cosmic-star player__cosmic-star--4" />
              <span className="player__cosmic-star player__cosmic-star--5" />
              <span className="player__cosmic-star player__cosmic-star--6" />
            </div>
            <div className="player__cosmic-glow" />
            <div className="player__cosmic-core" />
            <div className="player__cosmic-ring player__cosmic-ring--1" />
            <div className="player__cosmic-ring player__cosmic-ring--2" />
            <div className="player__cosmic-ring player__cosmic-ring--3" />
          </div>
        ) : (
          <div className="player__meditation">
            <div
              className={[
                "player__waves",
                status === "running" ? "is-running" : "",
              ].join(" ")}
            >
              <div className="player__wave player__wave--1" />
              <div className="player__wave player__wave--2" />
              <div className="player__wave player__wave--3" />
              <div className="player__wave player__wave--4" />
              <div className="player__wave player__wave--5" />
              <span className="player__dot player__dot--1" />
              <span className="player__dot player__dot--2" />
              <span className="player__dot player__dot--3" />
              <span className="player__dot player__dot--4" />
              <span className="player__dot player__dot--5" />
              <span className="player__dot player__dot--6" />
              <span className="player__dot player__dot--7" />
              <span className="player__dot player__dot--8" />
            </div>
          </div>
        )}
      </div>

      {status !== "done" && (
        <div className="player__controls">
          {status === "idle" && (
            <button
              className="player__btn player__btn--pulse"
              onClick={() => setStatus("running")}
            >
              {tUI("start", lang)}
            </button>
          )}

          {status === "running" && (
            <button className="player__btn" onClick={() => setStatus("paused")}>
              {tUI("pause", lang)}
            </button>
          )}

          {status === "paused" && (
            <button className="player__btn" onClick={() => setStatus("running")}>
              {tUI("continue", lang)}
            </button>
          )}

        </div>
      )}

      {status === "done" && (
        <div className="player__completion">
          <div className="player__completionText">
            {pick(practice.finishedText, lang)}
          </div>
          <div className="player__completionPraise">
            {pick(practice.praiseText, lang)}
          </div>
        </div>
      )}
    </div>
  );
}
