// Escouade d'ennemis : 1 leader (gros bonhomme) + bonhommes rouges followers
// Pattern identique a exercice 2 (pursue) + exercice 6 (avoid)
// Meurt apres 10 secondes s'il n'a pas attrape le joueur
class EnemySquad extends Vehicle {
  constructor(x, y, size, playerGroup) {
    super(x, y);
    this.members = [];
    this.playerGroup = playerGroup;
    this.alive = true;

    // Duree de vie : 10 secondes (600 frames a 60fps)
    this.lifetime = 600;
    this.spawnFrame = frameCount;

    // Leader = gros bonhomme rouge
    let shark = new Shark(x, y);
    this.members.push(shark);

    // Followers = poissons rouges
    let couleurEnnemie = color(220, 50, 50);
    for (let i = 1; i < size; i++) {
      let s = new Stickman(
        x + random(-20, 20),
        y + random(-20, 20),
        couleurEnnemie
      );
      s.maxSpeed = 3;
      s.maxForce = 0.15;
      this.members.push(s);
    }
  }

  get leader() { return this.members[0]; }
  get count() { return this.members.length; }
  get age() { return frameCount - this.spawnFrame; }
  get expired() { return this.age >= this.lifetime; }

  // Pattern : force -> mult(weight) -> applyForce -> update
  move(obstacles) {
    if (this.expired) {
      this.alive = false;
      this.members = [];
      return;
    }
    if (this.members.length === 0 || !this.playerGroup.leader) return;

    let target = this.playerGroup.leader;

    // Leader (requin) : pursue le joueur + avoid obstacles
    // Meme pattern que exercice 2 PursueEvade
    let pursueForce = this.leader.pursue(target);
    pursueForce.mult(1.0);
    this.leader.applyForce(pursueForce);

    if (obstacles && obstacles.length > 0) {
      let avoidForce = this.leader.avoid(obstacles);
      avoidForce.mult(3.0);
      this.leader.applyForce(avoidForce);
    }
    this.leader.update();

    // Followers : arrive vers leader + separate + avoid
    // Meme pattern que exercice 3 (arrival) + exercice 6 (avoid)
    for (let i = 1; i < this.members.length; i++) {
      this.members[i].applyBehaviours(this.leader.pos, this.members, obstacles);
      this.members[i].update();
    }
  }

  // Collision : si un membre touche le joueur, on deduit squad.count
  checkCollision(playerGroup) {
    if (this.members.length === 0 || playerGroup.stickmen.length === 0) return false;

    for (let s of this.members) {
      for (let p of playerGroup.stickmen) {
        let d = p5.Vector.dist(s.pos, p.pos);
        if (d < s.r + p.r + 5) {
          playerGroup.removeStickmen(this.count);
          this.alive = false;
          this.members = [];
          return true;
        }
      }
    }
    return false;
  }

  show() {
    // Followers d'abord
    for (let i = this.members.length - 1; i >= 1; i--) {
      this.members[i].show();
    }
    // Leader (requin) en dernier
    if (this.leader) {
      this.leader.show();
    }

    // Badge du count + timer
    if (this.leader) {
      push();
      fill(220, 50, 50);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(14);
      textStyle(BOLD);
      if (this.count > 1) {
        text(this.count, this.leader.pos.x, this.leader.pos.y - 30);
      }

      // Barre de temps restant (rouge -> disparait)
      let pct = 1 - this.age / this.lifetime;
      let barW = 30 * pct;
      // Clignote dans les 3 dernieres secondes
      let remaining = this.lifetime - this.age;
      let alpha = remaining < 180 ? (sin(frameCount * 0.3) * 0.5 + 0.5) * 255 : 200;
      fill(220, 50, 50, alpha);
      rectMode(CENTER);
      rect(this.leader.pos.x, this.leader.pos.y - 40, barW, 4, 2);
      pop();
    }
  }
}
