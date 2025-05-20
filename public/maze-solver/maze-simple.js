// Super Simple Maze Generator and Solver

// Get DOM elements
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const generateButton = document.getElementById('generate-maze');
const clearButton = document.getElementById('clear-maze');
const solveButton = document.getElementById('solve-btn');
const resetButton = document.getElementById('reset-button');
const sizeSlider = document.getElementById('maze-size');
const densitySlider = document.getElementById('wall-density');
const speedSlider = document.getElementById('speed-slider');
const sizeValue = document.getElementById('size-value');
const densityValue = document.getElementById('density-value');

// Basic configuration
let mazeSize = 15;
let wallDensity = 30;
let animationSpeed = 50;
let selectedAlgorithm = 'astar';
const MAX_MAZE_SIZE = 25; // Maximum supported maze size

// Cell types
const EMPTY = 0;
const WALL = 1;
const START = 2;
const END = 3;
const VISITED = 4;
const PATH = 5;

// Maze state
let maze = [];
let cellSize = 20;
let startNode = { x: 1, y: 1 };
let endNode = { x: 13, y: 13 };

// Initialize canvas size
function initCanvas() {
  // Use high-resolution canvas for sharper display
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Set display size (css pixels)
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  
  // Set actual size in memory (scaled to account for extra pixel density)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Scale context to ensure correct drawing operations
  ctx.scale(dpr, dpr);
  
  // Set base dimensions if not set by CSS
  if (rect.width === 0) {
    canvas.style.width = '600px';
    canvas.style.height = '400px';
    canvas.width = 600 * dpr;
    canvas.height = 400 * dpr;
  }
}

// Create an empty maze
function createEmptyMaze() {
  maze = [];
  for (let y = 0; y < mazeSize; y++) {
    const row = [];
    for (let x = 0; x < mazeSize; x++) {
      row.push(EMPTY);
    }
    maze.push(row);
  }
  
  // Set start and end points
  startNode = { x: 1, y: 1 };
  endNode = { x: mazeSize - 2, y: mazeSize - 2 };
  
  maze[startNode.y][startNode.x] = START;
  maze[endNode.y][endNode.x] = END;
}

// Generate a random maze using a modified recursive backtracking algorithm
function generateMaze() {
  console.log("Generate maze button clicked!");
  
  // Start with all walls
  createEmptyMaze();
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      if (x === startNode.x && y === startNode.y) {
        maze[y][x] = START;
      } else if (x === endNode.x && y === endNode.y) {
        maze[y][x] = END;
      } else {
        maze[y][x] = WALL;
      }
    }
  }
  
  // Use a randomized version of Prim's algorithm
  randomizedPrimMaze();
  
  // Draw the maze
  drawMaze();
}

