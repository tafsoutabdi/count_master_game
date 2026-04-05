// === COUNT MASTERS ===
// Meme logique que les exercices SteeringBehaviours :
// force -> mult(weight) -> applyForce -> update -> show

let playerGroup;
let enemyGroup;
let gates = [];
let obstacles = [];
let wanderers = [];
let voitures = [];
let trancheuses = [];
let circuit;
let gameManager;
let bubbles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('monospace');

  if (gameManager) gameManager.removeSliders();

  gameManager = new GameManager();
  gameManager.initSliders();

  initBubbles();
  initObstacles();
  initTrancheuses();
  initCircuit();
  initVoitures();
  initWanderers();

  let sv = gameManager.getSliderValues();

  // Joueur : groupe de bonhommes bleus au centre
  playerGroup = new PlayerGroup(width / 2, height * 0.6, sv.playerCount);

  // Ennemis : escouades de bonhommes rouges
  enemyGroup = new EnemyGroup(sv.enemyCount, playerGroup);
}

// --- INITIALISATION ---

function initBubbles() {
  bubbles = [];
  for (let i = 0; i < 80; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      s: random(2, 8),
      speed: random(0.2, 0.8),
      alpha: random(30, 80)
    });
  }
}

function initObstacles() {
  obstacles = [];
  let nb = floor(random(3, 6));
  for (let i = 0; i < nb; i++) {
    obstacles.push(new Obstacle(
      random(150, width - 150),
      random(120, height - 120),
      random(25, 45)
    ));
  }
}

function initTrancheuses() {
  trancheuses = [];
  let nb = floor(random(2, 5));
  for (let i = 0; i < nb; i++) {
    trancheuses.push(new Trancheuse(
      random(200, width - 200),
      random(150, height - 150),
      random(28, 42)
    ));
  }
}

function initCircuit() {
  circuit = new Path();
  // Circuit elliptique autour du terrain de jeu
  // Meme logique que exercice 5-3 : generer un circuit ferme
  let nbSegments = 20;
  let angleStep = TWO_PI / nbSegments;
  let rx = width * 0.35;
  let ry = height * 0.32;
  for (let i = 0; i < nbSegments; i++) {
    let angle = i * angleStep;
    let jitter = random(-20, 20);
    let x = width / 2 + cos(angle) * (rx + jitter);
    let y = height / 2 + sin(angle) * (ry + jitter);
    circuit.addPoint(x, y);
  }
}

function initVoitures() {
  voitures = [];
  for (let i = 0; i < 4; i++) {
    // Placer sur le circuit
    let idx = floor(random(circuit.points.length));
    let pt = circuit.points[idx];
    let v = new Voiture(pt.x + random(-10, 10), pt.y + random(-10, 10), circuit, obstacles);
    voitures.push(v);
  }
}

function initWanderers() {
  wanderers = [];
  for (let i = 0; i < 3; i++) {
    let v = new Verseau(random(80, width - 80), random(80, height - 80));
    v.initBehaviours(obstacles);
    wanderers.push(v);
  }
}

// --- BOUCLE PRINCIPALE ---
// Meme pattern que tous les exercices :
// applyBehaviours/applyForce -> update -> show

