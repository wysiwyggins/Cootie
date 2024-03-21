let colorImages = []; // Array to hold your images
let numberImages = []; // New array for the second animation
let toneSounds = []; // Array for the tone sounds
let letterSounds = {}; // Object for the letter sounds
let spinFrame; // Variable to hold the spinning frame image
let currentImage = 0; // Index of the currently displayed image
let letterIndex = 0; // Index for the current letter in the second animation
let imgTimer = 0; // Timer to control image switching
let pauseTimer = 0; // Timer to control the pause before starting the second animation
let isRunning = false; // Initially set to false to show the start screen
let gameStarted = false; // New variable to track if the game has started
let isSecondAnimation = false; // Track if we are in the second animation phase
let backgroundColors = ['#81a71e', '#0089c8', '#ffb700', '#ae413e']; //green, blue, yellow, red
let colorToNameMap = { // Map hex colors to names for easy lookup
  '#81a71e': 'green',
  '#0089c8': 'blue',
  '#ffb700': 'yellow',
  '#ae413e': 'red'
};
let lastBackgroundColor; // Store the last background color

function preload() {
  for (let i = 0; i < 4; i++) {
    colorImages[i] = loadImage(`/images/cootie_${i}.png`);
    numberImages[i] = loadImage(`/images/cootie-roll_${i}.png`);
    toneSounds[i] = loadSound(`/sounds/tone_${i}.wav`);
  }
  spinFrame = loadImage(`/images/cootie_spin.png`);
  // Load sounds for each letter in the color names
  "bdeglnoruwy".split('').forEach(letter => {
    letterSounds[letter] = loadSound(`/sounds/${letter}.wav`);
  });
}

function setup() {
  createCanvas(800, 800);
  frameRate(30);
  textFont('Georgia');
   textSize(32);
  textAlign(CENTER, CENTER);
}

function draw() {
  if (!gameStarted) {
    background(backgroundColors[2]);
    fill(255);
    text("Press Space to Start", width / 2, height / 2);
    return;
  }
  
  // First animation logic
  if (isRunning) {
    lastBackgroundColor = backgroundColors[currentImage]; // Update the last background color
    background(lastBackgroundColor);
    image(colorImages[currentImage], 0, -50, width, height);

    if (imgTimer % 13 === 0) {
      toneSounds[currentImage % toneSounds.length].play();
      currentImage = (currentImage + 1) % colorImages.length;
    }

    imgTimer++;
  } 
  // Logic for the pause and transition to the second animation
  else if (isSecondAnimation && pauseTimer < 15) {
    background(lastBackgroundColor);
    // Show the last image of the first animation during the pause
    image(colorImages[(currentImage - 1 + colorImages.length) % colorImages.length], 0, -50, width, height);
    pauseTimer++;
  } 
  // Second animation logic
  else if (isSecondAnimation) {
    let colorName = colorToNameMap[lastBackgroundColor];
    if (letterIndex >= colorName.length) {
      // Correctly hold the last image of the second animation
      background(lastBackgroundColor);
      image(numberImages[currentImage], 0, -50, width, height);
      return; // Ensure no further updates after completion
    }
  
    if (imgTimer % 13 === 0) {
      if (letterIndex < colorName.length) {
        let letter = colorName.charAt(letterIndex).toLowerCase();
        if (letterSounds[letter]) {
          letterSounds[letter].play(); // Play the sound for the current letter
        }
        letterIndex++;
      }
      
      background(lastBackgroundColor); // Keep background consistent
      image(numberImages[currentImage], 0, -50, width, height);
      // Increment currentImage only if more letters are remaining
      if (letterIndex < colorName.length) {
        currentImage = (currentImage + 1) % numberImages.length;
      }
    }
  
    imgTimer++;
  }
}

function keyPressed() {
  if (key === ' ' && !gameStarted) {
    gameStarted = true;
    isRunning = true;
    imgTimer = 0; // Correctly initializing imgTimer
  } else if (key === ' ' && gameStarted && !isSecondAnimation) {
    isRunning = false; // Stop first animation
    isSecondAnimation = true; // Signal start of second animation phase
    pauseTimer = 0; // Correctly initializing pauseTimer
    imgTimer = 1; // Start imgTimer at 1 for the second animation
    currentImage = 0; // Reset for the second animation
    letterIndex = 0; // Reset letter index for the second animation
  } else if (key === ' ' && isSecondAnimation && pauseTimer > 15) {
    // This toggle is only needed if you want to pause/resume the second animation
    // If the second animation should stop permanently once finished, you may not need this toggle
  }
}
