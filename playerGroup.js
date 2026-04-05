class PlayerGroup extends Vehicle {
  constructor(x, y, count) {
    super(x, y);
    this.stickmen = [];
    this.couleur = color(50, 180, 255);

    for (let i = 0; i < count; i++) {
      let s = new Stickman(
        x + random(-30, 30),
        y + random(-30, 30),
        this.couleur
      );
      this.stickmen.push(s);
    }
  }

  get leader() { return this.stickmen[0]; }
  get count() { return this.stickmen.length; }

  addStickmen(n) {
    if (!this.leader) return;
    for (let i = 0; i < n; i++) {
      let s = new Stickman(
        this.leader.pos.x + random(-40, 40),
        this.leader.pos.y + random(-40, 40),
        this.couleur
      );
      this.stickmen.push(s);
    }
  }

  removeStickmen(n) {
    for (let i = 0; i < n && this.stickmen.length > 0; i++) {
      this.stickmen.pop();
    }
  }

  setCount(newCount) {
    if (newCount > this.count) {
      this.addStickmen(newCount - this.count);
    } else if (newCount < this.count) {
      this.removeStickmen(this.count - newCount);
    }
  }

  checkGates(gates) {
    for (let gate of gates) {
      if (!gate.used && gate.collidesWithAny(this.stickmen)) {
        let newCount = gate.apply(this.count);
        this.setCount(newCount);
        gate.used = true;
      }
    }
  }

  move(target, obstacles) {
    if (this.stickmen.length === 0) return;

    // Leader suit la souris + evite les obstacles
    let arriveForce = this.leader.arrive(target);
    this.leader.applyForce(arriveForce);
    if (obstacles && obstacles.length > 0) {
      let avoidForce = this.leader.avoid(obstacles);
      avoidForce.mult(3.0);
      this.leader.applyForce(avoidForce);
    }
    this.leader.update();

    // Followers : arrive vers leader + separate + avoid obstacles
    for (let i = 1; i < this.stickmen.length; i++) {
      this.stickmen[i].applyBehaviours(this.leader.pos, this.stickmen, obstacles);
      this.stickmen[i].update();
    }
  }

  show() {
    if (this.stickmen.length === 0) return;

    // Followers d'abord
    for (let i = this.stickmen.length - 1; i >= 1; i--) {
      this.stickmen[i].show();
    }
    // Leader : bonhomme dore, plus grand
    this.leader.couleur = color(255, 200, 50);
    this.leader.taille = 28;
    this.leader.show();

    // Badge du count au-dessus du leader
    push();
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text(this.count, this.leader.pos.x, this.leader.pos.y - 30);
    pop();
  }
}
