// Ultra-Simple Maze Solver - Guaranteed to work

// Canvas setup
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit container
function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth - 24; // Adjust for padding
  canvas.height = container.clientHeight - 60; // Adjust for header and padding
  
  // Redraw maze if it exists
  if (maze) {
    drawMaze();
  }
}

// Initial resize
resizeCanvas();

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Maze configuration
let mazeSize = 15;
let wallDensity = 30;
let animationSpeed = 50;
let selectedAlgorithm = 'astar';

// Maze variables
let maze = null;
let startNode = { x: 1, y: 1 };
let endNode = { x: 0, y: 0 }; // Will be set based on maze size
let cellSize = 0;
let visitedCells = [];
let pathCells = [];
let isAnimating = false;
let animationTimeouts = [];

// Cell types
const EMPTY = 0;
const WALL = 1;
const START = 2;
const END = 3;
const VISITED = 4;
const PATH = 5;

// Direction vectors for neighbors (up, right, down, left)
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

// Initialize the maze
function initializeMaze() {
  // Calculate cell size based on canvas dimensions and maze size
  cellSize = Math.min(
    Math.floor(canvas.width / mazeSize),
    Math.floor(canvas.height / mazeSize)
  );
  
  // Create a new maze grid
  maze = Array(mazeSize).fill().map(() => Array(mazeSize).fill(EMPTY));
  
  // Reset path and visited cells
  visitedCells = [];
  pathCells = [];
  
  // Set default start and end positions
  startNode = { x: 1, y: 1 };
  endNode = { x: mazeSize - 2, y: mazeSize - 2 };
  
  // Mark start and end in the maze
  maze[startNode.y][startNode.x] = START;
  maze[endNode.y][endNode.x] = END;
  
  // Draw the maze
  drawMaze();
}

// Generate a random maze
function generateMaze() {
  // Clear any ongoing animations
  clearAnimations();
  
  // Initialize maze
  initializeMaze();
  
  // Randomly place walls based on wall density
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      // Skip start and end nodes
      if ((x === startNode.x && y === startNode.y) ||
          (x === endNode.x && y === endNode.y)) {
        continue;
      }
      
      // Add walls based on density
      if (Math.random() * 100 < wallDensity) {
        maze[y][x] = WALL;
      }
    }
  }
  
  // Ensure there's a path from start to end
  ensurePath();
  
  // Draw the maze
  drawMaze();
}

// Ensure there's at least one path from start to end
function ensurePath() {
  // Create a simple path from start to end
  let currentX = startNode.x;
  let currentY = startNode.y;
  
  // First go horizontally to the same x as end
  while (currentX !== endNode.x) {
    currentX += (endNode.x > currentX) ? 1 : -1;
    maze[currentY][currentX] = EMPTY;
  }
  
  // Then go vertically to the end
  while (currentY !== endNode.y) {
    currentY += (endNode.y > currentY) ? 1 : -1;
    maze[currentY][currentX] = EMPTY;
  }
  
  // Make sure start and end are properly marked
  maze[startNode.y][startNode.x] = START;
  maze[endNode.y][endNode.x] = END;
}

// Clear the maze
function clearMaze() {
  // Clear any ongoing animations
  clearAnimations();
  
  // Initialize maze
  initializeMaze();
  
  // Make all cells empty
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      maze[y][x] = EMPTY;
    }
  }
  
  // Reset start and end positions
  maze[startNode.y][startNode.x] = START;
  maze[endNode.y][endNode.x] = END;
  
  // Draw the maze
  drawMaze();
}

// Draw the maze on the canvas
function drawMaze() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Calculate the offset to center the maze
  const offsetX = (canvas.width - cellSize * mazeSize) / 2;
  const offsetY = (canvas.height - cellSize * mazeSize) / 2;
  
  // Draw background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw maze cells
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      const cellX = offsetX + x * cellSize;
      const cellY = offsetY + y * cellSize;
      
      // Draw cell based on its type
      switch (maze[y][x]) {
        case WALL:
          ctx.fillStyle = '#333';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          break;
        case START:
          ctx.fillStyle = '#4a6baf';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          break;
        case END:
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          break;
        case VISITED:
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          break;
        case PATH:
          ctx.fillStyle = '#2ecc71';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          break;
        default: // EMPTY
          ctx.fillStyle = '#fff';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          ctx.strokeStyle = '#eee';
          ctx.strokeRect(cellX, cellY, cellSize, cellSize);
      }
    }
  }
}

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

