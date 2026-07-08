import { useEffect, useMemo, useState } from "react";

const formatElapsed = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = hours > 0 ? [hours, minutes, seconds] : [minutes, seconds];

  return parts.map((part) => String(part).padStart(2, "0")).join(":");
};

const Timer = ({ running = true }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [running]);

  const elapsedTime = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);

  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Timer</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-ink">{elapsedTime}</p>
    </div>
  );
};

export default Timer;
