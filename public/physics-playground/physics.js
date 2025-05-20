// Physics Playground using Matter.js

// Module aliases for Matter.js components
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Composite = Matter.Composite,
      Composites = Matter.Composites,
      Constraint = Matter.Constraint,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Events = Matter.Events,
      World = Matter.World;

// Create engine and world
const engine = Engine.create(),
      world = engine.world;

// Set initial gravity
engine.gravity.y = 1;

// Get the canvas element
const canvas = document.getElementById('physics-canvas');

// Create renderer
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: canvas.parentElement.clientWidth - 24, // Adjust for padding
    height: canvas.parentElement.clientHeight - 60, // Adjust for header and padding
    wireframes: false,
    background: '#fff',
    showAngleIndicator: false
  }
});

// Run the renderer
Render.run(render);

// Create runner
const runner = Runner.create();
Runner.run(runner, engine);

// Add walls to contain objects
const wallOptions = { 
  isStatic: true, 
  render: { 
    fillStyle: '#e9ecf3',
    strokeStyle: '#d0d7e6',
    lineWidth: 1
  }
};

const walls = [
  // Bottom wall
  Bodies.rectangle(
    render.options.width / 2, 
    render.options.height + 25, 
    render.options.width, 
    50, 
    wallOptions
  ),
  // Left wall
  Bodies.rectangle(
    -25, 
    render.options.height / 2, 
    50, 
    render.options.height, 
    wallOptions
  ),
  // Right wall
  Bodies.rectangle(
    render.options.width + 25, 
    render.options.height / 2, 
    50, 
    render.options.height, 
    wallOptions
  ),
  // Top wall
  Bodies.rectangle(
    render.options.width / 2, 
    -25, 
    render.options.width, 
    50, 
    wallOptions
  )
];

World.add(world, walls);

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

World.add(world, mouseConstraint);

// Keep the mouse in sync with rendering
render.mouse = mouse;

// Object creation functions
function createCircle(x, y, radius = 25) {
  const circle = Bodies.circle(x, y, radius, {
    restitution: parseFloat(document.getElementById('restitution').value),
    friction: parseFloat(document.getElementById('friction').value),
    frictionAir: parseFloat(document.getElementById('air-friction').value),
    render: {
      fillStyle: getRandomColor(),
      strokeStyle: '#000',
      lineWidth: 1
    }
  });
  World.add(world, circle);
  return circle;
}

function createSquare(x, y, size = 50) {
  const square = Bodies.rectangle(x, y, size, size, {
    restitution: parseFloat(document.getElementById('restitution').value),
    friction: parseFloat(document.getElementById('friction').value),
    frictionAir: parseFloat(document.getElementById('air-friction').value),
    render: {
      fillStyle: getRandomColor(),
      strokeStyle: '#000',
      lineWidth: 1
    }
  });
  World.add(world, square);
  return square;
}

function createTriangle(x, y, size = 50) {
  const triangle = Bodies.polygon(x, y, 3, size / Math.sqrt(3), {
    restitution: parseFloat(document.getElementById('restitution').value),
    friction: parseFloat(document.getElementById('friction').value),
    frictionAir: parseFloat(document.getElementById('air-friction').value),
    render: {
      fillStyle: getRandomColor(),
      strokeStyle: '#000',
      lineWidth: 1
    }
  });
  World.add(world, triangle);
  return triangle;
}

function createPlatform(x, y, width = 200, height = 20) {
  const platform = Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    angle: Math.random() * 0.5 - 0.25, // Slight random angle
    render: {
      fillStyle: '#4a6baf',
      strokeStyle: '#3a5a9f',
      lineWidth: 1
    }
  });
  World.add(world, platform);
  return platform;
}

function createPendulum(x, y) {
  const pendulumString = Constraint.create({
    pointA: { x: x, y: y },
    bodyB: Bodies.circle(x, y + 100, 30, {
      restitution: 0.9,
      friction: 0.1,
      frictionAir: 0.001,
      render: {
        fillStyle: '#e74c3c',
        strokeStyle: '#c0392b',
        lineWidth: 1
      }
    }),
    stiffness: 0.9,
    length: 100,
    render: {
      visible: true,
      lineWidth: 2,
      strokeStyle: '#666'
    }
  });
  
  World.add(world, [pendulumString, pendulumString.bodyB]);
  return pendulumString;
}

// Utility functions
function getRandomColor() {
  const colors = [
    '#e74c3c', // Red
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f1c40f', // Yellow
    '#9b59b6', // Purple
    '#e67e22', // Orange
    '#1abc9c', // Teal
    '#34495e'  // Dark Blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function clearWorld() {
  // Get all composites in the world
  const composites = Composite.allComposites(world);
  
  // Remove all composites (like Newton's cradle)
  for (let i = 0; i < composites.length; i++) {
    World.remove(world, composites[i]);
  }
  
  // Remove all bodies except walls
  const bodies = Composite.allBodies(world);
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    // Only keep the boundary walls
    if (body !== walls[0] && body !== walls[1] && body !== walls[2] && body !== walls[3]) {
      World.remove(world, body);
    }
  }
  
  // Remove all constraints except mouse constraint
  const constraints = Composite.allConstraints(world);
  for (let i = 0; i < constraints.length; i++) {
    const constraint = constraints[i];
    if (constraint !== mouseConstraint.constraint) {
      World.remove(world, constraint);
    }
  }
}

