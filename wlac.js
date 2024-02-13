let bgImages = []; // Array to hold background images
let overlayImages = []; // Variable for the overlay image
let bgMusic; // Variable for the background music
let amplitude;
let offscreenGraphics;

function preload() {
  // Preload the background images
  bgImages.push(loadImage('./assets/blue-flowers-bg.png'));
  bgImages.push(loadImage('./assets/red-flowers-bg.png'));
  bgImages.push(loadImage('./assets/orange-flowers-bg.png'));
  bgImages.push(loadImage('./assets/purple-flowers-bg.png'));
  // Add as many as you have

  // Preload the overlay images
  overlayImages.push(loadImage('./assets/math-overlay.png'));
  overlayImages.push(loadImage('./assets/disco-overlay.png'));
  overlayImages.push(loadImage('./assets/ripples-overlay.png'));
  overlayImages.push(loadImage('./assets/equation-overlay.png'));
  overlayImages.push(loadImage('./assets/imagination-overlay.png'));
  overlayImages.push(loadImage('./assets/thoughtfulness-overlay.png'));
  overlayImages.push(loadImage('./assets/excitement-overlay.png'));
  overlayImages.push(loadImage('./assets/system-overlay.png'));
  overlayImages.push(loadImage('./assets/composition-overlay.png'));
  overlayImages.push(loadImage('./assets/paths-overlay.png'));
  overlayImages.push(loadImage('./assets/chaos-overlay.png'));
  // Add as many as you have

  bgMusic = loadSound('./assets/new-composition-91.mp3'); // Load your music file
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  offscreenGraphics = createGraphics(100, 100); // Off-screen canvas for analysis
  loop();
  
  bgImg = random(bgImages); // Select one at random
  overlayImg = random(overlayImages); // Select one at random

  // Dynamically adjust scaleFactor based on viewport size
  if (windowWidth >= 1800) {
    window.scaleFactor = 1;
  } else if (windowWidth >= 800) {
    window.scaleFactor = .6;
  } else {
    window.scaleFactor = 0.3;
  }

  // Create an Amplitude analyzer
  amplitude = new p5.Amplitude();
  // Patch the input to the amplitude analyzer
  amplitude.setInput(bgMusic);

  // Check if the playButton exists and then add the event listener
  const playButton = document.getElementById('playButton');
  if (playButton) {
    playButton.addEventListener('click', function() {
      if (bgMusic.isPlaying()) {
        bgMusic.pause();
        this.textContent = "♫ Play Music";
      } else {
        bgMusic.loop();
        this.textContent = "♫ Stop Music";
      }
    });
  }

  if (bgImg && overlayImg) {
    drawContentToOffscreenCanvas(bgImg);
    updatePlayButtonColor(); 
  }
}

function draw() {
  background(0);

  let alpha = 255; // Full opacity by default

  // Get the current volume level
  let currentVolume = amplitude.getLevel();

  // Map the volume to a larger range for a more noticeable effect, if desired
  let volumeMapped = map(currentVolume, 0, 1, 0, 50); // Adjust 50 to control the shift intensity

  // Prepare variables for tint
  let r, g, b, rgbalpha;

  // Check if the music is playing to decide on applying the RGB shift effect
  if (bgMusic.isPlaying() && currentVolume > 0.1) {
    // Shift RGB channels based on volume
    r = random(55, 255); // Randomly select the red component
    g = random(55, 255); // Randomly select the green component
    b = random(55, 255); // Randomly select the blue component
    tint(r, g, b, rgbalpha); // Apply the combined tint to the overlay image
  } else {
    tint(255, 255, 255, rgbalpha); // Full color with variable opacity
  }

  drawBackgroundImage(volumeMapped);
  noTint(); // Reset tint after drawing the background

  // Apply oscillating opacity to the overlay image
  let tintalpha = map(sin(millis() / 1000), -1, 1, 50, 200);
  tint(255, 255, 255, tintalpha);

  drawOverlayImage(volumeMapped);

  // Reset tint for future drawing
  noTint();
  blendMode(BLEND);
}

function drawBackgroundImage(volumeMapped) {
  // Tile the background image
  let bgScaledWidth = bgImg.width * window.scaleFactor;
  let bgScaledHeight = bgImg.height * window.scaleFactor;
  let bgOffsetX = (width % bgScaledWidth) / 2;
  let bgOffsetY = 0;
  for (let x = -bgOffsetX; x < width; x += bgScaledWidth) {
    for (let y = -bgOffsetY; y < height; y += bgScaledHeight) {
      image(bgImg, x, y, bgScaledWidth, bgScaledHeight);
    }
  }
  blendMode(SCREEN);
}

