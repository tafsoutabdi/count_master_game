// Trancheuse : obstacle mortel rotatif
// Si le joueur la touche -> game over
// Utilise pos + r pour collision (meme logique que exercice 6)
class Trancheuse extends Vehicle {
  constructor(x, y, r) {
    super(x, y);
    this.r = r || 30;
    this.angle = 0;
    this.rotationSpeed = 0.06;
    this.nbLames = 4;
  }

  update() {
    this.angle += this.rotationSpeed;
  }

  // Verifie si un stickman touche la trancheuse
  collidesWithAny(stickmen) {
    for (let s of stickmen) {
      let d = p5.Vector.dist(this.pos, s.pos);
      if (d < this.r + s.r) {
        return true;
      }
    }
    return false;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Socle central
    fill(80);
    stroke(40);
    strokeWeight(2);
    circle(0, 0, this.r * 0.4);

    // Lames rotatives
    rotate(this.angle);
    for (let i = 0; i < this.nbLames; i++) {
      let a = (TWO_PI / this.nbLames) * i;
      push();
      rotate(a);

      // Lame (forme triangulaire allongee)
      fill(180, 180, 190);
      stroke(100);
      strokeWeight(1);
      beginShape();
      vertex(this.r * 0.15, -3);
      vertex(this.r, -1);
      vertex(this.r * 1.05, 0);
      vertex(this.r, 1);
      vertex(this.r * 0.15, 3);
      endShape(CLOSE);

      // Dents sur la lame
      fill(160, 160, 170);
      noStroke();
      for (let j = 0; j < 4; j++) {
        let tx = this.r * (0.3 + j * 0.17);
        triangle(tx, -4, tx + 4, 0, tx, 4);
      }
      pop();
    }

    // Boulon central
    fill(60);
    noStroke();
    circle(0, 0, this.r * 0.15);
    fill(100);
    circle(0, 0, this.r * 0.08);

    pop();

    // Zone de danger (cercle rouge semi-transparent)
    push();
    noFill();
    stroke(255, 0, 0, 40);
    strokeWeight(2);
    drawingContext.setLineDash([4, 6]);
    circle(this.pos.x, this.pos.y, (this.r + 5) * 2);
    drawingContext.setLineDash([]);
    pop();

    // Debug : rayon de collision
    if (Vehicle.debug) {
      push();
      noFill();
      stroke(255, 0, 0, 150);
      strokeWeight(1);
      circle(this.pos.x, this.pos.y, this.r * 2);
      pop();
    }
  }
}
