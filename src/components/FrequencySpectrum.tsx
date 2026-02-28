import { useEffect, useRef } from "react";

interface FrequencySpectrumProps {
  isAnalyzing: boolean;
  anomalyScore: number;
}

const FrequencySpectrum = ({ isAnalyzing, anomalyScore }: FrequencySpectrumProps) => {
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

    if (!isAnalyzing) {
      ctx.fillStyle = "hsl(215, 15%, 30%)";
      ctx.font = "12px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText("FFT Awaiting Input", w / 2, h / 2);
      return;
    }

    // Simulated FFT magnitude spectrum (2D)
    const cx = w / 2;
    const cy = h / 2;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / w;
        const dy = (y - cy) / h;
        const freq = Math.sqrt(dx * dx + dy * dy);

        // Natural images have energy concentrated in low freq
        // Deepfakes show unusual high-freq patterns
        const natural = Math.exp(-freq * 8) * 255;
        const artifact = anomalyScore * Math.sin(freq * 40) * Math.exp(-freq * 4) * 100;
        const intensity = Math.min(255, Math.max(0, natural + artifact));

        const idx = (y * w + x) * 4;
        const imageData = ctx.getImageData(x, y, 1, 1);
        // Cyan-tinted spectrum
        imageData.data[0] = Math.floor(intensity * 0.2);
        imageData.data[1] = Math.floor(intensity * 0.8);
        imageData.data[2] = Math.floor(intensity);
        imageData.data[3] = 255;
        ctx.putImageData(imageData, x, y);
      }
    }

    // Grid overlay
    ctx.strokeStyle = "hsl(175, 80%, 50%, 0.1)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < w; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }
  }, [isAnalyzing, anomalyScore]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
          FFT Spectrum
        </h3>
        <span className={`text-[10px] font-mono ${anomalyScore > 0.5 ? "text-threat" : "text-primary"}`}>
          {isAnalyzing ? `Anomaly: ${(anomalyScore * 100).toFixed(0)}%` : "—"}
        </span>
      </div>
      <div className="rounded-lg overflow-hidden border border-border bg-secondary/30">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="w-full aspect-square"
        />
      </div>
    </div>
  );
};

export default FrequencySpectrum;
