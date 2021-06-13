// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Game of Life
// Video: https://youtu.be/FWSR_7kZuYg

// Modified by: Dmytro-Andrii Kostelnyi


// Get empty array of specified size

function getArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

let state; // current state
let cols;
let rows;
let resolution = 10;


// Colors
let primary
let secondary


// Initial setup

function setup() {
  createCanvas(400, 400);
  cols = width / resolution;
  rows = height / resolution;

  state = getArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      state[i][j] = Math.random() > 0.8 ? 1 : 0
    }
  }
  primary = color('#10d53d')
  secondary = color('#320856')

  // call draw() 10 times per second
  frameRate(20)
}


// Draw current state

function draw() {
  background(secondary);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolution;
      let y = j * resolution;

      let currentState = state[i][j]

      if (currentState === 1) {
        fill(primary)
        noStroke()
        rect(x, y, resolution, resolution);
      }
    }
  }

  state = nextState()
}


// Get next state

function nextState() {
  const next = getArray(cols, rows);

  // Compute next based on grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let currentState = state[i][j];

      // Extract chunk 3x3 from entire state and
      // calculate score of extracted chunk 3x3
      let score = chunkScore(getChunk(state, i, j));

      if (currentState === 0 && score === 3) {
        next[i][j] = 1;
      } else if (currentState === 1 && (score < 2 || score > 3)) {
        next[i][j] = 0;
      } else {
        next[i][j] = currentState;
      }
    }
  }
  return next
}


// Extract chunk 3x3 from entire state

function getChunk(grid, x, y) {
  const chunk = getArray(3, 3)

  // i, j - relative indexes for g
  // k, l - absolute indexes for chunk
  for (let [i, k] = [-1, 0]; i < 2; i++, k++) {
    for (let [j, l] = [-1, 0]; j < 2; j++, l++) {
      
      chunk[k][l] = grid[(x + i + cols) % cols]
                          [(y + j + rows) % rows] 
    }
  }
  return chunk
}


// Calculate score of extracted chunk 3x3

function chunkScore(chunk) {
  if (chunk.length !== 3) {
    throw new Error("Chunk must have exactly 3 columns")
  }

  let score = 0;

  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i].length !== 3) {
      throw new Error("Chunk column must have exactly 3 rows")
    }

    for (let j = 0; j < chunk[i].length; j++) {
      
      /*  0 1 2
        0 n n n
        1 n x n
        2 n n n */
      // Math.floor(3 / 2) = 1

      // n - neighbour cell
      // x - current cell, exclude it from score

      if (i !== Math.floor(chunk.length / 2) || j !== Math.floor(chunk.length / 2)) {
        score += chunk[i][j];
      }
    }
  }

  return score;
}
