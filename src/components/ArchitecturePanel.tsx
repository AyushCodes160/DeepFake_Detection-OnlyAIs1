import { Database, Eye, Cpu, Layers, ArrowRight, Shield } from "lucide-react";

const ArchitecturePanel = () => {
  const pipeline = [
    { icon: Eye, label: "Input", desc: "Webcam / Video" },
    { icon: Database, label: "Face Detect", desc: "MediaPipe" },
    { icon: Cpu, label: "SigLIP", desc: "ViT Classifier" },
    { icon: Layers, label: "Heuristics", desc: "High-Freq. Analysis" },
    { icon: Shield, label: "Score", desc: "Risk Engine" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
        System Architecture
      </h3>
      <div className="bg-secondary/30 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-1">
          {pipeline.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-mono font-bold text-foreground">{step.label}</p>
                  <p className="text-[8px] font-mono text-muted-foreground">{step.desc}</p>
                </div>
              </div>
              {i < pipeline.length - 1 && (
                <ArrowRight className="h-3 w-3 text-primary/40 flex-shrink-0 mt-[-14px]" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-mono text-muted-foreground">
              ViT: Hugging Face PrithivMLmods SigLIP Generative AI Detector
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-mono text-muted-foreground">
              Heuristics: High-Frequency artifact analysis
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-mono text-muted-foreground">
              Scoring: Weighted ensemble (0.7×ViT + 0.3×Heuristics)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturePanel;
