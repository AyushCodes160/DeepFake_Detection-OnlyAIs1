import { useEffect, useRef } from "react";

interface HeatmapDisplayProps {
  isAnalyzing: boolean;
  score: number;
}

const HeatmapDisplay = ({ isAnalyzing, score }: HeatmapDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    if (!isAnalyzing) {
      ctx.fillStyle = "hsl(220, 18%, 10%)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "hsl(215, 15%, 30%)";
      ctx.font = "12px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText("No data", w / 2, h / 2);
      return;
    }

    // Generate simulated heatmap
    const imageData = ctx.createImageData(w, h);
    const centerX = w * 0.5;
    const centerY = h * 0.45;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const dx = (x - centerX) / w;
        const dy = (y - centerY) / h;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Simulate face-shaped heatmap with hot spots on cheeks/jaw
        const faceShape = Math.max(0, 1 - dist * 3);
        const cheekLeft = Math.exp(-((x - w * 0.35) ** 2 + (y - h * 0.55) ** 2) / 2000) * score;
        const cheekRight = Math.exp(-((x - w * 0.65) ** 2 + (y - h * 0.55) ** 2) / 2000) * score;
        const jaw = Math.exp(-((x - centerX) ** 2 + (y - h * 0.75) ** 2) / 3000) * score * 0.8;
        const forehead = Math.exp(-((x - centerX) ** 2 + (y - h * 0.2) ** 2) / 4000) * score * 0.4;

        const intensity = Math.min(1, (cheekLeft + cheekRight + jaw + forehead) * faceShape * 2);

        // Cool to hot colormap
        if (intensity < 0.25) {
          imageData.data[idx] = 0;
          imageData.data[idx + 1] = Math.floor(intensity * 4 * 100);
          imageData.data[idx + 2] = Math.floor(intensity * 4 * 200 + 30);
        } else if (intensity < 0.5) {
          imageData.data[idx] = Math.floor((intensity - 0.25) * 4 * 255);
          imageData.data[idx + 1] = Math.floor(200 - (intensity - 0.25) * 4 * 100);
          imageData.data[idx + 2] = 0;
        } else {
          imageData.data[idx] = 255;
          imageData.data[idx + 1] = Math.floor(Math.max(0, (1 - intensity) * 2 * 200));
          imageData.data[idx + 2] = 0;
        }
        imageData.data[idx + 3] = Math.floor(intensity * 220 + 20);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [isAnalyzing, score]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
          Artifact Heatmap
        </h3>
        <span className="text-[10px] font-mono text-primary">
          {isAnalyzing ? "LIVE" : "—"}
        </span>
      </div>
      <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/30">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="w-full aspect-square"
        />
        {isAnalyzing && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[9px] font-mono">
            <span className="text-blue-400">Low</span>
            <span className="text-yellow-400">Med</span>
            <span className="text-red-400">High</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapDisplay;
