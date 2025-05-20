// Turtle Graphics Implementation

// Get the canvas and its context
const canvas = document.getElementById('turtle-canvas');
const ctx = canvas.getContext('2d');

// Set up the turtle
const turtle = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 360,  // in degrees, 270 is pointing left
  isPenDown: true,
  penColor: '#4a6baf',
  penWidth: 2,
  speed: 5,  // animation speed
  steps: [],  // for step-by-step execution
  currentStep: 0,
  isAnimating: false,
  // Turtle image
  image: new Image(),
  imageLoaded: false,
  imageSize: 60
};

// Load turtle image - green turtle
turtle.image.src = './turtle.png';
turtle.image.onload = function() {
  turtle.imageLoaded = true;
  drawTurtle();
};

// Initialize the canvas
function initCanvas() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  resetTurtle();
}

// Draw the turtle at its current position and angle
function drawTurtle() {
  if (!turtle.imageLoaded) return;
  
  // Save the current context state
  ctx.save();
  
  // Translate to the turtle's position
  ctx.translate(turtle.x, turtle.y);
  
  // Rotate according to the turtle's angle (convert to radians)
  ctx.rotate(turtle.angle * Math.PI / 180);
  
  // Draw the turtle image centered with proper aspect ratio
  const size = turtle.imageSize;
  ctx.drawImage(
    turtle.image, 
    -size / 2, 
    -size / 2, 
    size, 
    size
  );
  
  // Restore the context state
  ctx.restore();
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTurtle();
  log('Canvas cleared');
}

// Reset the turtle to its initial position
function resetTurtle() {
  turtle.x = canvas.width / 2;
  turtle.y = canvas.height / 2;
  turtle.angle = 360;  // Start facing left
  turtle.isPenDown = true;
  turtle.penColor = '#4a6baf';
  turtle.penWidth = 2;
  turtle.steps = [];
  turtle.currentStep = 0;
  turtle.isAnimating = false;
  clearCanvas();
  drawTurtle();
  log('Turtle reset to center');
}

// Move the turtle forward
function forward(steps) {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'forward', val: steps });
    return;
  }
  
  const startX = turtle.x;
  const startY = turtle.y;
  
  // Calculate the new position
  const angleInRadians = turtle.angle * Math.PI / 180;
  const newX = startX + steps * Math.cos(angleInRadians);
  const newY = startY + steps * Math.sin(angleInRadians);
  
  // Draw a line if the pen is down
  if (turtle.isPenDown) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(newX, newY);
    ctx.strokeStyle = turtle.penColor;
    ctx.lineWidth = turtle.penWidth;
    ctx.stroke();
  }
  
  // Update the turtle's position
  turtle.x = newX;
  turtle.y = newY;
  
  // Redraw the turtle
  drawTurtle();
}

// Move the turtle backward
function backward(steps) {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'backward', val: steps });
    return;
  }
  forward(-steps);
}

// Turn the turtle left
function turnLeft(degrees) {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'turnLeft', val: degrees });
    return;
  }
  turtle.angle -= degrees;
  drawTurtle();
}

// Turn the turtle right
function turnRight(degrees) {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'turnRight', val: degrees });
    return;
  }
  turtle.angle += degrees;
  drawTurtle();
}

// Lift the pen (stop drawing)
function penUp() {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'penUp' });
    return;
  }
  turtle.isPenDown = false;
}

// Put the pen down (start drawing)
function penDown() {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'penDown' });
    return;
  }
  turtle.isPenDown = true;
}

// Set the pen color
function setColor(color) {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'setColor', val: color });
    return;
  }
  turtle.penColor = color;
}

// Set the pen width
function setWidth(width) {
  if (turtle.isAnimating) {
    turtle.steps.push({ cmd: 'setWidth', val: width });
    return;
  }
  turtle.penWidth = width;
}

