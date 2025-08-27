import { Trajectory, Hazard, MissionLog } from "@/data/missionData";

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number; // mission time in hours
  timeScale: number; // simulation speed multiplier
  currentPosition: { x: number; y: number; z: number };
  currentVelocity: number;
  fuelRemaining: number;
  activeHazards: Hazard[];
  currentPhase: string;
  trajectory: Trajectory;
}

export interface LiveMetrics {
  deltaV: number;
  travelTime: number;
  radiationExposure: number;
  fuelConsumption: number;
  distanceToMoon: number;
  currentVelocity: number;
  systemsStatus: "Green" | "Yellow" | "Red";
  hazardLevel: "Nominal" | "Warning" | "Critical";
}

export class SimulationEngine {
  private state: SimulationState;
  private listeners: Set<
    (state: SimulationState, metrics: LiveMetrics) => void
  > = new Set();
  private animationFrame: number | null = null;
  private lastUpdateTime = 0;

  constructor(initialTrajectory: Trajectory) {
    this.state = {
      isRunning: false,
      isPaused: false,
      currentTime: 0,
      timeScale: 1.0,
      currentPosition: { x: 0, y: 0, z: 0 },
      currentVelocity: 0,
      fuelRemaining: 100,
      activeHazards: [],
      currentPhase: "Pre-Launch",
      trajectory: initialTrajectory,
    };
  }

  subscribe(callback: (state: SimulationState, metrics: LiveMetrics) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    const metrics = this.calculateLiveMetrics();
    this.listeners.forEach((callback) => callback(this.state, metrics));
  }

  private calculateLiveMetrics(): LiveMetrics {
    const progress = Math.min(
      this.state.currentTime / this.state.trajectory.travelTime,
      1
    );
    const baseDistance = 384400; // Earth-Moon distance in km
    const distanceToMoon = baseDistance * (1 - progress);

    // Calculate dynamic values based on hazards and trajectory
    let radiationMultiplier = 1;
    let deltaVPenalty = 0;
    let systemsStatus: "Green" | "Yellow" | "Red" = "Green";
    let hazardLevel: "Nominal" | "Warning" | "Critical" = "Nominal";

    // Factor in active hazards
    this.state.activeHazards.forEach((hazard) => {
      switch (hazard.severity) {
        case "Critical":
          radiationMultiplier *= 1.5;
          deltaVPenalty += 200;
          systemsStatus = "Red";
          hazardLevel = "Critical";
          break;
        case "High":
          radiationMultiplier *= 1.3;
          deltaVPenalty += 150;
          if (systemsStatus !== "Red") systemsStatus = "Yellow";
          if (hazardLevel !== "Critical") hazardLevel = "Warning";
          break;
        case "Medium":
          radiationMultiplier *= 1.2;
          deltaVPenalty += 100;
          if (systemsStatus === "Green") systemsStatus = "Yellow";
          if (hazardLevel === "Nominal") hazardLevel = "Warning";
          break;
        case "Low":
          radiationMultiplier *= 1.1;
          deltaVPenalty += 50;
          break;
      }
    });

    return {
      deltaV: this.state.trajectory.deltaV + deltaVPenalty,
      travelTime: this.state.trajectory.travelTime,
      radiationExposure: Math.min(
        this.state.trajectory.radiationExposure * radiationMultiplier,
        100
      ),
      fuelConsumption:
        this.state.trajectory.fuelConsumption + deltaVPenalty * 0.8,
      distanceToMoon,
      currentVelocity: this.state.currentVelocity,
      systemsStatus,
      hazardLevel,
    };
  }

  private updatePhase() {
    const progress = this.state.currentTime / this.state.trajectory.travelTime;

    if (progress < 0.1) {
      this.state.currentPhase = "Launch Phase";
    } else if (progress < 0.3) {
      this.state.currentPhase = "Earth Departure";
    } else if (progress < 0.7) {
      this.state.currentPhase = "Trans-Lunar Injection";
    } else if (progress < 0.9) {
      this.state.currentPhase = "Lunar Approach";
    } else {
      this.state.currentPhase = "Lunar Orbit Insertion";
    }
  }

  private updatePosition() {
    const progress = Math.min(
      this.state.currentTime / this.state.trajectory.travelTime,
      1
    );
    const points = this.state.trajectory.points;

    if (points.length < 2) return;

    const segmentIndex = Math.floor(progress * (points.length - 1));
    const nextIndex = Math.min(segmentIndex + 1, points.length - 1);
    const segmentProgress = progress * (points.length - 1) - segmentIndex;

    const current = points[segmentIndex];
    const next = points[nextIndex];

    this.state.currentPosition = {
      x: current.x + (next.x - current.x) * segmentProgress,
      y: current.y + (next.y - current.y) * segmentProgress,
      z: current.z + (next.z - current.z) * segmentProgress,
    };

    // Calculate velocity based on position change
    const distance = Math.sqrt(
      Math.pow(next.x - current.x, 2) +
        Math.pow(next.y - current.y, 2) +
        Math.pow(next.z - current.z, 2)
    );
    this.state.currentVelocity =
      (distance / (this.state.trajectory.travelTime / points.length)) * 1000;
  }

  private updateFuel() {
    const progress = this.state.currentTime / this.state.trajectory.travelTime;
    const baseFuelConsumption = progress * 0.3; // 30% of fuel for normal operations
    const hazardPenalty = this.state.activeHazards.length * 0.05; // 5% penalty per hazard

    this.state.fuelRemaining = Math.max(
      0,
      100 - (baseFuelConsumption + hazardPenalty) * 100
    );
  }

  private animate = (currentTime: number) => {
    if (!this.state.isRunning || this.state.isPaused) {
      this.animationFrame = null;
      return;
    }

    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Update simulation time (1 real second = timeScale simulation hours)
    this.state.currentTime += (deltaTime / 1000) * this.state.timeScale;

    // Update mission state
    this.updatePhase();
    this.updatePosition();
    this.updateFuel();

    // Check if mission is complete
    if (this.state.currentTime >= this.state.trajectory.travelTime) {
      this.state.currentTime = this.state.trajectory.travelTime;
      this.state.currentPhase = "Mission Complete";
      this.pause();
    }

    this.notifyListeners();
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  start() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.lastUpdateTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.animate);
    this.notifyListeners();
  }

  pause() {
    this.state.isPaused = true;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.notifyListeners();
  }

  resume() {
    if (!this.state.isRunning) return;

    this.state.isPaused = false;
    this.lastUpdateTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.animate);
    this.notifyListeners();
  }

  reset() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.currentTime = 0;
    this.state.currentPosition = { x: 0, y: 0, z: 0 };
    this.state.currentVelocity = 0;
    this.state.fuelRemaining = 100;
    this.state.activeHazards = [];
    this.state.currentPhase = "Pre-Launch";

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.notifyListeners();
  }

  setTrajectory(trajectory: Trajectory) {
    this.state.trajectory = trajectory;
    // Reset position when trajectory changes
    this.updatePosition();
    this.notifyListeners();
  }

  addHazard(hazard: Hazard) {
    this.state.activeHazards.push(hazard);
    this.notifyListeners();
  }

  removeHazard(hazardId: string) {
    this.state.activeHazards = this.state.activeHazards.filter(
      (h) => h.id !== hazardId
    );
    this.notifyListeners();
  }

  setTimeScale(scale: number) {
    this.state.timeScale = Math.max(0.1, Math.min(10, scale));
    this.notifyListeners();
  }

  getState(): SimulationState {
    return { ...this.state };
  }

  getMetrics(): LiveMetrics {
    return this.calculateLiveMetrics();
  }
}
