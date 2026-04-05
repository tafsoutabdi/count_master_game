// Gere toutes les escouades d'ennemis
class EnemyGroup extends Vehicle {
  constructor(nbSquads, playerGroup) {
    super(0, 0);
    this.squads = [];
    this.playerGroup = playerGroup;

    for (let i = 0; i < nbSquads; i++) {
      this.spawnSquad();
    }
  }

  get count() { return this.squads.length; }

  // Nombre total de stickmen ennemis
  get totalEnemies() {
    let total = 0;
    for (let sq of this.squads) total += sq.count;
    return total;
  }

  spawnSquad() {
    // Spawn sur les bords du canvas
    let side = floor(random(4));
    let x, y;
    switch (side) {
      case 0: x = random(width); y = -40; break;
      case 1: x = random(width); y = height + 40; break;
      case 2: x = -40; y = random(height); break;
      case 3: x = width + 40; y = random(height); break;
    }

    // Taille adaptee au nombre de joueurs
    let playerCount = this.playerGroup.count || 1;
    let minSize, maxSize;
    if (playerCount <= 5) {
      minSize = 1; maxSize = 3;
    } else if (playerCount <= 15) {
      minSize = 2; maxSize = 5;
    } else if (playerCount <= 30) {
      minSize = 3; maxSize = 7;
    } else {
      minSize = 4; maxSize = 10;
    }
    let size = floor(random(minSize, maxSize + 1));
    let sq = new EnemySquad(x, y, size, this.playerGroup);
    this.squads.push(sq);
  }

  move(obstacles) {
    for (let sq of this.squads) {
      sq.move(obstacles);
    }
  }

  checkCollisions(playerGroup) {
    for (let i = this.squads.length - 1; i >= 0; i--) {
      // Supprimer les escouades expirees (10s timeout)
      if (this.squads[i].expired || !this.squads[i].alive) {
        this.squads.splice(i, 1);
        continue;
      }
      if (this.squads[i].checkCollision(playerGroup)) {
        this.squads.splice(i, 1);
      }
    }
  }

  show() {
    for (let sq of this.squads) {
      sq.show();
    }

    if (Vehicle.debug) {
      push();
      fill(220, 40, 40);
      noStroke();
      textAlign(LEFT, TOP);
      textSize(12);
      text("Squads: " + this.count + " (" + this.totalEnemies + " ennemis)", 10, 50);
      pop();
    }
  }
}