function applyExplosionForce(position, radius = 200, force = 0.05) {
  const bodies = Composite.allBodies(world);
  
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    
    if (!body.isStatic && body !== mouseConstraint.body) {
      const distance = Matter.Vector.magnitude(
        Matter.Vector.sub(body.position, position)
      );
      
      if (distance < radius) {
        const direction = Matter.Vector.normalise(
          Matter.Vector.sub(body.position, position)
        );
        
        const forceMagnitude = (1 - distance / radius) * force;
        
        Body.applyForce(body, body.position, {
          x: direction.x * forceMagnitude,
          y: direction.y * forceMagnitude
        });
      }
    }
  }
}

// Create preset scenes
function createDominoRun() {
  clearWorld();
  
  // Create a platform for the dominoes
  const platform = Bodies.rectangle(
    render.options.width / 2, 
    render.options.height - 50, 
    render.options.width - 100, 
    20, 
    {
      isStatic: true,
      render: {
        fillStyle: '#95a5a6'
      }
    }
  );
  
  // Create dominoes
  const dominoes = [];
  const startX = 100;
  const spacing = 30;
  const dominoHeight = 60;
  const dominoWidth = 10;
  
  for (let i = 0; i < 15; i++) {
    const domino = Bodies.rectangle(
      startX + i * spacing, 
      render.options.height - 50 - (dominoHeight / 2), 
      dominoWidth, 
      dominoHeight, 
      {
        restitution: 0.1,
        friction: 0.5,
        frictionAir: 0.001,
        density: 0.1,
        render: {
          fillStyle: i % 2 === 0 ? '#3498db' : '#e74c3c'
        }
      }
    );
    dominoes.push(domino);
  }
  
  // Add a ball to start the chain reaction
  const ball = Bodies.circle(
    50, 
    render.options.height - 200, 
    20, 
    {
      restitution: 0.5,
      friction: 0.1,
      frictionAir: 0.001,
      render: {
        fillStyle: '#f1c40f'
      }
    }
  );
  
  World.add(world, [platform, ...dominoes, ball]);
}

function createNewtonsCradle() {
  clearWorld();
  
  const cradle = Composites.newtonsCradle(
    render.options.width / 2 - 100, 
    100, 
    5, // number of balls
    30, // ball size
    200 // string length
  );
  
  // Colorize the balls
  cradle.bodies.forEach((body, i) => {
    body.render.fillStyle = getRandomColor();
    body.render.strokeStyle = '#000';
    body.render.lineWidth = 1;
  });
  
  World.add(world, cradle);
  
  // Pull the first ball to the side
  Body.translate(cradle.bodies[0], { x: -100, y: 0 });
}

function createCatapult() {
  clearWorld();
  
  // Create a platform
  const platform = Bodies.rectangle(
    render.options.width / 2, 
    render.options.height - 50, 
    render.options.width - 100, 
    20, 
    {
      isStatic: true,
      render: {
        fillStyle: '#95a5a6'
      }
    }
  );
  
  // Create a pivot point
  const pivot = Bodies.circle(
    render.options.width / 2 - 100, 
    render.options.height - 100, 
    10, 
    {
      isStatic: true,
      render: {
        fillStyle: '#7f8c8d'
      }
    }
  );
  
  // Create a lever
  const lever = Bodies.rectangle(
    render.options.width / 2, 
    render.options.height - 100, 
    200, 
    10, 
    {
      density: 0.005,
      render: {
        fillStyle: '#e67e22'
      }
    }
  );
  
  // Create a constraint for the lever
  const constraint = Constraint.create({
    bodyA: lever,
    pointA: { x: -100, y: 0 },
    bodyB: pivot,
    pointB: { x: 0, y: 0 },
    stiffness: 1,
    render: {
      visible: true,
      lineWidth: 2,
      strokeStyle: '#666'
    }
  });
  
  // Create a weight to drop on one end
  const weight = Bodies.rectangle(
    render.options.width / 2 - 180, 
    render.options.height - 250, 
    40, 
    40, 
    {
      density: 0.05,
      render: {
        fillStyle: '#9b59b6'
      }
    }
  );
  
  // Create a projectile on the other end
  const projectile = Bodies.circle(
    render.options.width / 2 + 100, 
    render.options.height - 110, 
    15, 
    {
      density: 0.002,
      restitution: 0.8,
      friction: 0.01,
      render: {
        fillStyle: '#3498db'
      }
    }
  );
  
  World.add(world, [platform, pivot, lever, constraint, weight, projectile]);
}