// Randomized Prim's algorithm for maze generation
function randomizedPrimMaze() {
  // Directions: up, right, down, left
  const dirs = [
    [0, -2], [2, 0], [0, 2], [-2, 0]
  ];
  
  // Start with a random cell and mark it as passage
  let startX = Math.floor(Math.random() * Math.floor((mazeSize-1)/2)) * 2 + 1;
  let startY = Math.floor(Math.random() * Math.floor((mazeSize-1)/2)) * 2 + 1;
  
  // Make sure we don't start on the start or end node
  while ((startX === startNode.x && startY === startNode.y) ||
         (startX === endNode.x && startY === endNode.y)) {
    startX = Math.floor(Math.random() * Math.floor((mazeSize-1)/2)) * 2 + 1;
    startY = Math.floor(Math.random() * Math.floor((mazeSize-1)/2)) * 2 + 1;
  }
  
  maze[startY][startX] = EMPTY;
  
  // Add the walls of the cell to the wall list
  const walls = [];
  for (let i = 0; i < dirs.length; i++) {
    const nx = startX + dirs[i][0];
    const ny = startY + dirs[i][1];
    if (isValid(nx, ny)) {
      walls.push([startX + dirs[i][0]/2, startY + dirs[i][1]/2, nx, ny]);
    }
  }
  
  // While there are walls in the list
  while (walls.length > 0) {
    // Pick a random wall from the list
    const randomIndex = Math.floor(Math.random() * walls.length);
    const [wx, wy, cx, cy] = walls[randomIndex];
    walls.splice(randomIndex, 1);
    
    // If the cell on the opposite side isn't visited yet
    if (isValid(cx, cy) && maze[cy][cx] === WALL) {
      // Make the wall a passage
      maze[wy][wx] = EMPTY;
      // Mark the cell as visited
      maze[cy][cx] = EMPTY;
      
      // Add the neighboring walls of the cell to the wall list
      for (let i = 0; i < dirs.length; i++) {
        const nx = cx + dirs[i][0];
        const ny = cy + dirs[i][1];
        if (isValid(nx, ny) && maze[ny][nx] === WALL) {
          walls.push([cx + dirs[i][0]/2, cy + dirs[i][1]/2, nx, ny]);
        }
      }
    }
  }
  
  // Ensure there's a path from start to end
  ensurePathExists();
  
  // Add some random passages based on wall density (lower density = more passages)
  const openingChance = 100 - wallDensity;
  for (let y = 1; y < mazeSize - 1; y++) {
    for (let x = 1; x < mazeSize - 1; x++) {
      // Skip start and end positions
      if ((x === startNode.x && y === startNode.y) || 
          (x === endNode.x && y === endNode.y)) {
        continue;
      }
      
      // Randomly open some walls
      if (maze[y][x] === WALL && Math.random() * 100 < openingChance * 0.3) {
        maze[y][x] = EMPTY;
      }
    }
  }
  
  // Make sure start and end are properly set
  maze[startNode.y][startNode.x] = START;
  maze[endNode.y][endNode.x] = END;
}

// Ensure there's a path from start to end using BFS
function ensurePathExists() {
  // If a path already exists, we're done
  if (hasPath()) return;
  
  // Otherwise, create a path using A*
  const path = findPath(startNode, endNode);
  
  // If no path could be found, clear more walls
  if (path.length === 0) {
    // Clear more walls randomly until a path exists
    while (!hasPath()) {
      // Pick a random wall
      let x, y;
      do {
        x = Math.floor(Math.random() * (mazeSize - 2)) + 1;
        y = Math.floor(Math.random() * (mazeSize - 2)) + 1;
      } while (maze[y][x] !== WALL);
      
      // Clear it
      maze[y][x] = EMPTY;
    }
  }
}

// Check if there's a path from start to end
function hasPath() {
  return findPath(startNode, endNode).length > 0;
}

// Find a path using A* algorithm
function findPath(start, end) {
  // Priority queue (simple array implementation)
  const openSet = [{ x: start.x, y: start.y, f: 0, g: 0, parent: null }];
  const closedSet = new Set(); // Visited nodes
  
  while (openSet.length > 0) {
    // Find node with lowest f score
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    
    const current = openSet[lowestIndex];
    
    // Check if we reached the end
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return path.reverse();
    }
    
    // Remove current from openSet and add to closedSet
    openSet.splice(lowestIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    
    // Check all neighbors
    for (let i = 0; i < 4; i++) {
      const nx = current.x + dx[i];
      const ny = current.y + dy[i];
      
      // Skip if not valid or already in closedSet
      if (!isValid(nx, ny) || closedSet.has(`${nx},${ny}`)) {
        continue;
      }
      
      // Skip walls
      if (maze[ny][nx] === WALL) {
        continue;
      }
      
      // Calculate g score (distance from start)
      const g = current.g + 1;
      
      // Check if this path is better than any previous one
      let isNewPath = true;
      for (let j = 0; j < openSet.length; j++) {
        if (openSet[j].x === nx && openSet[j].y === ny) {
          if (g < openSet[j].g) {
            openSet[j].g = g;
            openSet[j].f = g + heuristic({ x: nx, y: ny }, end);
            openSet[j].parent = current;
          }
          isNewPath = false;
          break;
        }
      }
      
      // If it's a new path, add to openSet
      if (isNewPath) {
        const h = heuristic({ x: nx, y: ny }, end);
        openSet.push({
          x: nx,
          y: ny,
          f: g + h,
          g: g,
          parent: current
        });
      }
    }
  }
  
  // No path found
  return [];
}

