// Leader ennemi : gros bonhomme rouge, utilise pursue (comme exercice 2)
class Shark extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.couleur = color(200, 40, 40);
    this.r = 14;
    this.maxSpeed = 3.5;
    this.maxForce = 0.15;
    this.taille = 36;
    this.alive = true;
  }

  update() {
    super.update();
  }

  show() {
    if (!this.alive) return;

    push();
    translate(this.pos.x, this.pos.y);

    let t = this.taille;
    let headR = t * 0.3;
    let bodyH = t * 0.45;

    // Tete
    fill(this.couleur);
    stroke(0, 100);
    strokeWeight(2);
    circle(0, -bodyH - headR, headR * 2);

    // Corps
    stroke(this.couleur);
    strokeWeight(3.5);
    line(0, -bodyH, 0, 0);

    // Bras (menacants, leves)
    let armSwing = sin(frameCount * 0.15) * 0.3;
    line(0, -bodyH * 0.7, -t * 0.45, -bodyH * 0.9 + armSwing * t * 0.1);
    line(0, -bodyH * 0.7, t * 0.45, -bodyH * 0.9 - armSwing * t * 0.1);

    // Jambes
    let legSwing = sin(frameCount * 0.18 + 1) * 0.3;
    line(0, 0, -t * 0.3, t * 0.4 + legSwing * t * 0.1);
    line(0, 0, t * 0.3, t * 0.4 - legSwing * t * 0.1);

    // Yeux en colere (rouges)
    fill(255);
    noStroke();
    circle(-headR * 0.4, -bodyH - headR, headR * 0.5);
    circle(headR * 0.4, -bodyH - headR, headR * 0.5);
    fill(180, 0, 0);
    circle(-headR * 0.4, -bodyH - headR, headR * 0.25);
    circle(headR * 0.4, -bodyH - headR, headR * 0.25);

    // Sourcils en colere
    stroke(0);
    strokeWeight(2);
    line(-headR * 0.7, -bodyH - headR - headR * 0.5,
         -headR * 0.1, -bodyH - headR - headR * 0.2);
    line(headR * 0.7, -bodyH - headR - headR * 0.5,
         headR * 0.1, -bodyH - headR - headR * 0.2);

    // Bouche mecontente
    noFill();
    stroke(0);
    strokeWeight(1.5);
    arc(0, -bodyH - headR + headR * 0.45, headR * 0.8, headR * 0.4, PI, TWO_PI);

    // Debug
    if (Vehicle.debug) {
      noFill();
      stroke(255, 0, 0, 80);
      circle(0, -bodyH * 0.3, this.r * 2);
    }
    pop();
  }
}