function createPlayground() {
  clearWorld();
  
  // Add some platforms
  const platforms = [
    Bodies.rectangle(render.options.width / 4, render.options.height / 2, 200, 20, {
      isStatic: true,
      angle: Math.PI * 0.1,
      render: { fillStyle: '#3498db' }
    }),
    Bodies.rectangle(render.options.width * 3/4, render.options.height / 2, 200, 20, {
      isStatic: true,
      angle: -Math.PI * 0.1,
      render: { fillStyle: '#e74c3c' }
    }),
    Bodies.rectangle(render.options.width / 2, render.options.height * 3/4, 300, 20, {
      isStatic: true,
      render: { fillStyle: '#2ecc71' }
    })
  ];
  
  // Add some objects
  const objects = [
    Bodies.circle(render.options.width / 4, 50, 25, {
      restitution: 0.8,
      render: { fillStyle: '#f1c40f' }
    }),
    Bodies.polygon(render.options.width / 2, 50, 6, 25, {
      restitution: 0.7,
      render: { fillStyle: '#9b59b6' }
    }),
    Bodies.rectangle(render.options.width * 3/4, 50, 50, 50, {
      restitution: 0.6,
      render: { fillStyle: '#e67e22' }
    })
  ];
  
  // Add a pendulum
  const pendulum = createPendulum(render.options.width / 2, 50);
  
  World.add(world, [...platforms, ...objects]);
}

// Event listeners for controls
document.getElementById('gravity').addEventListener('input', function() {
  const value = parseFloat(this.value);
  document.getElementById('gravity-value').textContent = value.toFixed(1);
  engine.gravity.y = value;
});

document.getElementById('restitution').addEventListener('input', function() {
  const value = parseFloat(this.value);
  document.getElementById('restitution-value').textContent = value.toFixed(1);
  // This will apply to new objects only
});

document.getElementById('friction').addEventListener('input', function() {
  const value = parseFloat(this.value);
  document.getElementById('friction-value').textContent = value.toFixed(1);
  // This will apply to new objects only
});

document.getElementById('air-friction').addEventListener('input', function() {
  const value = parseFloat(this.value);
  document.getElementById('air-value').textContent = value.toFixed(2);
  // This will apply to new objects only
});

// Add shape buttons
document.getElementById('add-circle').addEventListener('click', function() {
  createCircle(
    render.options.width / 2 + (Math.random() * 100 - 50),
    50
  );
});

document.getElementById('add-square').addEventListener('click', function() {
  createSquare(
    render.options.width / 2 + (Math.random() * 100 - 50),
    50
  );
});

document.getElementById('add-triangle').addEventListener('click', function() {
  createTriangle(
    render.options.width / 2 + (Math.random() * 100 - 50),
    50
  );
});

// Special action buttons
document.getElementById('explosion-button').addEventListener('click', function() {
  applyExplosionForce(
    { x: render.options.width / 2, y: render.options.height / 2 },
    300,
    0.05
  );
});

document.getElementById('antigravity-button').addEventListener('click', function() {
  // Toggle between normal gravity and zero gravity
  if (engine.gravity.y !== 0) {
    engine.gravity.y = 0;
    this.textContent = 'Normal-G 🌍';
  } else {
    engine.gravity.y = parseFloat(document.getElementById('gravity').value);
    this.textContent = 'Zero-G 🚀';
  }
});

document.getElementById('add-platform').addEventListener('click', function() {
  createPlatform(
    render.options.width / 2 + (Math.random() * 200 - 100),
    render.options.height / 2 + (Math.random() * 200 - 100)
  );
});

document.getElementById('add-pendulum').addEventListener('click', function() {
  createPendulum(
    render.options.width / 2 + (Math.random() * 200 - 100),
    50
  );
});

// Preset scene buttons
document.getElementById('preset-domino').addEventListener('click', createDominoRun);
document.getElementById('preset-newton').addEventListener('click', createNewtonsCradle);
document.getElementById('preset-catapult').addEventListener('click', createCatapult);
document.getElementById('preset-playground').addEventListener('click', createPlayground);

// Reset button
document.getElementById('reset-button').addEventListener('click', clearWorld);

// Handle window resize
window.addEventListener('resize', function() {
  // Update canvas dimensions
  render.options.width = canvas.parentElement.clientWidth - 24;
  render.options.height = canvas.parentElement.clientHeight - 60;
  render.canvas.width = render.options.width;
  render.canvas.height = render.options.height;
  
  // Update wall positions
  walls[0].position.x = render.options.width / 2;
  walls[0].position.y = render.options.height + 25;
  walls[0].vertices = Bodies.rectangle(walls[0].position.x, walls[0].position.y, render.options.width, 50).vertices;
  
  walls[2].position.x = render.options.width + 25;
  walls[2].vertices = Bodies.rectangle(walls[2].position.x, walls[2].position.y, 50, render.options.height).vertices;
  
  walls[3].position.x = render.options.width / 2;
  walls[3].vertices = Bodies.rectangle(walls[3].position.x, walls[3].position.y, render.options.width, 50).vertices;
});

// Initialize with just a single ball
setTimeout(() => {
  clearWorld(); // Make sure we start with a clean slate
  createCircle(
    render.options.width / 2,
    render.options.height / 4,
    30
  );
}, 500);
