// Obstacle statique : rocher/corail sous-marin
// Meme logique que exercice 6 (ObstacleAvoidance) : pos + r pour collision
class Obstacle extends Vehicle {
  constructor(x, y, r) {
    super(x, y);
    this.r = r;
    // Couleur aleatoire de roche
    this.couleur1 = color(random(80, 120), random(70, 100), random(50, 80));
    this.couleur2 = color(random(60, 100), random(55, 85), random(40, 65));
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Rocher (forme irreguliere)
    fill(this.couleur1);
    stroke(0, 60);
    strokeWeight(1);
    beginShape();
    for (let a = 0; a < TWO_PI; a += PI / 4) {
      let offset = this.r * (0.8 + 0.3 * sin(a * 3.7 + this.pos.x * 0.1));
      vertex(cos(a) * offset, sin(a) * offset);
    }
    endShape(CLOSE);

    // Texture : taches plus sombres
    fill(this.couleur2);
    noStroke();
    circle(this.r * 0.15, -this.r * 0.1, this.r * 0.4);
    circle(-this.r * 0.2, this.r * 0.15, this.r * 0.3);

    // Debug : rayon de collision (comme exercice 6)
    if (Vehicle.debug) {
      noFill();
      stroke(255, 0, 0, 100);
      strokeWeight(1);
      circle(0, 0, this.r * 2);
    }
    pop();
  }

  update() {}
}
