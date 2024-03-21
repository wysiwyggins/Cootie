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
}

function draw() {
  if (!gameStarted) {
      background(backgroundColors[0]);
      fill(255);
      text("Press Space to Start", width / 2, height / 2);
      return;
  }
  
  if (isFirstAnimation) {
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
          image(colorImages[(currentImage - 1 + colorImages.length) % colorImages.length], 0, -50, width, height);
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
                  console.log(`Second animation letter: ${letter}, index: ${letterIndex}`);
                  background(lastBackgroundColor);
                  image(numberImages[currentImage], 0, -50, width, height);
                  currentImage = (currentImage + 1) % numberImages.length;
              }
              imgTimer++;
          } 
          else {
              // Prepare for the third animation
              let lastImageIndex = (currentImage - 1 + numberImages.length) % numberImages.length;
              individualNumbers = lastImageIndex % 2 === 0 ? [3, 4, 7, 8] : [1, 2, 5, 6];

              isThirdAnimation = true;
              isThirdAnimationStarted = false; // Ensure the third animation setup runs properly
              pauseTimer = 0; // Reset pause timer for a brief pause before the third animation
              imgTimer = 0; // Reset timer for the third animation
              currentImage = 0; // Reset for the third animation
          }
      }
  } 
  else if (isThirdAnimation && !isFinalStage) {
    if (!isThirdAnimationStarted) { 
      background(lastBackgroundColor); // Redraw the background only once
      image(numberImages[currentImage], 0, -50, width, height); // Keep the last image of the second animation
      isThirdAnimationStarted = true; // Ensure this setup runs only once
    }

    if (imgTimer % 13 === 0) {
        let numIndex = individualNumbers[currentImage];
        // Calculate the position and size of the image.
        let imgX = (width / 2) - (individualNumberImages[numIndex].width / 4);
        let imgY = 50;
        let imgW = individualNumberImages[numIndex].width / 2;
        let imgH = individualNumberImages[numIndex].height / 2;
        fill(lastBackgroundColor);
        noStroke();
        rect(imgX, imgY, imgW, imgH);
        image(individualNumberImages[numIndex], imgX, imgY, imgW, imgH);
        individualNumberSounds[numIndex].play();

        currentImage = (currentImage + 1) % individualNumbers.length;
    }
    imgTimer++;
  }
  
  if (isFinalStage) {
    if (pauseTimer < 15) {
        // Apply a brief pause before starting the final stage
        pauseTimer++;
    } else if (pauseTimer === 15) {
        if (!paperFlipSound.isPlaying()) {
            paperFlipSound.play();
        }
        pauseTimer++; // Increment to avoid replaying the sound
    } else {
        // Clear the canvas with the current background color and show the final image
        background(lastBackgroundColor);
        // Adjust positioning if necessary to place the image at the bottom of the canvas
        image(cootieOpenImage, (width - cootieOpenImage.width) / 2, height - cootieOpenImage.height);
    }
}
}

function keyPressed() {
  if (key === ' ' && !gameStarted) {
    gameStarted = true;
    isFirstAnimation = true;
    imgTimer = 0; // Correctly initializing imgTimer
  } else if (key === ' ' && gameStarted && !isSecondAnimation) {
    console.log(`Ending first animation on color: ${colorToNameMap[lastBackgroundColor]}, image index: ${currentImage}`);
    isFirstAnimation = false; // Stop first animation
    isSecondAnimation = true; // Signal start of second animation phase
    pauseTimer = 0; // Correctly initializing pauseTimer
    imgTimer = 1; // Start imgTimer at 1 for the second animation
    currentImage = 0; // Reset for the second animation
    letterIndex = 0; // Reset letter index for the second animation

  } 
  else if (key === ' ' && isThirdAnimation) {
    isThirdAnimation = false; // Stop the third animation
    isFinalStage = true; // Trigger the final stage
    isThirdAnimationStarted = false; // Reset the third animation flag
    pauseTimer = 0; // Reset the pause timer for the brief pause
    loop(); // Ensure the draw loop is running if previously stopped with noLoop()
  }
}