// Find path using the selected algorithm
function findPath(mazeCopy, start, end, algorithm, visualize = true) {
  // Reset visited and path cells for visualization
  if (visualize) {
    // Reset the maze (keeping walls, start, and end)
    for (let y = 0; y < mazeSize; y++) {
      for (let x = 0; x < mazeSize; x++) {
        if (maze[y][x] === VISITED || maze[y][x] === PATH) {
          maze[y][x] = EMPTY;
        }
      }
    }
    visitedCells = [];
    pathCells = [];
  }
  
  // Different algorithms
  switch (algorithm) {
    case 'astar':
      return aStarSearch(start, end, visualize);
    case 'dijkstra':
      return dijkstraSearch(start, end, visualize);
    case 'bfs':
      return breadthFirstSearch(start, end, visualize);
    case 'dfs':
      return depthFirstSearch(start, end, visualize);
    default:
      return aStarSearch(start, end, visualize);
  }
}

// A* Search Algorithm
function aStarSearch(start, end, visualize) {
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
      
      // Visualize the path if requested
      if (visualize) {
        animateSolution(path.reverse());
      }
      
      return path.reverse();
    }
    
    // Remove current from openSet and add to closedSet
    openSet.splice(lowestIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    
    // Add to visited cells for visualization
    if (visualize && !(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedCells.push({ x: current.x, y: current.y });
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
  return [];
}

// Dijkstra's Algorithm
function dijkstraSearch(start, end, visualize) {
  // Priority queue (simple array implementation)
  const openSet = [{ x: start.x, y: start.y, dist: 0, parent: null }];
  const closedSet = new Set(); // Visited nodes
  
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
      
      // Visualize the path if requested
      if (visualize) {
        animateSolution(path.reverse());
      }
      
      return path.reverse();
    }
    
    // Remove current from openSet and add to closedSet
    openSet.splice(lowestIndex, 1);
    closedSet.add(`${current.x},${current.y}`);
    
    // Add to visited cells for visualization
    if (visualize && !(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedCells.push({ x: current.x, y: current.y });
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
  return [];
}

// Breadth-First Search Algorithm
function breadthFirstSearch(start, end, visualize) {
  // Queue for BFS
  const queue = [{ x: start.x, y: start.y, parent: null }];
  const visited = new Set([`${start.x},${start.y}`]);
  
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
      
      // Visualize the path if requested
      if (visualize) {
        animateSolution(path.reverse());
      }
      
      return path.reverse();
    }
    
    // Add to visited cells for visualization
    if (visualize && !(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedCells.push({ x: current.x, y: current.y });
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
  return [];
}

// Depth-First Search Algorithm
function depthFirstSearch(start, end, visualize) {
  // Stack for DFS
  const stack = [{ x: start.x, y: start.y, parent: null }];
  const visited = new Set([`${start.x},${start.y}`]);
  
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
      
      // Visualize the path if requested
      if (visualize) {
        animateSolution(path.reverse());
      }
      
      return path.reverse();
    }
    
    // Add to visited cells for visualization
    if (visualize && !(current.x === start.x && current.y === start.y) && 
        !(current.x === end.x && current.y === end.y)) {
      visitedCells.push({ x: current.x, y: current.y });
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
  return [];
}

// Animate the solution
function animateSolution(path) {
  isAnimating = true;
  
  // Calculate delay based on animation speed
  const baseDelay = 101 - animationSpeed; // Invert so higher value = faster
  
  // Animate visited cells
  visitedCells.forEach((cell, index) => {
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
  const pathStartDelay = visitedCells.length * baseDelay / 2;
  
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
        
        // Check if this is the last node in the path
        if (index === path.length - 1) {
          isAnimating = false;
        }
      }, pathStartDelay + index * baseDelay);
      animationTimeouts.push(timeout);
    });
  } else {
    // No path found
    const timeout = setTimeout(() => {
      isAnimating = false;
      alert('No path found!');
    }, pathStartDelay);
    animationTimeouts.push(timeout);
  }
}

// Clear all animations
function clearAnimations() {
  // Clear all timeouts
  animationTimeouts.forEach(timeout => clearTimeout(timeout));
  animationTimeouts = [];
  isAnimating = false;
}

// Solve the maze using the selected algorithm
function solveMaze() {
  // Clear any ongoing animations
  clearAnimations();
  
  // Reset visited and path cells
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      if (maze[y][x] === VISITED || maze[y][x] === PATH) {
        maze[y][x] = EMPTY;
      }
    }
  }
  visitedCells = [];
  pathCells = [];
  
  // Find path using the selected algorithm
  findPath(maze, startNode, endNode, selectedAlgorithm, true);
}

