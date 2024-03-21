let colorImages = []; // Array to hold your images
let numberImages = []; // New array for the second animation
let toneSounds = []; // Array for the tone sounds
let individualNumberImages = [];
let individualNumberSounds = [];
let letterSounds = {}; // Object for the letter sounds
let currentImage = 0; // Index of the currently displayed image
let letterIndex = 0; // Index for the current letter in the second animation
let imgTimer = 0; // Timer to control image switching
let pauseTimer = 0; // Timer to control the pause before starting the second animation
let isRunning = false; // Initially set to false to show the start screen
let gameStarted = false; // New variable to track if the game has started
let isSecondAnimation = false; // Track if we are in the second animation phase
let isThirdAnimation = false; // New state for the third animation
let individualNumbers = []; 
let backgroundColors = [ '#ffb700','#ae413e','#81a71e', '#0089c8'];
let colorToNameMap = { // Map hex colors to names for easy lookup
  '#ffb700': 'yellow',
  '#ae413e': 'red',
  '#81a71e': 'green',
  '#0089c8': 'blue',
};
let lastBackgroundColor; // Store the last background color

function preload() {
  for (let i = 0; i < 4; i++) {
    colorImages[i] = loadImage(`/images/cootie_${i}.png`);
    numberImages[i] = loadImage(`/images/cootie-roll_${i}.png`);
    toneSounds[i] = loadSound(`/sounds/tone_${i}.wav`);
  }
  for (let i = 1; i <= 8; i++) {
    individualNumberImages[i] = loadImage(`/images/${i}.png`);
    individualNumberSounds[i] = loadSound(`/sounds/${i}.wav`);
  }
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
      background(backgroundColors[0]);
      fill(255);
      text("Press Space to Start", width / 2, height / 2);
      return;
  }
  
  if (isRunning) {
      // First animation logic
      lastBackgroundColor = backgroundColors[currentImage];
      background(lastBackgroundColor);
      image(colorImages[currentImage], 0, -50, width, height);

      if (imgTimer % 13 === 0) {
          toneSounds[currentImage % toneSounds.length].play();
          currentImage = (currentImage + 1) % colorImages.length;
      }
      imgTimer++;
  } 
  else if (isSecondAnimation && !isThirdAnimation) {
      if (pauseTimer < 15) {
          // Pause logic before starting the second animation
          pauseTimer++;
          background(lastBackgroundColor);
          image(colorImages[currentImage], 0, -50, width, height);
      } 
      else {
          // Second animation logic
          if (letterIndex < colorToNameMap[lastBackgroundColor].length) {
              if (imgTimer % 13 === 0) {
                  let letter = colorToNameMap[lastBackgroundColor].charAt(letterIndex).toLowerCase();
                  if (letterSounds[letter]) {
                      letterSounds[letter].play();
                      letterIndex++;
                  }
                  background(lastBackgroundColor);
                  image(numberImages[currentImage], 0, -50, width, height);
                  currentImage = (currentImage + 1) % numberImages.length;
              }
              imgTimer++;
          } 
          else {
              // Prepare for the third animation
              isThirdAnimation = true;
              imgTimer = 1; // Reset timer for the third animation
              currentImage = 0; // Reset index for individualNumbers
              individualNumbers = currentImage % 2 === 0 ? [3, 4, 7, 8] : [1, 2, 5, 6];
              // No need to manually pause here, as the third animation will start immediately
          }
      }
  } 
  else if (isThirdAnimation) {
      // Third animation logic
      if (imgTimer % 13 === 0) {
          let numIndex = individualNumbers[currentImage];
          image(individualNumberImages[numIndex], (width / 2) - (individualNumberImages[numIndex].width / 4), 50, individualNumberImages[numIndex].width / 2, individualNumberImages[numIndex].height / 2);
          individualNumberSounds[numIndex].play();
          currentImage = (currentImage + 1) % individualNumbers.length;
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
  else if (key === ' ' && isThirdAnimation) {
    // Logic to stop the third animation
    isThirdAnimation = false; // This will stop the third animation
    // Optional: Reset or prepare for another round or state here
  }
}
