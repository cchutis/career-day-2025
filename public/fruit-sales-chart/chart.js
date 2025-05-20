// Fruit Sales Chart Implementation

// Default fruits with their colors
const defaultFruits = [
  { name: 'Apples', color: '#FF6384', sales: 120 },
  { name: 'Bananas', color: '#FFCE56', sales: 75 },
  { name: 'Oranges', color: '#FF9F40', sales: 55 },
  { name: 'Grapes', color: '#9966FF', sales: 40 },
  { name: 'Strawberries', color: '#FF6384', sales: 90 }
];

// Additional fruits for the "Add Fruit" feature
const additionalFruits = [
  { name: 'Watermelon', color: '#4BC0C0' },
  { name: 'Pineapple', color: '#FFCD56' },
  { name: 'Mango', color: '#FF9F40' },
  { name: 'Kiwi', color: '#36A2EB' },
  { name: 'Blueberries', color: '#9966FF' },
  { name: 'Peaches', color: '#FF6384' },
  { name: 'Cherries', color: '#C9302C' },
  { name: 'Pears', color: '#79B473' }
];

// Track current fruits in the chart
let currentFruits = [...defaultFruits];

// Reference to the chart
let salesChart;

// DOM elements
const salesChartCanvas = document.getElementById('sales-chart');
const updateBtn = document.getElementById('update-btn');
const addFruitBtn = document.getElementById('add-fruit-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const fruitInputsContainer = document.getElementById('fruit-inputs');
const chartTypeSelect = document.getElementById('chart-type');
const toggleAnimation = document.getElementById('toggle-animation');

// Initialize the chart
function initializeChart() {
  const ctx = salesChartCanvas.getContext('2d');
  
  // Create the chart
  salesChart = new Chart(ctx, {
    type: chartTypeSelect.value,
    data: {
      labels: currentFruits.map(fruit => fruit.name),
      datasets: [{
        label: 'Sales (in kg)',
        data: currentFruits.map(fruit => fruit.sales),
        backgroundColor: currentFruits.map(fruit => fruit.color),
        borderColor: currentFruits.map(fruit => fruit.color),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: toggleAnimation.checked ? 1000 : 0
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Sales (kg)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Fruit Type'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Fruit Sales Data',
          font: {
            size: 18
          }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw} kg`;
            }
          }
        }
      }
    }
  });
}

// Generate input fields for each fruit
function generateFruitInputs() {
  fruitInputsContainer.innerHTML = '';
  
  currentFruits.forEach((fruit, index) => {
    const fruitInputDiv = document.createElement('div');
    fruitInputDiv.className = 'fruit-input';
    fruitInputDiv.dataset.index = index;
    
    const fruitNameDiv = document.createElement('div');
    fruitNameDiv.className = 'fruit-name';
    
    const colorIndicator = document.createElement('span');
    colorIndicator.className = 'color-indicator';
    colorIndicator.style.backgroundColor = fruit.color;
    
    fruitNameDiv.appendChild(colorIndicator);
    fruitNameDiv.appendChild(document.createTextNode(fruit.name));
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group mb-2';
    
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control';
    input.value = fruit.sales;
    input.min = 0;
    input.max = 500;
    input.id = `fruit-${index}`;
    
    const inputGroupAppend = document.createElement('span');
    inputGroupAppend.className = 'input-group-text';
    inputGroupAppend.textContent = 'kg';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-outline-danger';
    removeButton.innerHTML = '&times;';
    removeButton.addEventListener('click', () => removeFruit(index));
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(inputGroupAppend);
    inputGroup.appendChild(removeButton);
    
    fruitInputDiv.appendChild(fruitNameDiv);
    fruitInputDiv.appendChild(inputGroup);
    
    fruitInputsContainer.appendChild(fruitInputDiv);
  });
}

// Update the chart with new data
function updateChart() {
  // Get updated values from inputs
  const fruitInputs = document.querySelectorAll('.fruit-input');
  fruitInputs.forEach(input => {
    const index = parseInt(input.dataset.index);
    const salesInput = input.querySelector('input');
    currentFruits[index].sales = parseInt(salesInput.value);
  });
  
  // Update chart data
  salesChart.data.labels = currentFruits.map(fruit => fruit.name);
  salesChart.data.datasets[0].data = currentFruits.map(fruit => fruit.sales);
  salesChart.data.datasets[0].backgroundColor = currentFruits.map(fruit => fruit.color);
  salesChart.data.datasets[0].borderColor = currentFruits.map(fruit => fruit.color);
  
  // Update chart type if changed
  salesChart.config.type = chartTypeSelect.value;
  
  // Update animation settings
  salesChart.options.animation.duration = toggleAnimation.checked ? 1000 : 0;
  
  // Update scales visibility based on chart type
  const isCartesian = ['bar', 'line'].includes(chartTypeSelect.value);
  salesChart.options.scales.y.display = isCartesian;
  salesChart.options.scales.x.display = isCartesian;
  
  // Update the chart
  salesChart.update();
}

// Add a new fruit to the chart
function addFruit() {
  // Get a random fruit from the additional fruits list
  if (additionalFruits.length === 0) {
    alert('No more fruits to add!');
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * additionalFruits.length);
  const newFruit = additionalFruits.splice(randomIndex, 1)[0];
  
  // Add random sales value
  newFruit.sales = Math.floor(Math.random() * 100) + 20;
  
  // Add to current fruits
  currentFruits.push(newFruit);
  
  // Regenerate inputs and update chart
  generateFruitInputs();
  updateChart();
}

// Remove a fruit from the chart
function removeFruit(index) {
  // Don't allow removing all fruits
  if (currentFruits.length <= 1) {
    alert('You must have at least one fruit!');
    return;
  }
  
  // Remove the fruit
  const removedFruit = currentFruits.splice(index, 1)[0];
  
  // Add it back to additional fruits if it's one of the predefined ones
  if (!defaultFruits.some(fruit => fruit.name === removedFruit.name)) {
    additionalFruits.push(removedFruit);
  }
  
  // Regenerate inputs and update chart
  generateFruitInputs();
  updateChart();
}

// Randomize the sales data
function randomizeData() {
  currentFruits.forEach(fruit => {
    fruit.sales = Math.floor(Math.random() * 200) + 20;
  });
  
  generateFruitInputs();
  updateChart();
}

// Event listeners
updateBtn.addEventListener('click', updateChart);
addFruitBtn.addEventListener('click', addFruit);
randomizeBtn.addEventListener('click', randomizeData);
chartTypeSelect.addEventListener('change', updateChart);
toggleAnimation.addEventListener('change', updateChart);

// Initialize the application
function init() {
  generateFruitInputs();
  initializeChart();
}

// Start the application when the page loads
window.addEventListener('load', init);
