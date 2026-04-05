# Count Masters — Steering Behaviours Edition

Jeu inspiré de **Count Masters: Stickman Games** (jeu mobile), recréé en appliquant les **comportements de pilotage (Steering Behaviours)** vus en cours de Systèmes IA (M2 IA2).

## Lancer le projet

```bash
cd count_master
npx serve .
```

Puis ouvrir l'URL affichée dans le terminal (par défaut `http://localhost:3000`).

## Principe du jeu

Le joueur contrôle un groupe de bonhommes (stickmen) bleus qui suivent la souris. L'objectif est de :

- **Collecter des gates** (`+N` ou `×N`) pour agrandir son groupe
- **Éviter les escouades ennemies** (bonhommes rouges) qui poursuivent le joueur
- **Éviter les trancheuses** (scies rotatives mortelles) — contact = game over instantané
- **Survivre** le plus longtemps possible avec le score le plus haut

Les ennemis **meurent automatiquement au bout de 10 secondes** s'ils n'ont pas rattrapé le joueur. La taille des escouades ennemies **s'adapte au nombre de joueurs** en cours de partie.

## Contraintes du cours appliquées

### Vehicle.js — Ne pas toucher

Le fichier `vehicle.js` est la **version du professeur** (identique à l'exercice 3 — Arrival correction). Il contient la classe de base `Vehicle` avec les méthodes :

- `seek(target, arrival, d)` — comportement de recherche + arrivée
- `arrive(target, d)` — arrivée avec freinage
- `pursue(vehicle)` / `evade(vehicle)` — poursuite et évasion
- `wander()` — errance (cercle de wander)
- `boundaries(bx, by, bw, bh, d)` — confinement dans une zone
- `applyForce(force)`, `update()`, `show()`, `edges()`

**Ce fichier n'a pas été modifié.** Toute la logique spécifique est dans les sous-classes et extensions.

### Tous les composants dans des sous-classes de Vehicle

Chaque entité du jeu **hérite de Vehicle** :

| Fichier | Classe | Rôle |
|---------|--------|------|
| `stickman.js` | `Stickman extends Vehicle` | Bonhomme (joueur ou ennemi follower) |
| `enemy.js` | `Enemy extends Vehicle` | Leader ennemi (gros bonhomme rouge en colère) |
| `verseau.js` | `Verseau extends Vehicle` | Entité d'ambiance (wander + avoid) |
| `voiture.js` | `Voiture extends Vehicle` | Tortue qui suit le circuit |
| `obstacle.js` | `Obstacle extends Vehicle` | Rocher statique |
| `trancheuse.js` | `Trancheuse extends Vehicle` | Scie rotative mortelle |
| `gate.js` | `Gate extends Vehicle` | Bonus `+N` / `×N` |
| `playerGroup.js` | `PlayerGroup extends Vehicle` | Groupe de bonhommes du joueur |
| `enemySquad.js` | `EnemySquad extends Vehicle` | Escouade ennemie (leader + followers) |
| `enemyGroup.js` | `EnemyGroup extends Vehicle` | Gestionnaire de toutes les escouades |

### BehaviourManager

La classe `BehaviourManager` (fichier `behaviourManager.js`) permet d'associer plusieurs comportements pondérés à un véhicule :

```javascript
this.bm = new BehaviourManager(this);
this.bm.addBehavior('wander', () => this.wander(), 1.0);
this.bm.addBehavior('avoid', () => this.avoid(obstacles), 2.5);
```

Pattern appliqué partout : **force → mult(weight) → applyForce → update → show**

### Voiture qui suit un circuit (Path Following)

La classe `Voiture` utilise le comportement **follow** (exercice 5-3 PathFollowingComplex) via `BehaviourManager` :

- `path.js` — classe `Path` avec circuit fermé et **petits points noirs** (ligne centrale en pointillés)
- `voiture.js` — suit le circuit avec `follow(path)` + évitement d'obstacles avec `avoid(obstacles)`
- `vehicleExtensions.js` — contient `findProjection()` et `Vehicle.prototype.follow(path)` (projection orthogonale sur segments)

Le circuit est généré aléatoirement sous forme d'ellipse déformée autour du terrain.

### Background avec Verseau (Wander + Avoid)

La classe `Verseau` (sous-classe de Vehicle) est une entité d'ambiance qui utilise `applyBehaviours()` via `BehaviourManager` avec :

- **wander** (exercice 4) — errance aléatoire
- **boundaries** — confinement dans le canvas
- **avoid** — évitement d'obstacles

### Évitement d'obstacles avec avoid (dans vehicleExtensions.js)

La méthode `Vehicle.prototype.avoid(obstacles)` est ajoutée via `vehicleExtensions.js` (sans modifier `vehicle.js`). Elle implémente la logique de l'exercice 6 (ObstacleAvoidance) :

- Calcul des vecteurs **ahead** et **ahead2** devant le véhicule
- Recherche de l'**obstacle le plus proche**
- Si collision détectée dans la **zone d'évitement** → force de répulsion
- Dessin debug : vecteurs jaune/violet, points rouge/bleu, zone semi-transparente

Autres méthodes dans `vehicleExtensions.js` :
- `Vehicle.prototype.separate(vehicles)` — séparation entre voisins
- `Vehicle.prototype.drawVector(pos, v, col)` — dessin de vecteur fléché
- `Vehicle.prototype.getObstacleLePlusProche(obstacles)` — recherche du plus proche

## Architecture des fichiers

```
count_master/
├── vehicle.js              ← Classe de base (version du prof, NON MODIFIÉE)
├── vehicleExtensions.js    ← Extensions : avoid, separate, follow, drawVector
├── behaviourManager.js     ← Gestionnaire de comportements pondérés
├── path.js                 ← Circuit fermé (Path Following)
├── obstacle.js             ← Rochers statiques
├── trancheuse.js           ← Scies rotatives mortelles
├── gate.js                 ← Bonus +N / ×N
├── stickman.js             ← Bonhomme (joueur/ennemi)
├── shark.js                ← Leader ennemi (gros bonhomme rouge)
├── voiture.js              ← Tortue suivant le circuit
├── verseau.js              ← Entité d'ambiance (wander + avoid)
├── playerGroup.js          ← Groupe du joueur
├── enemySquad.js           ← Escouade ennemie (leader + followers)
├── enemyGroup.js           ← Gestionnaire d'escouades
├── gameManager.js          ← Logique de jeu, HUD, sliders
├── sketch.js               ← Boucle principale (setup/draw)
├── index.html              ← Point d'entrée
├── style.css               ← Styles
└── libraries/              ← p5.js
```

## Contrôles

| Touche | Action |
|--------|--------|
| Souris | Déplacer le groupe du joueur |
| `D` | Activer/désactiver le mode debug |
| `R` | Relancer la partie |
| `E` | Spawner une escouade ennemie à la position de la souris |
| `G` | Spawner une gate bonus à la position de la souris |
| `O` | Ajouter un obstacle rocher |
| `W` | Ajouter un verseau |
| `C` | Ajouter une voiture sur le circuit |

## Comportements de pilotage utilisés

| Comportement | Exercice du prof | Utilisé par |
|--------------|-----------------|-------------|
| **Seek / Arrive** | Ex. 1, 3 | Stickman (followers), PlayerGroup |
| **Pursue / Evade** | Ex. 2 | Shark (leader ennemi) |
| **Wander** | Ex. 4 | Verseau |
| **Path Following** | Ex. 5-3 | Voiture |
| **Obstacle Avoidance** | Ex. 6 | Tous (via `avoid()`) |
| **Separation** | Ex. 7 (Boids) | Stickman (followers) |
| **Boundaries** | Ex. 3, 6 | Verseau |

## Le lien vers la vidéo de démonstration du jeu :
https://youtu.be/9enOIgsxRY0?si=y6wcVrnwqTWkyJSI
