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
let fortunes = [ 
  'You will forget to move your car from the street on the morning the weekly street cleaner comes, but not get a ticket.',
  'You will be in the checkout line at target and a woman you have never met will give you a coupon for the brand of air filter you are buying.',
  'The check engine light will turn on in your car, but then the next day it will turn back off.', 
  'The weird lady who tries to make long conversation with you when you are leaving your home for work and clearly have no interest in talking will not be outside when you arrive home and need to go to the bathroom.', 
  'Your biopsy will come back from the lab without any serious concerns.',
  'You will only owe five dollars on your federal taxes this year (although you were pretty sure you were getting money back)',
  "A bird will poop on your freshly washed car, leading you to discover a forgotten $5 bill in your coat pocket while looking for wipes.",
  "You will find the perfect avocado at the grocery store, only to drop it on the kitchen floor when you get home.",
  "You will get a call from a number you don't recognize, but it will be a wrong number instead of a scam.",
  "You will find a quarter on the ground, but it will be heads down.",
  "You will get a paper cut, but it won't hurt as much as you expected.",
  "You will accidentally leave your phone at home, but you won't need it all day.",
  "The next time you randomly decide to check your spam folder, you'll find an email you actually wanted to read.",
  "You will be excused from jury duty because the case will be settled out of court.",
  "You'll discover a shortcut on your daily commute that saves you a whole two minutes, which you'll use to justify hitting snooze one more time tomorrow.",
  "Your second divorce will be finalized without any major disputes.",
  "You will find a pair of sunglasses you thought you lost in the back of your closet.",
  "You will get a flat tire, but it will be in your driveway instead of on the highway.",
  "You will get a splinter, but it will come out easily.",
  "You will accidentally leave your wallet at home, but you won't need it all day.",
  "You will order a coffee and the barista will accidentally make an extra one, which they will give to you for free.",
  "You will be fired from your job and then re-hired to do the same job as a contractor for less pay and no benefits.",
  "You will be in a minor car accident, but it will be the other driver's fault and their insurance will cover the damages.",
  "You will never get a chance to use the gift card you found in your drawer.",
  "You will survive a global pandemic, a recession, and a political coup, but it will somehow feel normal and even boring.",
  ]
  let currentFortune = "";
  let displayedFortune = ""; 
  let fortuneIndex = 0;
  let fortuneTimer = 0; 
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
    toneSounds[currentImage].play();
    currentImage = (currentImage + 1) % colorImages.length;
  }
  imgTimer++;
}

function runNumberSetSelectionAnimation() {
  if (pauseTimer < 20) {
    pauseTimer++;
    background(lastBackgroundColor);
    image(colorImages[(currentImage + colorImages.length) % colorImages.length], 0, -50, width, height);
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
  console.log(`Transitioning to Individual Number Selection with last image index: ${currentImage}`);

  // This assumes that currentImage is already set to the index of the last displayed number image.
  // If currentImage seems to be one ahead, you might need to adjust it by -1 here.
  // But this adjustment should be carefully considered to ensure it's only applied when necessary.
  individualNumbers = currentImage % 2 === 0 ?  [1, 2, 5, 6]:[3, 4, 7, 8] ;

  console.log(`Current Image for individual number selection: ${currentImage}`);
  console.log(`Individual numbers set: ${individualNumbers.join(", ")}`);

  gameState = INDIVIDUAL_NUMBER_SELECTION;
  pauseTimer = 0;
  imgTimer = 0;

  // Check if an adjustment is needed to correct off-by-one errors
  currentImage = (currentImage - 1 + numberImages.length) % numberImages.length;
}



function runIndividualNumberSelectionAnimation() {
  if (!isThirdAnimationStarted) {
    background(lastBackgroundColor);
    image(numberImages[currentImage], 0, -50, width, height);
    isThirdAnimationStarted = true;
  } else {
    performIndividualNumberSelection();
  }
}

function performIndividualNumberSelection() {
  if (pauseTimer < 15) {
      pauseTimer++;
    } else if (pauseTimer === 15) {
    if (!isThirdAnimationStarted) {
      // Use the last selected number image as the starting point
      background(lastBackgroundColor);
      // Ensure the correct starting image is displayed
      image(numberImages[currentImage], 0, -50, width, height);
      isThirdAnimationStarted = true;
    } else {
      if (imgTimer % 13 === 0) {
        let numIndex = individualNumbers[currentImage % individualNumbers.length];
        displayIndividualNumber(numIndex);
        // Correctly cycle through the individual numbers
        currentImage = (currentImage + 1) % individualNumbers.length;
      }
      imgTimer++;
    }
  }
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
    textSize(24); 
    textAlign(LEFT, TOP); 
    fill(255); 
    if (fortuneIndex < currentFortune.length && fortuneTimer % 3 == 0) { 
      displayedFortune += currentFortune.charAt(fortuneIndex++);
    }
    fortuneTimer++;
    text(displayedFortune, 50, height / 2, width - 100); 
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
  imgTimer = 0;
  pauseTimer = 0;
  letterIndex = 0;
}

function prepareForMessageReveal() {
  console.log("Preparing for Message Reveal...");
  currentFortune = random(fortunes); 
  displayedFortune = ""; 
  fortuneIndex = 0; 
  fortuneTimer = 0;
  pauseTimer = 0; 
}



