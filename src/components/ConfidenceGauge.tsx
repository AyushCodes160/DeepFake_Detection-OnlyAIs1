import { useEffect, useState } from "react";

interface ConfidenceGaugeProps {
  score: number; // 0–1
  isAnalyzing: boolean;
}

const ConfidenceGauge = ({ score, isAnalyzing }: ConfidenceGaugeProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setDisplayScore(0);
      return;
    }
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        const diff = score - prev;
        return prev + diff * 0.1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [score, isAnalyzing]);

  const percentage = Math.round(displayScore * 100);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (displayScore * circumference);

  const getColor = (s: number) => {
    if (s < 0.3) return { stroke: "hsl(145, 70%, 45%)", label: "AUTHENTIC", labelClass: "text-safe" };
    if (s < 0.6) return { stroke: "hsl(38, 92%, 55%)", label: "SUSPICIOUS", labelClass: "text-suspicious" };
    return { stroke: "hsl(0, 72%, 55%)", label: "LIKELY SYNTHETIC", labelClass: "text-threat" };
  };

  const colorInfo = getColor(displayScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="hsl(220, 15%, 18%)"
            strokeWidth="6"
          />
          {/* Score ring */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={isAnalyzing ? colorInfo.stroke : "hsl(220, 15%, 18%)"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isAnalyzing ? dashOffset : circumference}
            transform="rotate(-90 60 60)"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono text-foreground">
            {isAnalyzing ? `${percentage}%` : "—"}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground tracking-wider">
            CONFIDENCE
          </span>
        </div>
      </div>

      {isAnalyzing && (
        <div className={`text-xs font-mono font-bold tracking-wider ${colorInfo.labelClass}`}>
          {colorInfo.label}
        </div>
      )}
    </div>
  );
};

export default ConfidenceGauge;
