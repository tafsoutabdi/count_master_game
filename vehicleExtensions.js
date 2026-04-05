// Extensions de Vehicle.prototype
// Ajoute drawVector, separate(), avoid() et follow() a Vehicle sans modifier vehicle.js
// Toutes les sous-classes (extends Vehicle) en heritent automatiquement

// Projection orthogonale du point p sur le segment a-b
// Meme fonction que exercice 5-2/5-3 (PathFollowing)
function findProjection(p, a, b) {
  let ap = p5.Vector.sub(p, a);
  let ab = p5.Vector.sub(b, a);
  ab.normalize();
  ab.mult(ap.dot(ab));
  let normalPoint = p5.Vector.add(a, ab);
  return normalPoint;
}

Vehicle.prototype.largeurZoneEvitement = 20;

// Dessine un vecteur (fleche) depuis une position donnee
// Meme methode que dans exercice 6
Vehicle.prototype.drawVector = function(pos, v, col) {
  push();
  strokeWeight(3);
  stroke(col);
  line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
  // petite fleche au bout
  let arrowSize = 5;
  translate(pos.x + v.x, pos.y + v.y);
  rotate(v.heading());
  translate(-arrowSize / 2, 0);
  fill(col);
  noStroke();
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
};

// Recherche l'obstacle le plus proche
// Meme methode que dans exercice 6
Vehicle.prototype.getObstacleLePlusProche = function(obstacles) {
  let plusPetiteDistance = Infinity;
  let obstacleLePlusProche = undefined;

  for (let o of obstacles) {
    let distance = this.pos.dist(o.pos);
    if (distance < plusPetiteDistance) {
      plusPetiteDistance = distance;
      obstacleLePlusProche = o;
    }
  }

  return obstacleLePlusProche;
};

// Separation entre vehicules voisins
Vehicle.prototype.separate = function(vehicles) {
  let desiredSeparation = this.r * 2;
  let steer = createVector(0, 0);
  let count = 0;

  for (let other of vehicles) {
    let d = p5.Vector.dist(this.pos, other.pos);
    if (d > 0 && d < desiredSeparation) {
      let diff = p5.Vector.sub(this.pos, other.pos);
      diff.normalize();
      diff.div(d);
      steer.add(diff);
      count++;
    }
  }

  if (count > 0) steer.div(count);

  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.vel);
    steer.limit(this.maxForce);
  }

  // Debug : dessiner les liens de repulsion
  if (Vehicle.debug && count > 0) {
    push();
    stroke(255, 100, 100, 120);
    strokeWeight(1);
    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < desiredSeparation) {
        line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      }
    }
    pop();
  }

  return steer;
};

// Evitement d'obstacles
// Meme logique que exercice 6 : ahead, ahead2, zone d'evitement, drawVector
Vehicle.prototype.avoid = function(obstacles) {
  if (obstacles.length === 0) return createVector(0, 0);

  // Vecteur ahead devant le vehicule (30 frames)
  let ahead = this.vel.copy();
  ahead.mult(30);
  let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);

  // ahead2 deux fois plus petit (15 frames)
  let ahead2 = this.vel.copy();
  ahead2.mult(15);
  let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);

  if (Vehicle.debug) {
    // Dessiner le vecteur ahead en jaune
    this.drawVector(this.pos, ahead, color(255, 255, 0));

    // Dessiner le vecteur ahead2 en violet
    this.drawVector(this.pos, ahead2, color(180, 0, 255));

    // Point rouge au bout de ahead
    push();
    fill("red");
    noStroke();
    circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
    pop();

    // Point bleu au bout de ahead2
    push();
    fill("lightblue");
    noStroke();
    circle(pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y, 10);
    pop();

    // Zone d'evitement : ligne large semi-transparente (l'arc)
    push();
    stroke(255, 50);
    strokeWeight(this.largeurZoneEvitement * 2);
    line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
    pop();
  }

  // Chercher l'obstacle le plus proche
  let closest = this.getObstacleLePlusProche(obstacles);
  if (!closest) return createVector(0, 0);

  // Distances entre l'obstacle et les 3 points (ahead, ahead2, pos)
  let d1 = closest.pos.dist(pointAuBoutDeAhead);
  let d2 = closest.pos.dist(pointAuBoutDeAhead2);
  let d3 = closest.pos.dist(this.pos);
  let bestDist = d1;
  let bestPoint = pointAuBoutDeAhead;

  if (d2 < bestDist) { bestDist = d2; bestPoint = pointAuBoutDeAhead2; }
  if (d3 < bestDist) { bestDist = d3; bestPoint = this.pos; }

  if (bestDist < closest.r + this.largeurZoneEvitement) {
    // Force d'evitement : du centre de l'obstacle vers le point le plus proche
    let force = p5.Vector.sub(bestPoint, closest.pos);

    // Debug : dessiner la force d'evitement en jaune depuis l'obstacle
    if (Vehicle.debug) {
      this.drawVector(closest.pos, force, color(255, 255, 0));
    }

    force.setMag(this.maxSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);

    return force;
  }

  return createVector(0, 0);
};

// Suivi de chemin complexe (circuit ferme)
// Meme logique que exercice 5-3 (PathFollowingComplex)
// http://www.red3d.com/cwr/steer/PathFollow.html
Vehicle.prototype.follow = function(path) {
  // Position du vehicule dans 25 frames
  let predict = this.vel.copy();
  predict.normalize();
  predict.mult(25);
  let predictpos = p5.Vector.add(this.pos, predict);

  let normal = null;
  let target = null;
  let worldRecord = 1000000;

  // On parcourt les segments du chemin
  for (let i = 0; i < path.points.length; i++) {
    let a = path.points[i];
    let b = path.points[(i + 1) % path.points.length];

    // Projection sur le segment
    let normalPoint = findProjection(predictpos, a, b);

    // Cas ou le point projete est en dehors du segment
    let dir = p5.Vector.sub(b, a);
    if (
      normalPoint.x < min(a.x, b.x) ||
      normalPoint.x > max(a.x, b.x) ||
      normalPoint.y < min(a.y, b.y) ||
      normalPoint.y > max(a.y, b.y)
    ) {
      normalPoint = b.copy();
      a = path.points[(i + 1) % path.points.length];
      b = path.points[(i + 2) % path.points.length];
      dir = p5.Vector.sub(b, a);
    }

    let d = p5.Vector.dist(predictpos, normalPoint);
    if (d < worldRecord) {
      worldRecord = d;
      normal = normalPoint;

      dir.normalize();
      dir.mult(25);
      target = normal.copy();
      target.add(dir);
    }
  }

  // Debug : dessiner la prediction et la projection
  if (Vehicle.debug && normal && target) {
    push();
    stroke(0);
    fill(0);
    line(this.pos.x, this.pos.y, predictpos.x, predictpos.y);
    ellipse(predictpos.x, predictpos.y, 4, 4);
    ellipse(normal.x, normal.y, 4, 4);
    line(predictpos.x, predictpos.y, target.x, target.y);
    if (worldRecord > path.radius) fill(255, 0, 0);
    noStroke();
    ellipse(target.x, target.y, 8, 8);
    pop();
  }

  if (worldRecord > path.radius) {
    return this.seek(target);
  } else {
    return createVector(0, 0);
  }
};
