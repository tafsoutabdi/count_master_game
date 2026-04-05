class Verseau extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D().mult(2);
    this.maxSpeed = 2.0;
    this.maxForce = 0.08;
    this.r = 16;
    this.distanceCercle = 80;
    this.wanderRadius = 30;
    this.displaceRange = 0.3;
    this.largeurZoneEvitement = 25;

    this.bm = new BehaviourManager(this);

    // Couleurs bleu-vert aquatiques
    this.couleur = color(random(80, 150), random(180, 230), random(220, 255), 200);

    this.trail = [];
    this.trailMax = 20;
    this.wavePhase = random(TWO_PI);
  }

  initBehaviours(obstacles) {
    this.bm.addBehavior('wander', () => this.wander(), 1.0);
    this.bm.addBehavior('boundaries', () => this.boundaries(0, 0, width, height, 40), 3.0);
    this.bm.addBehavior('avoid', () => this.avoid(obstacles), 2.5);
  }

  applyBehaviours() {
    this.bm.applyAll();
  }

  update() {
    super.update();
    this.wavePhase += 0.05;
    if (frameCount % 3 === 0) {
      this.trail.push(this.pos.copy());
      if (this.trail.length > this.trailMax) this.trail.shift();
    }
  }

  show() {
    // Trainee aquatique
    push();
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 20, 100);
      let c = color(red(this.couleur), green(this.couleur), blue(this.couleur), alpha);
      fill(c);
      let sz = map(i, 0, this.trail.length, 2, 6);
      let waveOffset = sin(this.wavePhase + i * 0.3) * 3;
      circle(this.trail[i].x, this.trail[i].y + waveOffset, sz);
    }
    pop();

    // Corps du verseau
    push();
    translate(this.pos.x, this.pos.y);
    if (this.vel.mag() > 0.1) rotate(this.vel.heading());

    fill(this.couleur);
    stroke(0, 80);
    strokeWeight(1);
    beginShape();
    vertex(this.r, 0);
    vertex(0, -this.r * 0.5);
    vertex(-this.r * 0.8, -this.r * 0.3);
    vertex(-this.r, 0);
    vertex(-this.r * 0.8, this.r * 0.3);
    vertex(0, this.r * 0.5);
    endShape(CLOSE);

    // Vagues animees
    noFill();
    stroke(100, 200, 255, 200);
    strokeWeight(2);
    let waveY1 = sin(this.wavePhase) * 2;
    let waveY2 = sin(this.wavePhase + 1) * 2;
    line(-this.r * 0.3, -this.r * 0.15 + waveY1,
          this.r * 0.3, -this.r * 0.15 + waveY2);
    line(-this.r * 0.3,  this.r * 0.15 + waveY2,
          this.r * 0.3,  this.r * 0.15 + waveY1);

    // Oeil
    fill(180, 230, 255, 220);
    noStroke();
    ellipse(this.r * 0.1, 0, this.r * 0.3, this.r * 0.25);
    pop();
  }
}
