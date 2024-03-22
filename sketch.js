const ATTRACT_MODE = 0;
const COLOR_SELECTION = 1;
const NUMBER_SET_SELECTION = 2;
const INDIVIDUAL_NUMBER_SELECTION = 3;
const REVEALED_MESSAGE = 4;
let gameState = ATTRACT_MODE;

let colorImages = [];
let numberImages = [];
let cootieOpenImage;
let toneSounds = [];
let paperFlipSound;
let individualNumberImages = [];
let individualNumberSounds = [];
let letterSounds = {};
let currentImage = 0;
let letterIndex = 0;
let imgTimer = 0;
let pauseTimer = 0;
let isFirstAnimation = false;
let gameStarted = false;
let isSecondAnimation = false;
let isThirdAnimation = false;
let isThirdAnimationStarted = false;
let isFinalStage = false;
let individualNumbers = []; 
let backgroundColors = [ '#ffb700','#ae413e','#81a71e', '#0089c8'];
let colorToNameMap = { // Map hex colors to names for easy lookup
  '#ffb700': 'yellow',
  '#ae413e': 'red',
  '#81a71e': 'green',
  '#0089c8': 'blue',
};
let lastBackgroundColor;

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
  paperFlipSound = loadSound('/sounds/paperflip.wav');
  cootieOpenImage = loadImage('/images/cootie-open.png');
}

function setup() {
  createCanvas(800, 800);
  frameRate(30);
  textFont('Georgia');
  textSize(32);
  textAlign(CENTER, CENTER);
  // Initialize game state
  gameState = ATTRACT_MODE;
}

function draw() {
  switch (gameState) {
    case ATTRACT_MODE:
      displayAttractMode();
      break;
    case COLOR_SELECTION:
      runColorSelectionAnimation();
      break;
    case NUMBER_SET_SELECTION:
      runNumberSetSelectionAnimation();
      break;
    case INDIVIDUAL_NUMBER_SELECTION:
      runIndividualNumberSelectionAnimation();
      break;
    case REVEALED_MESSAGE:
      displayRevealedMessage();
      break;
  }
}

function keyPressed() {
  if (key === ' ') {
    switch (gameState) {
      case ATTRACT_MODE:
        gameState = COLOR_SELECTION;
        console.log("Starting Color Selection Animation");
        resetForColorSelection();
        break;
      case COLOR_SELECTION:
        gameState = NUMBER_SET_SELECTION;
        console.log(`Transitioning to Number Set Selection. Last color: ${colorToNameMap[lastBackgroundColor]}`);
        prepareForNumberSetSelection();
        break;
      case NUMBER_SET_SELECTION:
        gameState = INDIVIDUAL_NUMBER_SELECTION;
        console.log("Starting Individual Number Selection Animation");
        prepareForIndividualNumberSelection();
        break;
      case INDIVIDUAL_NUMBER_SELECTION:
        gameState = REVEALED_MESSAGE;
        console.log("Revealing Message");
        prepareForMessageReveal();
        break;
      case REVEALED_MESSAGE:
        // Optionally, loop back to the attract mode or stop the game
        console.log("Game ended. Press space to restart.");
        gameState = ATTRACT_MODE;
        break;
    }
  }
}

function displayAttractMode() {
  background(backgroundColors[0]);
  fill(255);
  text("Press Space to Start", width / 2, height / 2);
}

function runColorSelectionAnimation() {
  lastBackgroundColor = backgroundColors[currentImage];
  background(lastBackgroundColor);
  image(colorImages[currentImage], 0, -50, width, height);

  if (imgTimer % 13 === 0) {
    toneSounds[currentImage % toneSounds.length].play();
    currentImage = (currentImage + 1) % colorImages.length;
  }
  imgTimer++;
}

function runNumberSetSelectionAnimation() {
  if (pauseTimer < 15) {
    pauseTimer++;
    background(lastBackgroundColor);
    image(colorImages[(currentImage - 1 + colorImages.length) % colorImages.length], 0, -50, width, height);
  } else {
    if (letterIndex < colorToNameMap[lastBackgroundColor].length) {
      performLetterSelection();
    } else {
      prepareForIndividualNumberSelection();
    }
  }
}

function performLetterSelection() {
  if (imgTimer % 13 === 0) {
    let letter = colorToNameMap[lastBackgroundColor].charAt(letterIndex).toLowerCase();
    letterSounds[letter]?.play();
    letterIndex++;
    background(lastBackgroundColor);
    image(numberImages[currentImage], 0, -50, width, height);
    currentImage = (currentImage + 1) % numberImages.length;
  }
  imgTimer++;
}

function prepareForIndividualNumberSelection() {
  let lastImageIndex = (currentImage + 1 + numberImages.length) % numberImages.length; // +1 was a hack that fixed a problem showing final image
  individualNumbers = lastImageIndex % 2 === 0 ? [3, 4, 7, 8] : [1, 2, 5, 6];

  gameState = INDIVIDUAL_NUMBER_SELECTION;
  pauseTimer = 0;
  imgTimer = 0;
  currentImage = 0;
  console.log("Transitioning to Individual Number Selection");
}

function runIndividualNumberSelectionAnimation() {
  if (!isThirdAnimationStarted) {
    prepareThirdAnimation();
  } else {
    performIndividualNumberSelection();
  }
}

function prepareThirdAnimation() {
  background(lastBackgroundColor);
  image(numberImages[currentImage + 1], 0, -50, width, height);
  isThirdAnimationStarted = true;
}

function performIndividualNumberSelection() {
  if (imgTimer % 13 === 0) {
    let numIndex = individualNumbers[currentImage];
    displayIndividualNumber(numIndex);
    currentImage = (currentImage + 1) % individualNumbers.length; // +1 was a hack that fixed a problem showing final image
  }
  imgTimer++;
}

function displayIndividualNumber(numIndex) {
  let imgX = (width / 2) - (individualNumberImages[numIndex].width / 4);
  let imgY = 50;
  fill(lastBackgroundColor);
  noStroke();
  rect(imgX, imgY, individualNumberImages[numIndex].width / 2, individualNumberImages[numIndex].height / 2);
  image(individualNumberImages[numIndex], imgX, imgY, individualNumberImages[numIndex].width / 2, individualNumberImages[numIndex].height / 2);
  individualNumberSounds[numIndex].play();
}

function displayRevealedMessage() {
  if (pauseTimer < 15) {
    pauseTimer++;
  } else if (pauseTimer === 15) {
    if (!paperFlipSound.isPlaying()) {
      paperFlipSound.play();
    }
    pauseTimer++;
  } else {
    background(lastBackgroundColor);
    image(cootieOpenImage, (width - cootieOpenImage.width) / 2, height - cootieOpenImage.height);
  }
}

function resetForColorSelection() {
  console.log("Resetting for Color Selection...");
  // Reset any necessary variables for color selection
  imgTimer = 0;
  currentImage = 0;
}

function prepareForNumberSetSelection() {
  console.log("Preparing for Number Set Selection...");
  // Reset or set up any variables for the number set selection
  imgTimer = 0;
  pauseTimer = 0;
  //letterIndex = 0; // Assuming this starts the letter animations
}

function prepareForMessageReveal() {
  console.log("Preparing for Message Reveal...");
  // Any setup needed before revealing the message
  pauseTimer = 0; // If you're using a pause before revealing
}





