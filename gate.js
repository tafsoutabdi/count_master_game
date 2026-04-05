class Gate extends Vehicle {
  constructor(x, y, operation, value) {
    super(x, y);
    this.operation = operation;   // '+' ou '*' seulement
    this.value = value;
    this.w = 80;
    this.h = 50;
    this.r = 40;
    this.used = false;
    this.maxSpeed = 0;
    this.maxForce = 0;
    this.vel = createVector(0, 0);

    // Disparait apres 3 secondes (180 frames a 60fps)
    this.lifetime = 180;
    this.spawnFrame = frameCount;
    this.alpha = 255;
  }

  get age() {
    return frameCount - this.spawnFrame;
  }

  get expired() {
    return this.age >= this.lifetime;
  }

  apply(count) {
    switch (this.operation) {
      case '+': return Math.min(count + this.value, 80);
      case '*': return Math.min(count * this.value, 80);
    }
    return count;
  }

  collidesWithAny(stickmen) {
    if (this.used) return false;
    for (let s of stickmen) {
      if (p5.Vector.dist(this.pos, s.pos) < this.r + s.r) {
        return true;
      }
    }
    return false;
  }

  update() {
    // Fade out dans la derniere seconde (60 dernieres frames)
    let remaining = this.lifetime - this.age;
    if (remaining < 60) {
      this.alpha = map(remaining, 60, 0, 255, 0);
    }
  }

  show() {
    if (this.used) return;

    push();
    rectMode(CENTER);
    let g = color(30, 180, 60, this.alpha);
    let gs = color(20, 140, 40, this.alpha);
    fill(g);
    stroke(gs);
    strokeWeight(3);
    rect(this.pos.x, this.pos.y, this.w, this.h, 10);

    // Texte de l'operation
    fill(255, 255, 255, this.alpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    text(this.operation + this.value, this.pos.x, this.pos.y);

    // Barre de temps restant
    let pct = 1 - this.age / this.lifetime;
    let barW = this.w * pct;
    noStroke();
    fill(255, 255, 255, this.alpha * 0.5);
    rectMode(CORNER);
    rect(this.pos.x - this.w / 2, this.pos.y + this.h / 2 + 4, barW, 4, 2);

    // Debug : cercle de collision
    if (Vehicle.debug) {
      noFill();
      stroke(255, 255, 0, 100);
      circle(this.pos.x, this.pos.y, this.r * 2);

      fill(255, 255, 0);
      noStroke();
      textSize(10);
      text(ceil((this.lifetime - this.age) / 60) + "s", this.pos.x, this.pos.y - this.h / 2 - 10);
    }
    pop();
  }
}
