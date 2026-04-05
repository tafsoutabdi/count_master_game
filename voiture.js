// Voiture : sous-classe de Vehicle qui suit un circuit (Path)
// Meme logique que exercice 5-3 (PathFollowingComplex)
// Utilise BehaviourManager avec follow + avoid + separate
class Voiture extends Vehicle {
  constructor(x, y, path, obstacles) {
    super(x, y);
    this.vel = p5.Vector.random2D().mult(2);
    this.maxSpeed = random(2, 3.5);
    this.maxForce = 0.15;
    this.r = 10;
    this.largeurZoneEvitement = 15;

    this.path = path;
    this.couleur = color(random(180, 255), random(100, 180), random(50, 100));
    this.taille = 16;

    // Trainee de points noirs (comme dans les exercices du prof)
    this.trail = [];
    this.trailMax = 25;

    this.bm = new BehaviourManager(this);
    this.bm.addBehavior('follow', () => this.follow(this.path), 2.0);
    this.bm.addBehavior('avoid', () => this.avoid(obstacles), 3.0);
  }

  applyBehaviours() {
    this.bm.applyAll();
  }

  update() {
    super.update();
    // Mise a jour de la trainee
    if (frameCount % 3 === 0) {
      this.trail.push(this.pos.copy());
      if (this.trail.length > this.trailMax) this.trail.shift();
    }
  }

  show() {
    // Trainee de petits points noirs
    push();
    fill(0, 180);
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      let sz = map(i, 0, this.trail.length, 1, 3);
      circle(this.trail[i].x, this.trail[i].y, sz);
    }
    pop();

    // Corps de la voiture (tortue marine)
    push();
    translate(this.pos.x, this.pos.y);
    if (this.vel.mag() > 0.1) rotate(this.vel.heading());

    let t = this.taille;

    // Carapace
    fill(this.couleur);
    stroke(0, 80);
    strokeWeight(1);
    ellipse(0, 0, t * 1.3, t * 0.9);

    // Motifs sur la carapace
    fill(0, 30);
    noStroke();
    ellipse(t * 0.1, 0, t * 0.4, t * 0.3);
    ellipse(-t * 0.2, t * 0.1, t * 0.25, t * 0.2);

    // Tete
    fill(this.couleur);
    stroke(0, 60);
    strokeWeight(0.5);
    ellipse(t * 0.6, 0, t * 0.4, t * 0.3);

    // Oeil
    fill(0);
    noStroke();
    circle(t * 0.7, -t * 0.05, t * 0.08);

    // Nageoires
    fill(this.couleur);
    stroke(0, 40);
    strokeWeight(0.5);
    // avant
    triangle(t * 0.2, -t * 0.45, t * 0.5, -t * 0.6, t * 0.1, -t * 0.2);
    triangle(t * 0.2, t * 0.45, t * 0.5, t * 0.6, t * 0.1, t * 0.2);
    // arriere
    triangle(-t * 0.4, -t * 0.35, -t * 0.6, -t * 0.4, -t * 0.3, -t * 0.15);
    triangle(-t * 0.4, t * 0.35, -t * 0.6, t * 0.4, -t * 0.3, t * 0.15);

    // Debug
    if (Vehicle.debug) {
      noFill();
      stroke(0, 255, 0, 100);
      circle(0, 0, this.r * 2);
    }
    pop();
  }
}
