// Interactive Portfolio Page JavaScript

// DOM Elements
const bgColorInput = document.getElementById('bg-color');
const textColorInput = document.getElementById('text-color');
const accentColorInput = document.getElementById('accent-color');
const nameInput = document.getElementById('name-input');
const titleInput = document.getElementById('title-input');
const aboutInput = document.getElementById('about-input');
const fontSizeInput = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const borderRadiusInput = document.getElementById('border-radius');
const borderRadiusValue = document.getElementById('border-radius-value');
const avatarSelect = document.getElementById('avatar-select');
const resetBtn = document.getElementById('reset-btn');
const randomBtn = document.getElementById('random-btn');

// Preview Elements
const preview = document.getElementById('preview');
const previewName = document.getElementById('preview-name');
const previewTitle = document.getElementById('preview-title');
const previewAbout = document.getElementById('preview-about');
const avatarContainer = document.getElementById('avatar-container');

// Code Display Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const codeContents = document.querySelectorAll('.code-content');
const htmlCode = document.getElementById('html-code');
const cssCode = document.getElementById('css-code');
const jsCode = document.getElementById('js-code');

// Default values
const defaults = {
  bgColor: '#f0f8ff',
  textColor: '#333333',
  accentColor: '#4a6bdf',
  name: 'Awesome Coder',
  title: 'Future Software Engineer',
  about: 'I love coding and building cool things with computers! I\'m learning how to make websites and games.',
  fontSize: 16,
  borderRadius: 10,
  avatar: 'none'
};

// Avatar images
const avatars = {
  none: '',
  boy1: 'https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_640.png',
  boy2: 'https://cdn.pixabay.com/photo/2016/03/31/20/27/avatar-1295773_640.png',
  girl1: 'https://cdn.pixabay.com/photo/2016/03/31/20/31/amazed-1295833_640.png',
  girl2: 'https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_640.png',
  robot: 'https://cdn.pixabay.com/photo/2017/01/31/15/33/robot-2025366_640.png'
};

// Update the preview based on inputs
function updatePreview() {
  // Update colors
  document.documentElement.style.setProperty('--bg-color', bgColorInput.value);
  document.documentElement.style.setProperty('--text-color', textColorInput.value);
  document.documentElement.style.setProperty('--accent-color', accentColorInput.value);
  
  // Update content
  previewName.textContent = nameInput.value;
  previewTitle.textContent = titleInput.value;
  previewAbout.textContent = aboutInput.value;
  
  // Update layout
  document.documentElement.style.setProperty('--font-size', `${fontSizeInput.value}px`);
  document.documentElement.style.setProperty('--border-radius', `${borderRadiusInput.value}px`);
  
  // Update avatar
  if (avatarSelect.value === 'none') {
    avatarContainer.innerHTML = '';
  } else {
    avatarContainer.innerHTML = `<img src="${avatars[avatarSelect.value]}" alt="Avatar">`;
  }
  
  // Update code display
  updateCodeDisplay();
}

// Reset to default values
function resetToDefaults() {
  bgColorInput.value = defaults.bgColor;
  textColorInput.value = defaults.textColor;
  accentColorInput.value = defaults.accentColor;
  nameInput.value = defaults.name;
  titleInput.value = defaults.title;
  aboutInput.value = defaults.about;
  fontSizeInput.value = defaults.fontSize;
  fontSizeValue.textContent = `${defaults.fontSize}px`;
  borderRadiusInput.value = defaults.borderRadius;
  borderRadiusValue.textContent = `${defaults.borderRadius}px`;
  avatarSelect.value = defaults.avatar;
  
  updatePreview();
}

// Generate random design
function generateRandomDesign() {
  // Random colors
  bgColorInput.value = getRandomColor(true); // Light color
  textColorInput.value = getRandomColor(false); // Dark color
  accentColorInput.value = getRandomColor(false); // Vibrant color
  
  // Random layout
  fontSizeInput.value = Math.floor(Math.random() * (24 - 14) + 14); // 14-24px
  fontSizeValue.textContent = `${fontSizeInput.value}px`;
  borderRadiusInput.value = Math.floor(Math.random() * 50); // 0-50px
  borderRadiusValue.textContent = `${borderRadiusInput.value}px`;
  
  // Random avatar
  const avatarKeys = Object.keys(avatars);
  avatarSelect.value = avatarKeys[Math.floor(Math.random() * avatarKeys.length)];
  
  updatePreview();
}