// Draw the maze on the canvas
function drawMaze() {
  // Get the actual canvas dimensions
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  
  // Clear canvas
  ctx.clearRect(0, 0, displayWidth * 2, displayHeight * 2);
  
  // Calculate cell size to fit the canvas
  cellSize = Math.min(
    Math.floor(displayWidth / mazeSize),
    Math.floor(displayHeight / mazeSize)
  );
  
  // Calculate offset to center the maze
  const offsetX = (displayWidth - cellSize * mazeSize) / 2;
  const offsetY = (displayHeight - cellSize * mazeSize) / 2;
  
  // Draw background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, displayWidth, displayHeight);
  
  // Draw cells
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      const cellX = offsetX + x * cellSize;
      const cellY = offsetY + y * cellSize;
      
      // Draw based on cell type
      switch (maze[y][x]) {
        case WALL:
          ctx.fillStyle = '#333';
          break;
        case START:
          ctx.fillStyle = '#4a6baf';
          break;
        case END:
          ctx.fillStyle = '#e74c3c';
          break;
        case VISITED:
          ctx.fillStyle = '#f1c40f';
          break;
        case PATH:
          ctx.fillStyle = '#2ecc71';
          break;
        default: // EMPTY
          ctx.fillStyle = '#fff';
          break;
      }
      
      // Draw cell with slight padding for better visibility
      ctx.fillRect(cellX, cellY, cellSize, cellSize);
      
      // Draw border for all cells with thinner lines for better appearance
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(cellX, cellY, cellSize, cellSize);
    }
  }
}

// Clear the maze
function clearMaze() {
  createEmptyMaze();
  drawMaze();
}

// Set up event listeners
function setupEventListeners() {
  // Generate maze button
  generateButton.addEventListener('click', function() {
    console.log("Generate maze button clicked!");
    generateMaze();
  });
  
  // Clear maze button
  clearButton.addEventListener('click', clearMaze);
  
  // Solve button
  solveButton.addEventListener('click', function() {
    console.log("Solve button clicked!");
    solveMaze();
  });
  
  // Reset button
  resetButton.addEventListener('click', clearMaze);
  
  // Size slider
  sizeSlider.addEventListener('input', function() {
    mazeSize = Math.min(parseInt(this.value), MAX_MAZE_SIZE);
    this.value = mazeSize; // Update slider if value was capped
    sizeValue.textContent = `${mazeSize} x ${mazeSize}`;
  });
  
  // Density slider
  densitySlider.addEventListener('input', function() {
    wallDensity = parseInt(this.value);
    densityValue.textContent = `${wallDensity}%`;
  });
  
  // Algorithm selection
  const algorithmButtons = document.querySelectorAll('.algorithm-button');
  algorithmButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      algorithmButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Set selected algorithm
      selectedAlgorithm = this.id.replace('algorithm-', '');
    });
  });
}

// Direction vectors for neighbors (up, right, down, left)
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

// Check if coordinates are valid
function isValid(x, y) {
  return x >= 0 && x < mazeSize && y >= 0 && y < mazeSize;
}

// Check if a cell is walkable
function isWalkable(x, y) {
  return isValid(x, y) && maze[y][x] !== WALL;
}

// Manhattan distance heuristic for A*
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Animation variables
let animationTimeouts = [];

// Clear all animations
function clearAnimations() {
  animationTimeouts.forEach(timeout => clearTimeout(timeout));
  animationTimeouts = [];
}

