import { useEffect, useMemo, useRef, useState } from "react";

export type BreathingPhase = "inhale" | "hold" | "exhale" | "hold2";

export type BreathingConfig = {
  inhale: number;
  hold: number;
  exhale: number;
  hold2?: number;
  cycles: number;
};

type Step = { phase: BreathingPhase; seconds: number };

export function useBreathingEngine(
  cfg: BreathingConfig,
  isRunning: boolean,
  onDone: () => void
) {
  const steps: Step[] = useMemo(() => {
    const arr: Step[] = [];
    if (cfg.inhale > 0) arr.push({ phase: "inhale", seconds: cfg.inhale });
    if (cfg.hold > 0) arr.push({ phase: "hold", seconds: cfg.hold });
    if (cfg.exhale > 0) arr.push({ phase: "exhale", seconds: cfg.exhale });
    const hold2 = cfg.hold2 ?? 0;
    if (hold2 > 0) arr.push({ phase: "hold2", seconds: hold2 });
    return arr;
  }, [cfg.inhale, cfg.hold, cfg.exhale, cfg.hold2]);

  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(steps[0]?.seconds ?? 0);
  const [cycle, setCycle] = useState(1);

  const intervalRef = useRef<number | null>(null);

  const phase: BreathingPhase = steps[stepIndex]?.phase ?? "inhale";
  const totalCycles = cfg.cycles;

  useEffect(() => {
    setStepIndex(0);
    setSecondsLeft(steps[0]?.seconds ?? 0);
    setCycle(1);
  }, [steps]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft > 0) return;

    const isLastStep = stepIndex >= steps.length - 1;

    if (!isLastStep) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      setSecondsLeft(steps[nextIndex].seconds);
      return;
    }

    if (cycle < totalCycles) {
      setCycle((c) => c + 1);
      setStepIndex(0);
      setSecondsLeft(steps[0].seconds);
      return;
    }

    onDone();
  }, [secondsLeft, isRunning, stepIndex, steps, cycle, totalCycles, onDone]);

  return {
    phase,
    secondsLeft,
    cycle,
    totalCycles,
    stepIndex,
    stepsCount: steps.length,
  };
}
