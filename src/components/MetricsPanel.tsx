import { Brain, Eye, Zap, Activity } from "lucide-react";

interface DetectionMetrics {
  cnnScore: number;
  fftScore: number;
  finalScore: number;
  isAnalyzing: boolean;
}

const MetricsPanel = ({ cnnScore, fftScore, finalScore, isAnalyzing }: DetectionMetrics) => {
  const metrics = [
    {
      icon: Brain,
      label: "ViT Deepfake Model",
      value: cnnScore,
      weight: "70%",
      description: "Hugging Face PrithivMLmods SigLIP",
    },
    {
      icon: Zap,
      label: "FaceForensics Heuristics",
      value: fftScore,
      weight: "30%",
      description: "High-frequency GAN artifact detection",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
        Detection Metrics
      </h3>

      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-secondary/50 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <metric.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-mono font-semibold text-foreground">
                {metric.label}
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              w={metric.weight}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: isAnalyzing ? `${metric.value * 100}%` : "0%",
                  backgroundColor:
                    metric.value < 0.3
                      ? "hsl(145, 70%, 45%)"
                      : metric.value < 0.6
                      ? "hsl(38, 92%, 55%)"
                      : "hsl(0, 72%, 55%)",
                }}
              />
            </div>
            <span className="text-xs font-mono text-foreground w-10 text-right">
              {isAnalyzing ? `${(metric.value * 100).toFixed(0)}%` : "—"}
            </span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-1.5">
            {metric.description}
          </p>
        </div>
      ))}

      {/* Combined score */}
      <div className="bg-primary/5 rounded-lg border border-primary/20 p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-mono font-bold text-primary">
              Combined Score
            </span>
          </div>
          <span className="text-sm font-mono font-bold text-foreground">
            {isAnalyzing ? `${(finalScore * 100).toFixed(0)}%` : "—"}
          </span>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">
          (0.7 × ViT) + (0.3 × Heuristics)
        </p>
      </div>
    </div>
  );
};

export default MetricsPanel;