// Solve the maze using the selected algorithm
function solveMaze() {
  console.log("Solving maze with algorithm:", selectedAlgorithm);
  
  // Clear any previous animations
  clearAnimations();
  
  // Reset visited and path cells
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      if (maze[y][x] === VISITED || maze[y][x] === PATH) {
        maze[y][x] = EMPTY;
      }
    }
  }
  
  // Find path using the selected algorithm
  let path;
  let visitedNodes = [];
  
  switch (selectedAlgorithm) {
    case 'astar':
      [path, visitedNodes] = aStarSearch(startNode, endNode);
      break;
    case 'dijkstra':
      [path, visitedNodes] = dijkstraSearch(startNode, endNode);
      break;
    case 'bfs':
      [path, visitedNodes] = breadthFirstSearch(startNode, endNode);
      break;
    case 'dfs':
      [path, visitedNodes] = depthFirstSearch(startNode, endNode);
      break;
    default:
      [path, visitedNodes] = aStarSearch(startNode, endNode);
  }
  
  // Animate the solution
  animateSolution(visitedNodes, path);
}

// A* Search Algorithm
function aStarSearch(start, end) {
  // Priority queue (simple array implementation)
  const openSet = [{ x: start.x, y: start.y, f: 0, g: 0, parent: null }];
  const closedSet = new Set(); // Visited nodes
  const visitedNodes = [];
  
  while (openSet.length > 0) {
    // Find node with lowest f score
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    
    const current = openSet[lowestIndex];
    
    // Check if we reached the end
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return [path.reverse(), visitedNodes];
    }
    
    // Remove current from openSet and add to closedSet
    openSet.splice(lowestIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    
    // Add to visited nodes for visualization
    if (!(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedNodes.push({ x: current.x, y: current.y });
    }
    
    // Check all neighbors
    for (let i = 0; i < 4; i++) {
      const nx = current.x + dx[i];
      const ny = current.y + dy[i];
      
      // Skip if not walkable or already in closedSet
      if (!isWalkable(nx, ny) || closedSet.has(`${nx},${ny}`)) {
        continue;
      }
      
      // Calculate g score (distance from start)
      const g = current.g + 1;
      
      // Check if this path is better than any previous one
      let isNewPath = true;
      for (let j = 0; j < openSet.length; j++) {
        if (openSet[j].x === nx && openSet[j].y === ny) {
          if (g < openSet[j].g) {
            openSet[j].g = g;
            openSet[j].f = g + heuristic({ x: nx, y: ny }, end);
            openSet[j].parent = current;
          }
          isNewPath = false;
          break;
        }
      }
      
      // If it's a new path, add to openSet
      if (isNewPath) {
        const h = heuristic({ x: nx, y: ny }, end);
        openSet.push({
          x: nx,
          y: ny,
          f: g + h,
          g: g,
          parent: current
        });
      }
    }
  }
  
  // No path found
  return [[], visitedNodes];
}

// Dijkstra's Algorithm
function dijkstraSearch(start, end) {
  // Priority queue (simple array implementation)
  const openSet = [{ x: start.x, y: start.y, dist: 0, parent: null }];
  const closedSet = new Set(); // Visited nodes
  const visitedNodes = [];
  
  while (openSet.length > 0) {
    // Find node with lowest distance
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].dist < openSet[lowestIndex].dist) {
        lowestIndex = i;
      }
    }
    
    const current = openSet[lowestIndex];
    
    // Check if we reached the end
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return [path.reverse(), visitedNodes];
    }
    
    // Remove current from openSet and add to closedSet
    openSet.splice(lowestIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    
    // Add to visited nodes for visualization
    if (!(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedNodes.push({ x: current.x, y: current.y });
    }
    
    // Check all neighbors
    for (let i = 0; i < 4; i++) {
      const nx = current.x + dx[i];
      const ny = current.y + dy[i];
      
      // Skip if not walkable or already in closedSet
      if (!isWalkable(nx, ny) || closedSet.has(`${nx},${ny}`)) {
        continue;
      }
      
      // Calculate distance (all edges have weight 1)
      const dist = current.dist + 1;
      
      // Check if this path is better than any previous one
      let isNewPath = true;
      for (let j = 0; j < openSet.length; j++) {
        if (openSet[j].x === nx && openSet[j].y === ny) {
          if (dist < openSet[j].dist) {
            openSet[j].dist = dist;
            openSet[j].parent = current;
          }
          isNewPath = false;
          break;
        }
      }
      
      // If it's a new path, add to openSet
      if (isNewPath) {
        openSet.push({
          x: nx,
          y: ny,
          dist: dist,
          parent: current
        });
      }
    }
  }
  
  // No path found
  return [[], visitedNodes];
}

