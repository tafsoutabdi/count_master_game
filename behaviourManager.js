class BehaviourManager {
  constructor(vehicle) {
    this.vehicle = vehicle;
    this.behaviors = [];
  }

  addBehavior(name, fn, weight = 1.0) {
    this.behaviors.push({ name, fn, weight });
  }

  applyAll() {
    for (let b of this.behaviors) {
      let force = b.fn();
      force.mult(b.weight);
      this.vehicle.applyForce(force);
    }
  }
}