function drawOverlayImage(volumeMapped) {
 // Calculate the overlay image scale to fit the canvas height
  let overlayScaleFactor = window.scaleFactor; // For consistency with background or adjust as needed
  let overlayScaledWidth = overlayImg.width * overlayScaleFactor;
  let overlayScaledHeight = overlayImg.height * overlayScaleFactor;

  // Tile the overlay image across the canvas
  let overlayOffsetX = (width % overlayScaledWidth) / 2;
  let overlayOffsetY = 0;
  for (let x = -overlayOffsetX; x < width; x += overlayScaledWidth) {
    for (let y = -overlayOffsetY; y < height; y += overlayScaledHeight) {
      image(overlayImg, x, y, overlayScaledWidth, overlayScaledHeight);
    }
  }

  // Use volume to slightly shift the overlay image's position
  // You can adjust the effect of the volume on the position as needed
  for (let x = -overlayOffsetX + volumeMapped; x < width; x += overlayScaledWidth) {
    for (let y = -overlayOffsetY + volumeMapped; y < height; y += overlayScaledHeight) {
      image(overlayImg, x, y, overlayScaledWidth, overlayScaledHeight);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (windowWidth >= 1800) {
    window.scaleFactor = 1;
  } else if (windowWidth >= 800) {
    window.scaleFactor = .6;
  } else {
    window.scaleFactor = 0.3;
  }
  redraw(); // Redraw with the updated scaleFactor
}

function drawContentToOffscreenCanvas() {
    offscreenGraphics.clear(); // Clear any previous drawing
    offscreenGraphics.image(bgImg, 0, 0, offscreenGraphics.width, offscreenGraphics.height);
    // No need to call background() after drawing unless you intend to overwrite the image with a solid color
}

function getMostFrequentColor() {
  offscreenGraphics.loadPixels();
  const pixels = offscreenGraphics.pixels;
  let colorCounts = {};
  let maxCount = 0;
  let mostFrequentColor = {r: 0, g: 0, b: 0};

  for (let i = 0; i < pixels.length; i += 4) {
      // Skipping fully transparent pixels if your image has transparency
      if (pixels[i + 3] === 0) continue;

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const colorKey = `${r}-${g}-${b}`;

      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;

      if (colorCounts[colorKey] > maxCount) {
          maxCount = colorCounts[colorKey];
          mostFrequentColor = {r, g, b};
      }
  }

  console.log("Most Frequent Color:", mostFrequentColor);
  return mostFrequentColor;
}

function updatePlayButtonColor() {
    const color = getProminentNonExtremeColor();
    if (color) {
        const playButton = document.getElementById('playButton');
        const collab = document.getElementById('collab');
    }
    if (playButton) {
      // Set button background color
      playButton.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

      // Determine the lightness of the background color
      const [h, s, l] = rgbToHsl(color.r, color.g, color.b);

      // Set text color based on lightness: dark text for light backgrounds, light text for dark backgrounds
      playButton.style.color = (l > 0.6) ? 'black' : 'white';
    }
    if (collab) {
      // Determine the lightness of the background color
      const [h, s, l] = rgbToHsl(color.r, color.g, color.b);

      // Set the element visible
      collab.style.display = `block`;

      // Update the text color of text within the collab element
      collab.style.color = `rgb(${color.r}, ${color.g}, ${color.b})`;

      // Optionally, set collab's background color for contrast, ensuring text readability
      // Note: This assumes you want a contrasting background for the collab element, not the same as the playButton's background
      collab.style.backgroundColor = (l > 0.6) ? 'black' : 'white'; // Inverted from playButton's text color logic for contrast
    }

    const collabLinks = document.querySelectorAll('.collablink');

    // Iterate over each link with the class "collablinks" and set its color
    collabLinks.forEach(link => {
      // Determine the lightness of the background color
      const [h, s, l] = rgbToHsl(color.r, color.g, color.b);

      link.style.color = (l > 0.6) ? 'white' : 'black'; // Inverted from playButton's text color logic for contrast
    });
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function getProminentNonExtremeColor() {
    offscreenGraphics.loadPixels();
    const pixels = offscreenGraphics.pixels;
    let colorCounts = new Map();

    // Iterate over pixels to count color occurrences, excluding near-white and near-black colors
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
        // Optionally, continue if alpha is not full opacity (a < 255), to skip transparent pixels

        // Convert to HSL to check lightness and exclude very light/dark colors
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Adjust these thresholds as needed
        if (l > 0.1 && l < 0.9) { // Excluding near-black and near-white
            const key = `${r}-${g}-${b}`;
            colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
        }
    }

    // Convert Map to Array, sort by count (descending), then by lightness for mid-range colors
    let sortedColors = Array.from(colorCounts.entries())
        .map(([color, count]) => {
            const [r, g, b] = color.split('-').map(Number);
            const [, , l] = rgbToHsl(r, g, b);
            return { color, count, lightness: l };
        })
        .sort((a, b) => b.count - a.count || b.lightness - a.lightness); // First by count, then by lightness

    // Assuming the first element is now the most prominent non-extreme color
    if (sortedColors.length > 0) {
        const [r, g, b] = sortedColors[0].color.split('-').map(Number);
        return { r, g, b };
    } else {
        return null; // No valid color found
    }
}