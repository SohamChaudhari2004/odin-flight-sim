import { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Satellite, Sun } from 'lucide-react';
import { hazards, type Hazard } from '@/data/missionData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const hazardIcons = {
  'CME': Sun,
  'Solar Flare': Zap,
  'Debris Conjunction': Satellite,
  'Radiation Storm': AlertTriangle
};

const severityColors = {
  'Low': 'bg-accent text-accent-foreground',
  'Medium': 'bg-warning text-warning-foreground', 
  'High': 'bg-destructive text-destructive-foreground',
  'Critical': 'bg-destructive text-destructive-foreground animate-hazard-pulse'
};

interface HazardPanelProps {
  onHazardInject?: (hazard: Hazard) => void;
}

export default function HazardPanel({ onHazardInject }: HazardPanelProps) {
  const [activeHazards, setActiveHazards] = useState<Hazard[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      // Simulate new hazard detection
      if (Math.random() < 0.1 && activeHazards.length < 3) {
        const availableHazards = hazards.filter(h => 
          !activeHazards.some(ah => ah.id === h.id)
        );
        
        if (availableHazards.length > 0) {
          const newHazard = availableHazards[Math.floor(Math.random() * availableHazards.length)];
          setActiveHazards(prev => [...prev, newHazard]);
          onHazardInject?.(newHazard);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring, activeHazards, onHazardInject]);

  const handleDismissHazard = (hazardId: string) => {
    setActiveHazards(prev => prev.filter(h => h.id !== hazardId));
  };

  const injectRandomHazard = () => {
    const availableHazards = hazards.filter(h => 
      !activeHazards.some(ah => ah.id === h.id)
    );
    
    if (availableHazards.length > 0) {
      const randomHazard = availableHazards[Math.floor(Math.random() * availableHazards.length)];
      setActiveHazards(prev => [...prev, randomHazard]);
      onHazardInject?.(randomHazard);
    }
  };

  return (
    <Card className="h-full bg-card border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-accent glow-success animate-pulse' : 'bg-muted'}`} />
            <h2 className="text-lg font-bold text-foreground">HAZARD DETECTION</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-3 py-1 rounded text-xs font-mono-mission transition-colors ${
                isMonitoring 
                  ? 'bg-accent text-accent-foreground glow-success' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isMonitoring ? 'MONITORING' : 'OFFLINE'}
            </button>
            <button
              onClick={injectRandomHazard}
              className="px-3 py-1 bg-warning text-warning-foreground rounded text-xs font-mono-mission hover:glow-hazard transition-all"
            >
              INJECT HAZARD
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 h-[calc(100%-80px)] overflow-y-auto">
        {activeHazards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Sun className="w-8 h-8 text-accent" />
            </div>
            <p className="text-muted-foreground font-mono-mission">
              All systems nominal<br />
              No hazards detected
            </p>
          </div>
        ) : (
          activeHazards.map((hazard) => {
            const IconComponent = hazardIcons[hazard.type];
            return (
              <div
                key={hazard.id}
                className={`border rounded-lg p-3 transition-all ${
                  hazard.severity === 'Critical' ? 'border-destructive glow-hazard' :
                  hazard.severity === 'High' ? 'border-destructive' :
                  hazard.severity === 'Medium' ? 'border-warning' :
                  'border-accent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`w-4 h-4 ${
                      hazard.severity === 'Critical' ? 'text-destructive' :
                      hazard.severity === 'High' ? 'text-destructive' :
                      hazard.severity === 'Medium' ? 'text-warning' :
                      'text-accent'
                    }`} />
                    <span className="font-mono-mission text-sm font-bold text-foreground">
                      {hazard.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={severityColors[hazard.severity]}>
                      {hazard.severity}
                    </Badge>
                    <button
                      onClick={() => handleDismissHazard(hazard.id)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2 font-mono-mission">
                  {hazard.timestamp}
                </p>
                
                <p className="text-sm text-foreground leading-relaxed">
                  {hazard.description}
                </p>
                
                {hazard.coordinates && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs font-mono-mission text-muted-foreground">
                      Coordinates: {hazard.coordinates.lat}°, {hazard.coordinates.lon}°
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}