// Handle mouse interactions
let isDragging = false;
let draggedNode = null;

canvas.addEventListener('mousedown', (e) => {
  if (isAnimating) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Calculate the offset to center the maze
  const offsetX = (canvas.width - cellSize * mazeSize) / 2;
  const offsetY = (canvas.height - cellSize * mazeSize) / 2;
  
  // Convert mouse coordinates to maze coordinates
  const gridX = Math.floor((mouseX - offsetX) / cellSize);
  const gridY = Math.floor((mouseY - offsetY) / cellSize);
  
  // Check if coordinates are within maze bounds
  if (isValid(gridX, gridY)) {
    // Check if clicking on start or end node
    if (gridX === startNode.x && gridY === startNode.y) {
      isDragging = true;
      draggedNode = 'start';
    } else if (gridX === endNode.x && gridY === endNode.y) {
      isDragging = true;
      draggedNode = 'end';
    } else {
      // Toggle wall
      if (maze[gridY][gridX] === EMPTY) {
        maze[gridY][gridX] = WALL;
      } else if (maze[gridY][gridX] === WALL) {
        maze[gridY][gridX] = EMPTY;
      }
      drawMaze();
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || isAnimating) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Calculate the offset to center the maze
  const offsetX = (canvas.width - cellSize * mazeSize) / 2;
  const offsetY = (canvas.height - cellSize * mazeSize) / 2;
  
  // Convert mouse coordinates to maze coordinates
  const gridX = Math.floor((mouseX - offsetX) / cellSize);
  const gridY = Math.floor((mouseY - offsetY) / cellSize);
  
  // Check if coordinates are within maze bounds
  if (isValid(gridX, gridY)) {
    // Move the dragged node
    if (draggedNode === 'start') {
      // Clear old start position
      maze[startNode.y][startNode.x] = EMPTY;
      
      // Set new start position
      startNode.x = gridX;
      startNode.y = gridY;
      maze[startNode.y][startNode.x] = START;
    } else if (draggedNode === 'end') {
      // Clear old end position
      maze[endNode.y][endNode.x] = EMPTY;
      
      // Set new end position
      endNode.x = gridX;
      endNode.y = gridY;
      maze[endNode.y][endNode.x] = END;
    }
    
    // Redraw the maze
    drawMaze();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  draggedNode = null;
});

document.getElementById('generate-maze').addEventListener('click', generateMaze);
document.getElementById('clear-maze').addEventListener('click', clearMaze);
document.getElementById('solve-btn').addEventListener('click', solveMaze);
document.getElementById('reset-button').addEventListener('click', () => {
  clearAnimations();
  initializeMaze();
});

// Algorithm selection buttons
const algorithmButtons = document.querySelectorAll('.algorithm-button');
algorithmButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    algorithmButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Set selected algorithm
    selectedAlgorithm = button.id.replace('algorithm-', '');
  });
});

// Initialize the maze on page load
initializeMaze();

// Generate a maze on page load
setTimeout(generateMaze, 500);
