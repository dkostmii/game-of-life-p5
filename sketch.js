// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Game of Life
// Video: https://youtu.be/FWSR_7kZuYg

// Modified by: Dmytro-Andrii Kostelnyi


// Get empty array of specified size

function getArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function getArrayZeros(cols, rows) {
  let arr = getArray(cols, rows)

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      arr[i][j] = 0
    }
  }

  return arr
}

function getArrayRandom(cols, rows) {
  let arr = getArray(cols, rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      state[i][j] = Math.random() > 0.4 ? 1 : 0
    }
  }

  return arr
}

let state; // current state
let cols;
let rows;
let resolution = 25;

let canvasWidth = 800
let canvasHeight = 800
let isTouch = false

let paused = true

let hoverPos;

let fps;
let pendingFrames = 0

let dead = false


// Colors
let primary
let secondary


function btnStartPressed() {
  const btnStart = document.getElementById('btn-start')
  const btnClear = document.getElementById('btn-clear')
  const fpsCount = document.getElementById('fps-count')

  if (!btnStart) {
    throw new Error("btn-start element not found!")
  }

  if (!btnClear) {
    throw new Error("btn-clear element not found")
  }

  if (!fpsCount) {
    throw new Error("fps-count element not found")
  }

  if (typeof paused === 'undefined') {
    throw new Error('paused is undefined')
  }

  paused = !paused

  dead = false

  if (paused) {
    if (btnClear.hasAttribute('disabled')) {
      btnClear.removeAttribute('disabled')
    }

    btnStart.innerHTML = 'Start'

  } else {
    btnClear.setAttribute('disabled', 'true')
    btnStart.innerHTML = 'Pause'
  }
}

function btnClearPressed() {
  if (state && cols && rows) {
    if (paused) {
      state = getArrayZeros(cols, rows)
    }
  }
}

function fpsCountChanged(e) {
  const fpsCount = parseInt(e.target.value)
  if (!fpsCount) {
    throw new Error("fpsCount is undefined")
  }

  if (fpsCount > 0 && fpsCount <= 480) {
    fps = fpsCount
    pendingFrames = 0
  } else {
    throw new Error("Invalid fps count specified")
  }
}

window.addEventListener('load', () => {
  const btnStart = document.getElementById('btn-start')
  const btnClear = document.getElementById('btn-clear')
  const fpsCount = document.getElementById('fps-count')

  if (!btnStart) {
    throw new Error("btn-start element not found!")
  }

  if (!btnClear) {
    throw new Error("btn-clear element not found")
  }

  if (!fpsCount) {
    throw new Error("fps-count element not found")
  }

  btnStart.addEventListener("click", btnStartPressed)
  btnClear.addEventListener("click", btnClearPressed)

  fpsCount.addEventListener("change", fpsCountChanged)


  function is_touch_device() {
    const ua = navigator.userAgent
    try {  
      document.createEvent("TouchEvent");
      if (ua.match(/(iPhone|iPod|iPad)/) 
        || ua.match(/BlackBerry/) || ua.match(/Android/)) {
        return true;
      }  
    } catch (e) {  
        return false;  
    }  
  }
  isTouch = is_touch_device()
})

// Initial setup

function setup() {
  if (window.innerWidth < 800) {
    canvasWidth = Math.floor(window.innerWidth / 100) * 100
    canvasHeight = canvasWidth
  }
  createCanvas(canvasWidth, canvasHeight);

  cols = Math.floor(width / resolution);
  rows = Math.floor(height / resolution);

  state = getArrayZeros(cols, rows)
  primary = color('#10d53d')
  secondary = color('#320856')

  fps = 30
  frameRate(fps)
}


// Draw current state

function draw() {
  background(secondary);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolution;
      let y = j * resolution;

      let currentState = state[i][j]

      if (paused) {
        frameRate(60)
        if (x < width && j === 0 && i > 0) {
          stroke(96)
          strokeWeight(1)
          line(x, 0, x, height)
        }

        if (y < height && i === 0 && j > 0) {
          stroke(96)
          strokeWeight(1)
          line(0, y, width, y)
        }

        if (Array.isArray(hoverPos) && !isTouch) {
          fill(128)
          noStroke()
          rect(hoverPos[0] * resolution, hoverPos[1] * resolution, resolution, resolution)
        }
      }

      if (currentState === 1) {
        fill(primary)
        noStroke()
        rect(x, y, resolution, resolution);
      }
    }
  }
  if (!paused) {
    frameRate(fps)

    // because p5 max fps is 60
    // we should count pending frames
    const fpsFactor = (fps / 60) - 1
    if (fpsFactor > 0) {
      pendingFrames += fpsFactor
    }

    state = nextState()
    // change state if there are > 1 pending frames
    // for ex. pendingFrames = 2.5678200000000
    // nextState will be called twice
    while (pendingFrames >= 1) {
      state = nextState()
      pendingFrames -= 1
    }

    if (dead) {
      btnStartPressed()
    }

    loop()
  }
}

function mouseClicked() {
  if (paused) {
    if (!state) {
      throw new Error("State is undefined")
    }

    const x = Math.floor(map(mouseX, 0, width, 0, cols))
    const y = Math.floor(map(mouseY, 0, height, 0, rows))

    state[x][y] = state[x][y] === 0 ? 1 : 0
  }
}

function mouseMoved() {
  if (!isTouch) {
    if (paused) {
      if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
        const x = Math.floor(map(mouseX, 0, width, 0, cols))
        const y = Math.floor(map(mouseY, 0, height, 0, rows))

        hoverPos = [x, y]
      } else {
        hoverPos = null
      }
    }
  }
}


// Get next state

function nextState() {
  const next = getArray(cols, rows);

  let changed = false
  // Compute next based on grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let currentState = state[i][j];

      // Extract chunk 3x3 from entire state and
      // calculate score of extracted chunk 3x3
      let score = chunkScore(getChunk(state, i, j));

      if (currentState === 0 && score === 3) {
        changed = true
        next[i][j] = 1;
      } else if (currentState === 1 && (score < 2 || score > 3)) {
        changed = true
        next[i][j] = 0;
      } else {
        next[i][j] = currentState;
      }
    }
  }

  if (!changed) {
    dead = true
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
