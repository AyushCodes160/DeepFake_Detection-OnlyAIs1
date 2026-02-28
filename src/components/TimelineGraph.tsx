import { useEffect, useRef } from "react";

interface TimelineGraphProps {
  history: number[];
  isAnalyzing: boolean;
}

const TimelineGraph = ({ history, isAnalyzing }: TimelineGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "hsl(220, 18%, 10%)";
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "hsl(220, 15%, 15%)";
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += h / 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Threshold lines
    ctx.strokeStyle = "hsl(38, 92%, 55%, 0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.4); ctx.lineTo(w, h * 0.4); ctx.stroke();
    ctx.strokeStyle = "hsl(0, 72%, 55%, 0.3)";
    ctx.beginPath(); ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.7); ctx.stroke();
    ctx.setLineDash([]);

    if (history.length < 2) return;

    // Draw line
    const stepX = w / (history.length - 1);
    ctx.beginPath();
    history.forEach((val, i) => {
      const x = i * stepX;
      const y = h - val * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "hsl(175, 80%, 50%)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill gradient
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "hsl(175, 80%, 50%, 0.2)");
    grad.addColorStop(1, "hsl(175, 80%, 50%, 0)");
    ctx.fillStyle = grad;
    ctx.fill();
  }, [history]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
          Score Timeline
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {history.length} frames
        </span>
      </div>
      <div className="rounded-lg overflow-hidden border border-border">
        <canvas ref={canvasRef} width={400} height={100} className="w-full h-[80px]" />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
        <span>0% (Safe)</span>
        <span>30%</span>
        <span>60%</span>
        <span>100% (Fake)</span>
      </div>
    </div>
  );
};

export default TimelineGraph;
