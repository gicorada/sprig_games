/*
@title: yet_another_platformer
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
.....0000000....
....00.....0....
....0......0....
....0..5.5.0....
....0......0....
....0......0....
....0.....00....
....0000000.....
....0...........
....0...........
....0...........
....00..........
....0.0.........
....0.0.........`],
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
...............
...........g...
...........bb..
.........b.....
.....bb.bb.....
...b...........
p..b...........
bbbbbbbbbbbbbbb`,
  map`
...............
...............
...............
...............
...............
...............
...............
...............
..p.........g..
bbbbbbbbbbbbbbb`,
  map`
...............
...............
.......bg......
......b........
.....b.........
....b..........
...b...........
p.bg...........
bb.............
...............`,
  map`
...............
...............
...............
...............
...............
...............
p..............
...b...........
...b...........
.bbg...........`,
  map`
...............
...............
...............
...............
...............
...............
...............
...............
.p.............
...............`,
  map`
...............
...............
...............
...............
...............
...............
...............
p..............
...............
...............`
];

const melody = tune`
300: C5-300 + A4~300,
300: B4~300 + D5-300,
300: C5~300 + E5-300,
8700`

// set the map displayed to the current level
const currentLevel = levels[level];
addText("level 1 - start", { y: 2, x: 1, color: color`3` });
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
  jumpVelocity = jumpHeight-1;
};

// check if player is on the ground
const isOnGround = () => {
  const playerSprite = getFirst(player);
  return getAll(block).some(block =>
    block.x === playerSprite.x && block.y === playerSprite.y + 1
  ) || playerSprite.y + 1=== height();
};

const updatePhysics = async () => {
  const playerSprite = getFirst(player);

  if (isJumping) {
    playerSprite.y -= jumpVelocity; // Muovi il giocatore verso l'alto
    jumpVelocity -= gravity; // Riduci la velocità del salto

    // Se la velocità del salto è scesa a zero o meno, termina il salto
    if (jumpVelocity <= 0) {
      isJumping = false;
      jumpVelocity = 0; // Azzera la velocità del salto
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


const checkGoal = () => {
  const p = getFirst(player);
  const g = getFirst(goal);

  if (g && g.x === p.x && g.y === p.y) {
    level = level + 1;

    const currentLevel = levels[level];

    if (currentLevel !== undefined) {
      clearText();
      addText(`level ${level+1}`, { y: 2, x: 1, color: color`3` });
      playTune(melody)
      setMap(currentLevel);
      isJumping = false;
      jumpVelocity = 0;
    } else {
      addText("you win!", { y: 4, color: color`3` });
    }
  }
}



const gameLoop = async () => {
  while (true) {
    await updatePhysics();
    if (isOnGround()) {  // Assicura che il giocatore possa saltare dopo essere atterrato
      isJumping = false;
      jumpVelocity = 0;
    }
    checkGoal();
    await wait(75);
  }
};


// Avvia il ciclo di gioco
gameLoop();

afterInput(() => {

});

