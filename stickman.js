class Stickman extends Vehicle {
  constructor(x, y, couleur) {
    super(x, y);
    this.couleur = couleur || color(50, 180, 255);
    this.r = 10;
    this.maxSpeed = 6;
    this.maxForce = 0.4;
    this.taille = 20;
    this.alive = true;
  }

  // Meme pattern que exercice 6 : force -> mult(weight) -> applyForce
  applyBehaviours(target, stickmen, obstacles) {
    let arriveForce = this.arrive(target, 10);
    let separateForce = this.separate(stickmen);
    arriveForce.mult(1.5);
    separateForce.mult(1.0);
    this.applyForce(arriveForce);
    this.applyForce(separateForce);

    if (obstacles && obstacles.length > 0) {
      let avoidForce = this.avoid(obstacles);
      avoidForce.mult(3.0);
      this.applyForce(avoidForce);
    }
  }

  show() {
    if (!this.alive) return;

    push();
    translate(this.pos.x, this.pos.y);

    let t = this.taille;
    let headR = t * 0.3;
    let bodyH = t * 0.4;

    // Tete
    fill(this.couleur);
    stroke(0, 80);
    strokeWeight(1.5);
    circle(0, -bodyH - headR, headR * 2);

    // Corps
    stroke(this.couleur);
    strokeWeight(2.5);
    line(0, -bodyH, 0, 0);

    // Bras (animes selon la vitesse)
    let armSwing = sin(frameCount * 0.2 + this.pos.x) * 0.4;
    line(0, -bodyH * 0.7, -t * 0.35, -bodyH * 0.3 + armSwing * t * 0.2);
    line(0, -bodyH * 0.7, t * 0.35, -bodyH * 0.3 - armSwing * t * 0.2);

    // Jambes (animees)
    let legSwing = sin(frameCount * 0.2 + this.pos.x) * 0.3;
    line(0, 0, -t * 0.25, t * 0.35 + legSwing * t * 0.15);
    line(0, 0, t * 0.25, t * 0.35 - legSwing * t * 0.15);

    // Yeux
    fill(255);
    noStroke();
    circle(-headR * 0.35, -bodyH - headR, headR * 0.45);
    circle(headR * 0.35, -bodyH - headR, headR * 0.45);
    fill(0);
    circle(-headR * 0.35, -bodyH - headR, headR * 0.2);
    circle(headR * 0.35, -bodyH - headR, headR * 0.2);

    // Debug : rayon de collision
    if (Vehicle.debug) {
      noFill();
      stroke(255, 255, 0, 80);
      circle(0, -bodyH * 0.3, this.r * 2);
    }
    pop();
  }
}
