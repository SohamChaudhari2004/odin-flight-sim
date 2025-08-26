import { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { currentMissionStats } from '@/data/missionData';

interface ControlPanelProps {
  isSimulationRunning: boolean;
  onPlaySimulation: () => void;
  onPauseSimulation: () => void;
  onResetSimulation: () => void;
  onInjectHazard: () => void;
  onRecalculateRoute: () => void;
}

export default function ControlPanel({
  isSimulationRunning,
  onPlaySimulation,
  onPauseSimulation,
  onResetSimulation,
  onInjectHazard,
  onRecalculateRoute
}: ControlPanelProps) {
  const [missionPhase, setMissionPhase] = useState(currentMissionStats.currentPhase);
  
  return (
    <Card className="bg-card border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">MISSION CONTROL</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono-mission">
              {currentMissionStats.missionElapsedTime}
            </Badge>
            <div className={`w-2 h-2 rounded-full ${
              currentMissionStats.systemsStatus === 'All Green' ? 'bg-accent glow-success' : 'bg-destructive'
            }`} />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Mission Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-mono-mission text-muted-foreground">MISSION PHASE</label>
            <div className="bg-muted rounded p-2">
              <span className="text-sm font-mono-mission text-foreground">{missionPhase}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono-mission text-muted-foreground">CREW STATUS</label>
            <div className="bg-muted rounded p-2">
              <span className={`text-sm font-mono-mission ${
                currentMissionStats.crewStatus === 'Nominal' ? 'text-accent' : 'text-destructive'
              }`}>
                {currentMissionStats.crewStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="space-y-3">
          <label className="text-xs font-mono-mission text-muted-foreground">SIMULATION CONTROLS</label>
          <div className="flex space-x-2">
            {!isSimulationRunning ? (
              <Button 
                onClick={onPlaySimulation}
                className="flex-1 bg-accent text-accent-foreground hover:glow-success font-mono-mission"
              >
                <Play className="w-4 h-4 mr-2" />
                PLAY SIMULATION
              </Button>
            ) : (
              <Button 
                onClick={onPauseSimulation}
                className="flex-1 bg-warning text-warning-foreground hover:glow-hazard font-mono-mission"
              >
                <Pause className="w-4 h-4 mr-2" />
                PAUSE
              </Button>
            )}
            
            <Button
              onClick={onResetSimulation}
              variant="outline"
              className="font-mono-mission border-border hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              RESET
            </Button>
          </div>
        </div>

        {/* Mission Operations */}
        <div className="space-y-3">
          <label className="text-xs font-mono-mission text-muted-foreground">MISSION OPERATIONS</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onInjectHazard}
              variant="outline"
              className="font-mono-mission border-warning text-warning hover:bg-warning hover:text-warning-foreground"
            >
              <Zap className="w-4 h-4 mr-2" />
              INJECT HAZARD
            </Button>
            
            <Button
              onClick={onRecalculateRoute}
              variant="outline"
              className="font-mono-mission border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              RECALCULATE
            </Button>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="space-y-3">
          <label className="text-xs font-mono-mission text-muted-foreground">SYSTEM STATUS</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between bg-muted rounded p-2">
              <span className="font-mono-mission">Navigation</span>
              <div className="w-2 h-2 bg-accent rounded-full" />
            </div>
            <div className="flex items-center justify-between bg-muted rounded p-2">
              <span className="font-mono-mission">Propulsion</span>
              <div className="w-2 h-2 bg-accent rounded-full" />
            </div>
            <div className="flex items-center justify-between bg-muted rounded p-2">
              <span className="font-mono-mission">Life Support</span>
              <div className="w-2 h-2 bg-accent rounded-full" />
            </div>
            <div className="flex items-center justify-between bg-muted rounded p-2">
              <span className="font-mono-mission">Communications</span>
              <div className="w-2 h-2 bg-accent rounded-full" />
            </div>
          </div>
        </div>

        {/* Emergency Protocols */}
        <div className="mt-6 p-3 bg-destructive/10 border border-destructive rounded">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-xs font-mono-mission text-destructive font-bold">
              EMERGENCY PROTOCOLS READY
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono-mission">
            Autonomous abort sequence armed. Manual override available.
          </p>
        </div>
      </div>
    </Card>
  );
}