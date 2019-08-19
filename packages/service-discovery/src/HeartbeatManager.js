class HeartbeatManager {
  constructor(heartbeat, heartbeatInterval) {
    this.heartbeat = heartbeat;
    this.heartbeatInterval = heartbeatInterval;
    this.heartbeats = new Map();
  }

  start(heartbeatId) {
    const intervalId = setInterval(() => this.heartbeat(heartbeatId));
    this.heartbeats.set(heartbeatId, intervalId);
  }

  stop(heartbeatId) {
    clearInterval(this.heartbeats.get(heartbeatId));
    this.heartbeats.delete(heartbeatId);
  }

  stopEverything() {
    this.heartbeats.forEach(intervalId => clearInterval(intervalId));
    this.heartbeats.clear();
  }
}

module.exports = HeartbeatManager;
