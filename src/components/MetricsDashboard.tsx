import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Fuel, Clock, Shield, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { trajectories, currentMissionStats } from '@/data/missionData';

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
}

interface MetricsDashboardProps {
  activeTrajectory: string;
}

export default function MetricsDashboard({ activeTrajectory }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  
  useEffect(() => {
    const activeTrajectoryData = trajectories.find(t => t.id === activeTrajectory) || trajectories[0];
    
    const updatedMetrics: Metric[] = [
      {
        id: 'deltaV',
        label: 'Delta-V Required',
        value: activeTrajectoryData.deltaV,
        unit: 'm/s',
        trend: activeTrajectoryData.deltaV > 3200 ? 'up' : activeTrajectoryData.deltaV < 3100 ? 'down' : 'stable',
        status: activeTrajectoryData.deltaV > 4000 ? 'critical' : activeTrajectoryData.deltaV > 3500 ? 'warning' : 'good',
        icon: Zap
      },
      {
        id: 'travelTime',
        label: 'Travel Time',
        value: activeTrajectoryData.travelTime,
        unit: 'hours',
        trend: activeTrajectoryData.travelTime > 75 ? 'up' : activeTrajectoryData.travelTime < 70 ? 'down' : 'stable',
        status: activeTrajectoryData.travelTime > 90 ? 'warning' : 'good',
        icon: Clock
      },
      {
        id: 'radiation',
        label: 'Radiation Exposure',
        value: activeTrajectoryData.radiationExposure,
        unit: '%',
        trend: activeTrajectoryData.radiationExposure > 80 ? 'up' : activeTrajectoryData.radiationExposure < 30 ? 'down' : 'stable',
        status: activeTrajectoryData.radiationExposure > 85 ? 'critical' : activeTrajectoryData.radiationExposure > 60 ? 'warning' : 'good',
        icon: Shield
      },
      {
        id: 'fuel',
        label: 'Fuel Consumption',
        value: activeTrajectoryData.fuelConsumption,
        unit: 'kg',
        trend: activeTrajectoryData.fuelConsumption > 2600 ? 'up' : activeTrajectoryData.fuelConsumption < 2500 ? 'down' : 'stable',
        status: activeTrajectoryData.fuelConsumption > 3000 ? 'warning' : 'good',
        icon: Fuel
      }
    ];
    
    setMetrics(updatedMetrics);
  }, [activeTrajectory]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Minus;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-accent';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', status: 'good' | 'warning' | 'critical') => {
    if (status === 'critical') return 'text-destructive';
    if (status === 'warning') return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card className="h-full bg-card border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">DECISION METRICS</h2>
        <p className="text-xs text-muted-foreground font-mono-mission">
          Real-time trajectory analysis and optimization parameters
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            const TrendIcon = getTrendIcon(metric.trend);
            
            return (
              <div
                key={metric.id}
                className={`bg-muted/50 rounded-lg p-3 border transition-all hover:bg-muted ${
                  metric.status === 'critical' ? 'border-destructive glow-hazard' :
                  metric.status === 'warning' ? 'border-warning' :
                  'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-4 h-4 ${getStatusColor(metric.status)}`} />
                  <TrendIcon className={`w-3 h-3 ${getTrendColor(metric.trend, metric.status)}`} />
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-mono-mission text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className={`text-lg font-bold font-mono-mission ${getStatusColor(metric.status)}`}>
                    {metric.value.toLocaleString()}
                    <span className="text-xs ml-1 text-muted-foreground">
                      {metric.unit}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono-mission text-muted-foreground">Mission Progress</span>
            <span className="text-sm font-mono-mission text-primary">
              {currentMissionStats.missionElapsedTime}
            </span>
          </div>
          <Progress value={35} className="h-2" />
          <div className="flex justify-between text-xs font-mono-mission text-muted-foreground">
            <span>Launch</span>
            <span>TLI</span>
            <span>Lunar Orbit</span>
            <span>Landing</span>
          </div>
        </div>

        {/* Fuel Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono-mission text-muted-foreground">Fuel Remaining</span>
            <span className="text-sm font-mono-mission text-accent">
              {currentMissionStats.fuelRemaining}%
            </span>
          </div>
          <Progress value={currentMissionStats.fuelRemaining} className="h-2" />
          <div className="flex justify-between text-xs font-mono-mission text-muted-foreground">
            <span>0%</span>
            <span>Reserve (20%)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-muted/30 rounded p-2">
            <p className="text-xs font-mono-mission text-muted-foreground mb-1">Distance to Moon</p>
            <p className="text-sm font-mono-mission text-primary">
              {currentMissionStats.distanceToMoon.toLocaleString()} km
            </p>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <p className="text-xs font-mono-mission text-muted-foreground mb-1">Current Velocity</p>
            <p className="text-sm font-mono-mission text-primary">
              {currentMissionStats.currentVelocity} km/s
            </p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mt-4 p-3 bg-primary/10 border border-primary rounded">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <span className="text-xs font-mono-mission text-primary font-bold">
              ODIN AI RECOMMENDATION
            </span>
          </div>
          <p className="text-xs text-foreground font-mono-mission">
            Current trajectory optimal for mission parameters. Monitor solar activity for next 6 hours.
          </p>
        </div>
      </div>
    </Card>
  );
}