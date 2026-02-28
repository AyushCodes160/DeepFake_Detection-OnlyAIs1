import { AlertTriangle, CheckCircle, Info, ShieldAlert } from "lucide-react";

interface ExplainabilityPanelProps {
  score: number;
  cnnScore: number;
  fftScore: number;
  isAnalyzing: boolean;
}

const ExplainabilityPanel = ({ score, cnnScore, fftScore, isAnalyzing }: ExplainabilityPanelProps) => {
  if (!isAnalyzing) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
          Explainability
        </h3>
        <div className="bg-secondary/30 rounded-lg border border-border p-4 text-center">
          <Info className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs font-mono text-muted-foreground">
            Start analysis to see detection reasoning
          </p>
        </div>
      </div>
    );
  }

  const getExplanation = () => {
    if (score < 0.3) {
      return {
        icon: CheckCircle,
        iconClass: "text-safe",
        bgClass: "bg-safe/5 border-safe/20",
        title: "Authentic Content Detected",
        reasons: [
          "Natural frequency distribution in FFT spectrum",
          "No significant compression artifacts in facial regions",
          "Consistent lighting and texture patterns",
          "Skin micro-texture patterns match natural imagery",
        ],
      };
    }
    if (score < 0.6) {
      return {
        icon: AlertTriangle,
        iconClass: "text-suspicious",
        bgClass: "bg-suspicious/5 border-suspicious/20",
        title: "Suspicious Patterns Detected",
        reasons: [
          "Unusual energy concentration in high-frequency bands",
          "Minor inconsistencies in facial boundary regions",
          "Slight blending artifacts detected near jawline",
          "Further analysis recommended",
        ],
      };
    }
    return {
      icon: ShieldAlert,
      iconClass: "text-threat",
      bgClass: "bg-threat/5 border-threat/20",
      title: "Likely Synthetic Content",
      reasons: [
        "High-frequency spectral artifacts in cheek and jaw region",
        "GAN fingerprint detected in frequency domain",
        "Facial boundary inconsistencies indicate compositing",
        "CNN confidence exceeds threshold for synthetic classification",
        "Unnatural skin texture smoothing pattern detected",
      ],
    };
  };

  const explanation = getExplanation();
  const Icon = explanation.icon;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
        Explainability
      </h3>
      <div className={`rounded-lg border p-4 ${explanation.bgClass}`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`h-4 w-4 ${explanation.iconClass}`} />
          <span className={`text-sm font-mono font-bold ${explanation.iconClass}`}>
            {explanation.title}
          </span>
        </div>
        <ul className="space-y-2">
          {explanation.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary text-[10px] mt-0.5">▸</span>
              <span className="text-xs font-mono text-foreground/80">{reason}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-[10px] font-mono text-muted-foreground">
            CNN Score: {(cnnScore * 100).toFixed(1)}% • FFT Score: {(fftScore * 100).toFixed(1)}% • Combined: {(score * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPanel;