function draw() {
  // Fond ocean degrade
  drawOceanBackground();

  // 1. Obstacles (rochers) - statiques
  for (let obs of obstacles) {
    obs.show();
  }

  // 1b. Trancheuses (obstacles mortels rotatifs)
  for (let tr of trancheuses) {
    tr.update();
    tr.show();
  }

  // 2. Gates (bonus + et *)
  for (let gate of gates) {
    gate.show();
  }

  // 3. Circuit + Voitures (follow + avoid via BehaviourManager)
  // Meme pattern que exercice 5-3 (PathFollowingComplex)
  circuit.display();
  for (let v of voitures) {
    v.applyBehaviours();
    v.update();
    v.show();
  }

  // 4. Verseau (wander + boundaries + avoid via BehaviourManager)
  // Meme pattern que exercice 4 (Wander) + exercice 6 (ObstacleAvoidance)
  for (let w of wanderers) {
    w.applyBehaviours();
    w.update();
    w.show();
  }

  // 5. Ennemis : bonhommes rouges (pursue + arrive + separate + avoid)
  // Meme pattern que exercice 2 (PursueEvade) + exercice 6
  enemyGroup.move(obstacles);
  enemyGroup.show();

  // 6. Joueur : bonhommes bleus (arrive + separate + avoid)
  // Meme pattern que exercice 3 (Arrival) + exercice 6
  let target = createVector(mouseX, mouseY);
  playerGroup.move(target, obstacles);
  playerGroup.show();

  // 7. Logique de jeu
  gameManager.update(playerGroup, gates, obstacles, enemyGroup, trancheuses);

  // 8. HUD
  gameManager.drawHUD();

  // 9. Game over
  if (gameManager.gameOver) {
    gameManager.drawGameOver();
    noLoop();
  }
}

// --- BACKGROUND OCEAN ---

function drawOceanBackground() {
  // Degrade bleu ocean
  for (let y = 0; y < height; y += 4) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(10, 40, 80), color(5, 20, 50), inter);
    stroke(c);
    strokeWeight(4);
    line(0, y, width, y);
  }

  // Bulles
  push();
  noStroke();
  for (let b of bubbles) {
    fill(150, 200, 255, b.alpha);
    circle(b.x, b.y, b.s);
    b.y -= b.speed;
    if (b.y < -b.s) {
      b.y = height + b.s;
      b.x = random(width);
    }
  }
  pop();

  // Raies de lumiere
  push();
  noStroke();
  for (let i = 0; i < 5; i++) {
    let lx = width * (0.15 + i * 0.18) + sin(frameCount * 0.005 + i) * 30;
    fill(100, 180, 255, 8);
    beginShape();
    vertex(lx - 20, 0);
    vertex(lx + 20, 0);
    vertex(lx + 60 + i * 10, height);
    vertex(lx - 60 - i * 10, height);
    endShape(CLOSE);
  }
  pop();
}

// --- CONTROLES CLAVIER ---
// d = debug (comme tous les exercices), r = reset

function keyPressed() {
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
  } else if (key === 'r' || key === 'R') {
    gameManager.removeSliders();
    gates = [];
    gameManager.reset();
    initBubbles();
    initObstacles();
    initTrancheuses();
    initCircuit();
    initVoitures();
    initWanderers();
    gameManager.initSliders();
    let sv = gameManager.getSliderValues();
    playerGroup = new PlayerGroup(width / 2, height * 0.6, sv.playerCount);
    enemyGroup = new EnemyGroup(sv.enemyCount, playerGroup);
    loop();
  } else if (key === 'c' || key === 'C') {
    // Ajouter une voiture sur le circuit
    let idx = floor(random(circuit.points.length));
    let pt = circuit.points[idx];
    let v = new Voiture(pt.x, pt.y, circuit, obstacles);
    voitures.push(v);
  } else if (key === 'e' || key === 'E') {
    let size = floor(random(1, 6));
    let sq = new EnemySquad(mouseX, mouseY, size, playerGroup);
    enemyGroup.squads.push(sq);
  } else if (key === 'g' || key === 'G') {
    gates.push(new Gate(mouseX - 40, mouseY, '+', floor(random(1, 6))));
    gates.push(new Gate(mouseX + 40, mouseY, '*', floor(random(2, 4))));
  } else if (key === 'o' || key === 'O') {
    obstacles.push(new Obstacle(mouseX, mouseY, random(25, 45)));
  } else if (key === 'w' || key === 'W') {
    let v = new Verseau(mouseX, mouseY);
    v.initBehaviours(obstacles);
    wanderers.push(v);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initBubbles();
  if (gameManager) {
    gameManager.removeSliders();
    gameManager.initSliders();
  }
}
