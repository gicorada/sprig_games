/*
@title: a_platformer
@tags: ['platformer']
@addedOn: 2024
@author: gicorada
*/

// define the sprites in our game
const player = "p";
const block = "b";
const goal = "g";

// assign bitmap art to each sprite
setLegend(
  [player, bitmap`
................
................
................
.....0000000....
....00.....0....
....0..0.0.0....
....0......0....
....0.....00....
....0000000.....
....0...........
....0...........
....0...........
....00..........
....0.0.........
....0.0.........
................`],
  [block, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],
  [goal, bitmap`
................
................
................
................
.......00.......
......0000......
.....000000.....
....00000000....
...0000000000...
....00000000....
.....000000.....
......0000......
.......00.......
................
................
................`]
);

// create game levels
let level = 0; // this tracks the level we are on
const levels = [
  map`
...............
...............
...........g...
...........b...
.........b.....
.....bb.bb.....
...b...........
p..b...........
bbbbbbbbbbbbbbb
...............`,
  map`
p..
.b.
..g`,
  map`
p.wg
.bw.
..w.
..w.`,
  map`
p...
...b
...b
.bbg`,
  map`
...
.p.
...`,
  map`
p.w.
.bwg
....
..bg`
];

// set the map displayed to the current level
const currentLevel = levels[level];
setMap(currentLevel);

setSolids([player, block]); // other sprites cannot go inside of these sprites

// allow certain sprites to push certain other sprites
setPushables({
  [player]: []
});

// gravity and jump variables
let isJumping = false;
const gravity = 1;
const jumpHeight = 3;
let jumpVelocity = 0;

const wait = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

onInput("d", () => {
  getFirst(player).x += 1;
});

onInput("a", () => {
  getFirst(player).x -= 1;
});

onInput("w", () => {
  if (!isJumping && isOnGround()) {
    startJump();
  }
});

// input to reset level
onInput("j", () => {
  const currentLevel = levels[level]; // get the original map of the level

  // make sure the level exists before we load it
  if (currentLevel !== undefined) {
    clearText("");
    setMap(currentLevel);
    isJumping = false;
    jumpVelocity = 0;
  }
});

// start the jump
const startJump = () => {
  isJumping = true;
  jumpVelocity = jumpHeight;
};

// check if player is on the ground
const isOnGround = () => {
  const playerSprite = getFirst(player);
  return getAll(block).some(block =>
    block.x === playerSprite.x && block.y === playerSprite.y + 1
  );
};

const updatePhysics = async () => {
  const playerSprite = getFirst(player);

  if (isJumping) {
    playerSprite.y -= jumpVelocity; // Muovi il giocatore verso l'alto
    jumpVelocity -= gravity; // Riduci la velocità del salto

    // Se la velocità del salto è scesa a zero o meno, termina il salto
    if (jumpVelocity <= 0) {
      isJumping = false;
    }
  } else {
    // Se il giocatore non è a terra, applica la gravità
    if (!isOnGround()) {
      playerSprite.y += gravity;
    }
  }

  // Controlla se il giocatore è a terra
  if (isOnGround()) {
    // Azzeramento della velocità del salto
    jumpVelocity = 0;
    isJumping = false;
  }
};



// continuously update game physics
const gameLoop = async () => {
  while (true) {
    // Chiamata alla funzione di aggiornamento della fisica
    await updatePhysics();
    // Ritardo tra gli aggiornamenti
    await wait(50);
  }
};

// Avvia il ciclo di gioco
gameLoop();

// these get run after every input
afterInput(() => {
  const p = getFirst(player);
  const g = getAll(goal);

  for (let h = 0; h < g.length; h++) {
    if (g[h] && g[h].x === p.x && g[h].y === p.y) {
      level = level + 1;

      const currentLevel = levels[level];

      if (currentLevel !== undefined) {
        setMap(currentLevel);
        isJumping = false;
        jumpVelocity = 0;
      } else {
        addText("you win!", { y: 4, color: color`3` });
      }

      break; // Exit loop when goal is found and processed
    }
  }
});
