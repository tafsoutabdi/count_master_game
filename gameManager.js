class GameManager {
  constructor() {
    this.score = 0;
    this.bestScore = 0;
    this.gameOver = false;
    this.gateSpawnInterval = 180; // ~3 secondes a 60fps
    this.gateSpawnTimer = 0;
    this.enemySpawnInterval = 300; // ~5 secondes
    this.enemySpawnTimer = 0;

    // Sliders (crees dans initSliders)
    this.sliders = {};
    this.labels = {};
  }

  initSliders() {
    let x = 15;
    let y = height - 30;

    // Slider : nombre initial de joueurs
    this.sliders.playerCount = createSlider(1, 30, 10, 1);
    this.sliders.playerCount.position(x + 130, y);
    this.sliders.playerCount.size(100);
    this.labels.playerCount = this.createLabel("Joueurs:", x, y);

    // Slider : nombre d'escouades ennemies
    this.sliders.enemyCount = createSlider(0, 10, 3, 1);
    this.sliders.enemyCount.position(x + 400, y);
    this.sliders.enemyCount.size(100);
    this.labels.enemyCount = this.createLabel("Escouades:", x + 270, y);
  }

  createLabel(text, x, y) {
    let label = createDiv(text);
    label.position(x, y + 2);
    label.style("color", "white");
    label.style("font-size", "13px");
    label.style("font-family", "monospace");
    return label;
  }

  removeSliders() {
    for (let key in this.sliders) {
      this.sliders[key].remove();
    }
    for (let key in this.labels) {
      this.labels[key].remove();
    }
    this.sliders = {};
    this.labels = {};
  }

  getSliderValues() {
    return {
      playerCount: this.sliders.playerCount ? this.sliders.playerCount.value() : 10,
      enemyCount: this.sliders.enemyCount ? this.sliders.enemyCount.value() : 5
    };
  }

  update(playerGroup, gates, obstacles, enemyGroup, trancheuses) {
    this.score = playerGroup.count;
    if (this.score > this.bestScore) this.bestScore = this.score;

    let sv = this.getSliderValues();

    // Ajuster le nombre d'escouades ennemies selon le slider
    if (enemyGroup.count < sv.enemyCount) {
      this.enemySpawnTimer++;
      if (this.enemySpawnTimer >= 120) { // nouvelle escouade toutes les 2s
        this.enemySpawnTimer = 0;
        enemyGroup.spawnSquad();
      }
    }

    // Spawn automatique de gates (+ et * seulement)
    this.gateSpawnTimer++;
    if (this.gateSpawnTimer >= this.gateSpawnInterval) {
      this.gateSpawnTimer = 0;
      this.spawnGate(gates, sv);
    }

    // Mise a jour et nettoyage des gates
    for (let i = gates.length - 1; i >= 0; i--) {
      gates[i].update();
      if (gates[i].expired || gates[i].used) {
        gates.splice(i, 1);
      }
    }

    // Collision joueur avec gates
    playerGroup.checkGates(gates);

    // Collision ennemis avec joueur
    enemyGroup.checkCollisions(playerGroup);

    // Collision joueur avec trancheuses -> mort instantanee
    if (trancheuses) {
      for (let tr of trancheuses) {
        if (tr.collidesWithAny(playerGroup.stickmen)) {
          playerGroup.stickmen = [];
          this.gameOver = true;
          break;
        }
      }
    }

    // Game over
    if (playerGroup.count <= 0) {
      this.gameOver = true;
    }
  }

  spawnGate(gates, sv) {
    // Spawn les deux gates (+ et *) en meme temps
    let gx1 = random(120, width / 2 - 40);
    let gx2 = random(width / 2 + 40, width - 120);
    let gy = random(80, height - 80);
    gates.push(new Gate(gx1, gy, '+', floor(random(1, 6))));
    gates.push(new Gate(gx2, gy, '*', floor(random(2, 4))));
  }

  reset() {
    this.score = 0;
    this.gameOver = false;
    this.gateSpawnTimer = 0;
    this.enemySpawnTimer = 0;
  }

  drawHUD() {
    push();
    fill(0, 0, 0, 120);
    noStroke();
    rect(0, 0, width, 40);

    fill(50, 180, 255);
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text("x" + this.score, 15, 20);

    fill(255);
    textStyle(NORMAL);
    textSize(13);
    text("  Best: " + this.bestScore, 60, 20);

    // Valeurs des sliders
    let sv = this.getSliderValues();
    textAlign(CENTER, CENTER);
    textSize(11);
    fill(180);
    text("Joueurs:" + sv.playerCount + "  Escouades:" + sv.enemyCount,
         width / 2, 20);

    textAlign(RIGHT, CENTER);
    textSize(12);
    fill(200);
    text("D=debug  R=reset  E=ennemi", width - 15, 20);

    if (Vehicle.debug) {
      fill(255, 100, 100);
      textAlign(CENTER, CENTER);
      textSize(14);
      text("DEBUG ON", width / 2, 34);
    }
    pop();
  }

  drawGameOver() {
    push();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);
    fill(255, 60, 60);
    textAlign(CENTER, CENTER);
    textSize(48);
    textStyle(BOLD);
    text("GAME OVER", width / 2, height / 2 - 30);
    fill(255);
    textSize(20);
    textStyle(NORMAL);
    text("Score: " + this.bestScore + "  |  Press R to restart",
         width / 2, height / 2 + 30);
    pop();
  }
}