// Log messages to the log container
function log(message) {
  const logContainer = document.getElementById('log-container');
  const logEntry = document.createElement('div');
  logEntry.textContent = message;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Clear the log
function clearLog() {
  const logContainer = document.getElementById('log-container');
  logContainer.innerHTML = '';
  log('Log cleared');
}

// Clear the code editor
function clearCode() {
  const codeEditor = document.getElementById('code-editor');
  codeEditor.value = '// Try writing turtle commands here!\n// Example: forward(100);\n';
  log('Code editor cleared');
}

// Run the code from the editor
function runCode() {
  resetTurtle();
  const code = document.getElementById('code-editor').value;
  try {
    // Execute the code
    log('Running code...');
    eval(code);
    log('Code executed successfully!');
  } catch (error) {
    console.error('Error executing code:', error);
    log('Error: ' + error.message);
    alert('Oops! There was an error in your code: ' + error.message);
  }
}

// Step through the code
function stepThroughCode() {
  if (turtle.isAnimating) return;
  
  resetTurtle();
  const code = document.getElementById('code-editor').value;
  
  try {
    // Parse the code into steps
    turtle.isAnimating = true;
    eval(code);
    turtle.isAnimating = false;
    
    // Start the animation
    turtle.currentStep = 0;
    log('Stepping through code...');
    animateSteps();
  } catch (error) {
    console.error('Error parsing code:', error);
    log('Error: ' + error.message);
    alert('Oops! There was an error in your code: ' + error.message);
    turtle.isAnimating = false;
  }
}

// Animate through the steps
function animateSteps() {
  if (turtle.currentStep >= turtle.steps.length) {
    log('Animation complete');
    return;
  }
  
  const step = turtle.steps[turtle.currentStep];
  
  switch (step.cmd) {
    case 'forward':
      forward(step.val);
      break;
    case 'backward':
      backward(step.val);
      break;
    case 'turnLeft':
      turnLeft(step.val);
      break;
    case 'turnRight':
      turnRight(step.val);
      break;
    case 'penUp':
      penUp();
      break;
    case 'penDown':
      penDown();
      break;
    case 'setColor':
      setColor(step.val);
      break;
    case 'setWidth':
      setWidth(step.val);
      break;
  }
  
  turtle.currentStep++;
  setTimeout(animateSteps, 1000 / turtle.speed);
}

// Example code snippets
const examples = {
  square: `// Draw a square
for (let i = 0; i < 4; i++) {
  forward(100);
  turnRight(90);
}`,
  star: `// Draw a star
setColor('gold');
for (let i = 0; i < 5; i++) {
  forward(100);
  turnRight(144);
}`,
  spiral: `// Draw a spiral
setColor('purple');
for (let i = 0; i < 36; i++) {
  forward(i * 5);
  turnRight(90);
}`,
  flower: `// Draw a flower
setColor('hotpink');
for (let i = 0; i < 36; i++) {
  forward(100);
  backward(100);
  turnRight(10);
}`,
  name: `// Simple Name Example
setColor('red');
setWidth(3);

// Draw a simple smiley face
// Draw the circle
for (let i = 0; i < 360; i++) {
  forward(1);
  turnRight(1);
}

// Draw the eyes
penUp();
forward(30);
turnRight(90);
forward(20);
penDown();
setColor('blue');

// Right eye
for (let i = 0; i < 360; i++) {
  forward(0.1);
  turnRight(1);
}

// Move to left eye
penUp();
backward(40);
penDown();

// Left eye
for (let i = 0; i < 360; i++) {
  forward(0.1);
  turnRight(1);
}

// Draw the smile
penUp();
forward(20);
turnLeft(90);
forward(30);
turnLeft(180);
penDown();
setColor('green');

// Draw the smile curve
for (let i = 0; i < 180; i++) {
  forward(0.5);
  turnLeft(1);
}
`
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the canvas
  initCanvas();
  
  // Run button
  document.getElementById('run-button').addEventListener('click', runCode);
  
  // Step button
  document.getElementById('step-button').addEventListener('click', stepThroughCode);
  
  // Reset button
  document.getElementById('reset-button').addEventListener('click', resetTurtle);
  
  // Clear button
  document.getElementById('clear-button').addEventListener('click', clearCanvas);
  
  // Clear log button
  document.getElementById('clear-log-button').addEventListener('click', clearLog);
  
  // Clear code button
  document.getElementById('clear-code-button').addEventListener('click', clearCode);
  
  // Example buttons
  document.querySelectorAll('.example-button').forEach(button => {
    button.addEventListener('click', function() {
      const exampleName = this.getAttribute('data-example');
      document.getElementById('code-editor').value = examples[exampleName];
      log('Loaded example: ' + exampleName);
    });
  });
  
  // Control buttons
  document.querySelectorAll('.control-button').forEach(button => {
    button.addEventListener('click', function() {
      const command = this.getAttribute('data-command');
      const editor = document.getElementById('code-editor');
      const cursorPos = editor.selectionStart;
      const textBefore = editor.value.substring(0, cursorPos);
      const textAfter = editor.value.substring(cursorPos);
      
      editor.value = textBefore + command + '\n' + textAfter;
      editor.focus();
      editor.selectionStart = editor.selectionEnd = cursorPos + command.length + 1;
      log('Added command: ' + command);
    });
  });
  
  // Initialize log
  log('Turtle Graphics ready! Try running some commands.');
});
