import { Shield, Wifi, WifiOff, Cpu, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="h-8 w-8 text-primary" />
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-safe animate-pulse-glow" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight font-display">
            <span className="text-gradient-primary">DEEP</span>
            <span className="text-foreground">SHIELD</span>
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            Real-Time Deepfake Detection
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span>CPU Mode</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-safe">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{time.toLocaleTimeString()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