// Breadth-First Search Algorithm
function breadthFirstSearch(start, end) {
  // Queue for BFS
  const queue = [{ x: start.x, y: start.y, parent: null }];
  const visited = new Set([`${start.x},${start.y}`]);
  const visitedNodes = [];
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Check if we reached the end
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return [path.reverse(), visitedNodes];
    }
    
    // Add to visited nodes for visualization
    if (!(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedNodes.push({ x: current.x, y: current.y });
    }
    
    // Check all neighbors
    for (let i = 0; i < 4; i++) {
      const nx = current.x + dx[i];
      const ny = current.y + dy[i];
      
      // Skip if not walkable or already visited
      if (!isWalkable(nx, ny) || visited.has(`${nx},${ny}`)) {
        continue;
      }
      
      // Mark as visited and add to queue
      visited.add(`${nx},${ny}`);
      queue.push({
        x: nx,
        y: ny,
        parent: current
      });
    }
  }
  
  // No path found
  return [[], visitedNodes];
}

// Depth-First Search Algorithm
function depthFirstSearch(start, end) {
  // Stack for DFS
  const stack = [{ x: start.x, y: start.y, parent: null }];
  const visited = new Set([`${start.x},${start.y}`]);
  const visitedNodes = [];
  
  while (stack.length > 0) {
    const current = stack.pop();
    
    // Check if we reached the end
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return [path.reverse(), visitedNodes];
    }
    
    // Add to visited nodes for visualization
    if (!(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedNodes.push({ x: current.x, y: current.y });
    }
    
    // Check all neighbors
    for (let i = 0; i < 4; i++) {
      const nx = current.x + dx[i];
      const ny = current.y + dy[i];
      
      // Skip if not walkable or already visited
      if (!isWalkable(nx, ny) || visited.has(`${nx},${ny}`)) {
        continue;
      }
      
      // Mark as visited and add to stack
      visited.add(`${nx},${ny}`);
      stack.push({
        x: nx,
        y: ny,
        parent: current
      });
    }
  }
  
  // No path found
  return [[], visitedNodes];
}

// Animate the solution
function animateSolution(visitedNodes, path) {
  // Calculate delay based on animation speed
  const baseDelay = 101 - animationSpeed; // Invert so higher value = faster
  
  // Animate visited cells
  visitedNodes.forEach((cell, index) => {
    const timeout = setTimeout(() => {
      // Mark cell as visited
      if (maze[cell.y][cell.x] === EMPTY) {
        maze[cell.y][cell.x] = VISITED;
      }
      drawMaze();
    }, index * baseDelay / 2);
    animationTimeouts.push(timeout);
  });
  
  // Animate path after visited cells
  const pathStartDelay = visitedNodes.length * baseDelay / 2;
  
  // Only animate path if one was found
  if (path.length > 0) {
    path.forEach((cell, index) => {
      // Skip start and end nodes
      if ((cell.x === startNode.x && cell.y === startNode.y) ||
          (cell.x === endNode.x && cell.y === endNode.y)) {
        return;
      }
      
      const timeout = setTimeout(() => {
        // Mark cell as path
        maze[cell.y][cell.x] = PATH;
        drawMaze();
      }, pathStartDelay + index * baseDelay);
      animationTimeouts.push(timeout);
    });
  } else {
    // No path found
    const timeout = setTimeout(() => {
      alert('No path found!');
    }, pathStartDelay);
    animationTimeouts.push(timeout);
  }
}

// Initialize everything
function init() {
  console.log("Initializing maze solver...");
  
  // Set max value for size slider
  sizeSlider.max = MAX_MAZE_SIZE;
  
  // Initialize canvas and maze
  initCanvas();
  createEmptyMaze();
  setupEventListeners();
  drawMaze();
  
  // Generate a maze after a short delay
  setTimeout(generateMaze, 500);
}

// Start when the page is loaded
window.onload = function() {
  console.log("Window loaded, initializing...");
  init();
};

// Also try to initialize immediately
init();
