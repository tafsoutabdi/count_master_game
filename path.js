// Chemin complexe (circuit ferme)
// Meme logique que exercice 5-3 (PathFollowingComplex)
class Path {
  constructor() {
    this.radius = 20;
    this.points = [];
  }

  addPoint(x, y) {
    let point = createVector(x, y);
    this.points.push(point);
  }

  display() {
    strokeJoin(ROUND);

    // Route semi-transparente (sable sous-marin)
    stroke(120, 140, 160, 60);
    strokeWeight(this.radius * 2);
    noFill();
    beginShape();
    for (let v of this.points) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);

    // Ligne centrale en pointilles noirs (les "petits points noirs")
    push();
    stroke(0, 150);
    strokeWeight(2);
    drawingContext.setLineDash([4, 10]);
    noFill();
    beginShape();
    for (let v of this.points) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
    drawingContext.setLineDash([]);
    pop();
  }
}