// Generate a random color
function getRandomColor(light) {
  let r, g, b;
  if (light) {
    // Generate lighter colors for background
    r = Math.floor(Math.random() * 55) + 200; // 200-255
    g = Math.floor(Math.random() * 55) + 200; // 200-255
    b = Math.floor(Math.random() * 55) + 200; // 200-255
  } else {
    // Generate darker colors for text and accent
    r = Math.floor(Math.random() * 200);
    g = Math.floor(Math.random() * 200);
    b = Math.floor(Math.random() * 200);
  }
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Update the code display
function updateCodeDisplay() {
  // HTML code sample
  htmlCode.textContent = `<!DOCTYPE html>
<html>
<head>
  <title>${nameInput.value}'s Portfolio</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>${nameInput.value}</h1>
    <h2>${titleInput.value}</h2>
  </header>
  
  <section class="about">
    <h3>About Me</h3>
    <p>${aboutInput.value}</p>
  </section>
  
  <!-- More sections would go here -->
  
  <footer>
    <p>Made with ❤️ by ${nameInput.value}</p>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>`;

  // CSS code sample
  cssCode.textContent = `/* CSS Styles */
:root {
  --bg-color: ${bgColorInput.value};
  --text-color: ${textColorInput.value};
  --accent-color: ${accentColorInput.value};
  --font-size: ${fontSizeInput.value}px;
  --border-radius: ${borderRadiusInput.value}px;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: 'Nunito', sans-serif;
  font-size: var(--font-size);
}

header {
  text-align: center;
  padding: 20px;
}

h1, h2, h3 {
  color: var(--accent-color);
}

section {
  background-color: white;
  padding: 20px;
  margin: 20px 0;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* More styles would go here */`;

  // JavaScript code sample
  jsCode.textContent = `// JavaScript for interactivity
document.addEventListener('DOMContentLoaded', function() {
  console.log('Welcome to ${nameInput.value}\'s portfolio!');
  
  // Example of changing colors with JavaScript
  function changeTheme(bgColor, textColor, accentColor) {
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }
  
  // More JavaScript would go here
});
`;
}

// Switch between code tabs
function switchTab(tab) {
  // Remove active class from all tabs and contents
  tabBtns.forEach(btn => btn.classList.remove('active'));
  codeContents.forEach(content => content.classList.remove('active'));
  
  // Add active class to selected tab and content
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`${tab}-code`).classList.add('active');
}

// Add CSS variables to the document
function addCSSVariables() {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --bg-color: ${defaults.bgColor};
      --text-color: ${defaults.textColor};
      --accent-color: ${defaults.accentColor};
      --font-size: ${defaults.fontSize}px;
      --border-radius: ${defaults.borderRadius}px;
    }
    
    .portfolio-preview {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-size: var(--font-size);
    }
    
    .portfolio-preview h1, 
    .portfolio-preview h2, 
    .portfolio-preview h3 {
      color: var(--accent-color);
    }
    
    .portfolio-about,
    .portfolio-skills,
    .portfolio-projects,
    .project-card {
      border-radius: var(--border-radius);
    }
    
    .skill-progress {
      background-color: var(--accent-color);
    }
    
    .project-card h4 {
      color: var(--accent-color);
    }
  `;
  document.head.appendChild(style);
}

// Event listeners
function initEventListeners() {
  // Color inputs
  bgColorInput.addEventListener('input', updatePreview);
  textColorInput.addEventListener('input', updatePreview);
  accentColorInput.addEventListener('input', updatePreview);
  
  // Content inputs
  nameInput.addEventListener('input', updatePreview);
  titleInput.addEventListener('input', updatePreview);
  aboutInput.addEventListener('input', updatePreview);
  
  // Layout inputs
  fontSizeInput.addEventListener('input', function() {
    fontSizeValue.textContent = `${this.value}px`;
    updatePreview();
  });
  
  borderRadiusInput.addEventListener('input', function() {
    borderRadiusValue.textContent = `${this.value}px`;
    updatePreview();
  });
  
  // Avatar select
  avatarSelect.addEventListener('change', updatePreview);
  
  // Buttons
  resetBtn.addEventListener('click', resetToDefaults);
  randomBtn.addEventListener('click', generateRandomDesign);
  
  // Code tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      switchTab(this.getAttribute('data-tab'));
    });
  });
}

// Initialize the app
function init() {
  addCSSVariables();
  initEventListeners();
  updateCodeDisplay();
}

// Start the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
