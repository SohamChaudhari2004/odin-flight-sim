
import { useState, useCallback } from 'react';
import cosmicBackground from '@/assets/cosmic-background.jpg';
import TrajectoryView3D from '@/components/TrajectoryView3D';
import HazardPanel from '@/components/HazardPanel';
import MissionLogs from '@/components/MissionLogs';
import ControlPanel from '@/components/ControlPanel';
import MetricsDashboard from '@/components/MetricsDashboard';
import SimulationGraph3D from '@/components/SimulationGraph3D';
import { Badge } from '@/components/ui/badge';
import { Satellite, AlertTriangle, Activity } from 'lucide-react';
import type { Hazard, MissionLog } from '@/data/missionData';

const Index = () => {
  const [activeTrajectory, setActiveTrajectory] = useState('baseline');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [hazardStatus, setHazardStatus] = useState<'nominal' | 'warning' | 'critical'>('nominal');
  const [newLogs, setNewLogs] = useState<MissionLog[]>([]);

  const handleTrajectorySelect = useCallback((trajectoryId: string) => {
    setActiveTrajectory(trajectoryId);
    
    // Generate AI log for trajectory change
    const newLog: MissionLog = {
      id: `traj-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'ODIN-AI' as const,
      message: `Trajectory switched to ${trajectoryId}. Recalculating mission parameters...`,
      priority: 'Info' as const
    };
    setNewLogs([newLog]);
  }, []);

  const handleHazardInject = useCallback((hazard: Hazard) => {
    // Update hazard status based on severity
    if (hazard.severity === 'Critical') {
      setHazardStatus('critical');
    } else if (hazard.severity === 'High' || hazard.severity === 'Medium') {
      setHazardStatus('warning');
    }

    // Generate AI response log
    const responses = [
      `${hazard.type} detected. Analyzing impact on current trajectory.`,
      `Hazard assessment complete. Severity: ${hazard.severity}. Evaluating alternatives.`,
      `Recommendation: Consider trajectory adjustment for optimal safety margins.`
    ];

    const newLog: MissionLog = {
      id: `hazard-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'ODIN-AI' as const,
      message: responses[Math.floor(Math.random() * responses.length)],
      priority: hazard.severity === 'Critical' ? 'Critical' as const : 'Warning' as const
    };
    setNewLogs([newLog]);
  }, []);

  const handlePlaySimulation = useCallback(() => {
    setIsSimulationRunning(true);
    const newLog: MissionLog = {
      id: `sim-start-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'Flight Controller' as const,
      message: 'Mission simulation started. All systems nominal.',
      priority: 'Info' as const
    };
    setNewLogs([newLog]);
  }, []);

  const handlePauseSimulation = useCallback(() => {
    setIsSimulationRunning(false);
    const newLog: MissionLog = {
      id: `sim-pause-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'Flight Controller' as const,
      message: 'Simulation paused. Maintaining current status.',
      priority: 'Info' as const
    };
    setNewLogs([newLog]);
  }, []);

  const handleResetSimulation = useCallback(() => {
    setIsSimulationRunning(false);
    setActiveTrajectory('baseline');
    setHazardStatus('nominal');
    const newLog: MissionLog = {
      id: `sim-reset-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'Flight Controller' as const,
      message: 'Simulation reset to baseline parameters.',
      priority: 'Info' as const
    };
    setNewLogs([newLog]);
  }, []);

  const handleInjectHazard = useCallback(() => {
    // Trigger hazard injection in HazardPanel
    window.dispatchEvent(new CustomEvent('inject-hazard'));
  }, []);

  const handleRecalculateRoute = useCallback(() => {
    // Switch to safe route if not already
    if (activeTrajectory !== 'safe-route-alpha') {
      setActiveTrajectory('safe-route-alpha');
    }
    
    const newLog: MissionLog = {
      id: `recalc-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'ODIN-AI' as const,
      message: 'Route recalculation complete. Optimized for current conditions.',
      priority: 'Info' as const
    };
    setNewLogs([newLog]);
  }, [activeTrajectory]);

  return (
    <div className="h-screen w-screen bg-gradient-cosmic relative overflow-hidden">
      {/* Cosmic background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30"
        style={{
          backgroundImage: `url(${cosmicBackground})`,
        }}
      />
      <div className="absolute inset-0 bg-background/80" />
      
      {/* Header */}
      <header className="relative z-10 bg-card/90 backdrop-blur-sm border-b border-border shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Satellite className="w-6 h-6 text-primary glow-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">ODIN</h1>
                  <p className="text-xs text-muted-foreground font-mono-mission">
                    Autonomous Earth–Moon Mission Planner
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-primary" />
                <Badge variant="outline" className="font-mono-mission text-xs">
                  T+72:16:23
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  hazardStatus === 'critical' ? 'bg-destructive animate-hazard-pulse' :
                  hazardStatus === 'warning' ? 'bg-warning animate-pulse' :
                  'bg-accent glow-success'
                }`} />
                <Badge className={`text-xs ${
                  hazardStatus === 'critical' ? 'bg-destructive text-destructive-foreground' :
                  hazardStatus === 'warning' ? 'bg-warning text-warning-foreground' :
                  'bg-accent text-accent-foreground'
                }`}>
                  {hazardStatus === 'critical' ? 'CRITICAL' :
                   hazardStatus === 'warning' ? 'WARNING' : 'NOMINAL'}
                </Badge>
              </div>
              
              {hazardStatus !== 'nominal' && (
                <AlertTriangle className={`w-4 h-4 ${
                  hazardStatus === 'critical' ? 'text-destructive' : 'text-warning'
                }`} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <div className="relative z-10 flex-1 p-4 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-3">
          {/* Left Column - Controls and Metrics */}
          <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
            {/* Control Panel */}
            <div className="flex-1 min-h-0">
              <ControlPanel
                isSimulationRunning={isSimulationRunning}
                onPlaySimulation={handlePlaySimulation}
                onPauseSimulation={handlePauseSimulation}
                onResetSimulation={handleResetSimulation}
                onInjectHazard={handleInjectHazard}
                onRecalculateRoute={handleRecalculateRoute}
              />
            </div>
            
            {/* Metrics Dashboard */}
            <div className="flex-1 min-h-0">
              <MetricsDashboard activeTrajectory={activeTrajectory} />
            </div>
          </div>
          
          {/* Center Column - 3D Views */}
          <div className="col-span-6 flex flex-col gap-3 overflow-hidden">
            {/* 3D Trajectory View */}
            <div className="flex-1 min-h-0 bg-card/90 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
              <TrajectoryView3D
                activeTrajectory={activeTrajectory}
                onTrajectorySelect={handleTrajectorySelect}
              />
            </div>
            
            {/* 3D Simulation Graph */}
            <div className="h-64 bg-card/90 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
              <SimulationGraph3D activeTrajectory={activeTrajectory} />
            </div>
          </div>
          
          {/* Right Column - Hazards and Logs */}
          <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
            {/* Hazard Detection Panel */}
            <div className="flex-1 min-h-0">
              <HazardPanel onHazardInject={handleHazardInject} />
            </div>
            
            {/* Mission Logs */}
            <div className="flex-1 min-h-0">
              <MissionLogs newLogs={newLogs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
