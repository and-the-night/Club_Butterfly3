// Device Detection
let state;

if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  state = "mobile";
  document.body.classList.add("mobile");
} else {
  state = "drag";
  document.body.classList.add("desktop");
  document.body.classList.add("drag");
}

let isPlaying = false;
let isDirty = false;
let isDragging = false;
let isShowingOthers = false;

let savedListeners = [];

let x = 0;
let y = 0;
let z = 0;

let alpha = 0;
let prevAlpha = 0;

let beta = 0;
let prevBeta = 0;

let gamma = 0;
let prevGamma = 0;

let prevAcc = 0;

let vehicleSize = 30;
let othersSize = 15;

let listenerImg;
let visitorImg;

function motion() {
  //iOS
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          motionListener();
        }
      })
      .catch(console.error);
  } else {
    //not iOS
    motionListener();
  }
}

function motionListener() {
  window.addEventListener("devicemotion", (e) => {
    // do something with e
    x = e.acceleration.x;
    y = e.acceleration.y;
    z = e.acceleration.z;
  });
}

function orientation() {
  //iOS
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          orientationListener();
        }
      })
      .catch(console.error);
  } else {
    //not iOS
    orientationListener();
  }
}

function orientationListener() {
  window.addEventListener("deviceorientation", (e) => {
    // do something with e
    alpha = e.alpha;
    beta = e.beta;
    gamma = e.gamma;
  });
}

let startButton;
let sizeSlider;
let wanderSpeedSlider;
let position;
let velocity;

function detect() {
  motion();
  orientation();
}

let sketchName;
let areas = [];
let listener;
let autoListener;
let otherListeners = [];

let debug = false;
let schedulePlay = true;
let isLoaded;
let isOnboarding = true; 

let canvasWidth = 800;
let canvasHeight = 800;

function preload() {
  listenerImg = loadImage("big-butterfly.png");
  visitorImg = loadImage("small-butterfly.png");
  loopingImage = loadImage("images/loop.png");
  nonLoopingImage = loadImage("images/arrow.png");
  
  if (!editableMap && !loadedComposition) {
    let minRadius = canvasWidth / 16; // 50
    let maxRadius = 420;

    areas[0] = new soundArea(
      canvasWidth / 2,
      canvasHeight - 50,
      0,
      minRadius,
      maxRadius,
      "audio/constellation/CH1.mp3",
      false
    );
    areas[1] = new soundArea(
      canvasWidth - 50,
      canvasHeight / 2,
      25,
      minRadius,
      maxRadius,
      "audio/constellation/CH2.mp3",
      false
    );
    areas[2] = new soundArea(
      canvasWidth / 2,
      50,
      50,
      minRadius,
      maxRadius,
      "audio/constellation/CH3.mp3",
      false
    );
    areas[3] = new soundArea(
      50,
      canvasHeight / 2,
      75,
      minRadius,
      maxRadius,
      "audio/constellation/CH4.mp3",
      false
    );
    areas[4] = new soundArea(
      0,
      0,
      0,
      0,
      0,
      "audio/constellation/CHAll.mp3",
      false,
      false,
      null,
      true
    )
  }
}

// Buttons
let playText = state === "mobile" ? "Play" : "►";
let stopText = state === "mobile" ? "Stop" : "⏹";

let playBtn = document.getElementById("playBtn");
playBtn.classList.add("play");

playBtn.addEventListener("click", () => {
  if (state == "mobile") detect();

  if (!isPlaying) {
    playAudio();
    playBtn.classList.remove("play");
    playBtn.classList.add("stop");
  } else if (isPlaying) {
    stopAudio();
    playBtn.classList.remove("stop");
    playBtn.classList.add("play");
  }
});

const showOthersBtn = document.getElementById("showOthersBtn");

if(showOthersBtn) {
  showOthersBtn.addEventListener("click", () => {
    if (isShowingOthers) {
      isShowingOthers = false;
      showOthersBtn.classList.remove("hide-others");
      showOthersBtn.classList.add("show-others");
    } else {
      isShowingOthers = true;
      showOthersBtn.classList.remove("show-others");
      showOthersBtn.classList.add("hide-others");
    }
  });
}


let stateBtn = document.getElementById("stateBtn");

if (state != "mobile") {
  stateBtn.addEventListener("click", () => {
    if (state == "drag") {
      state = "wander";
      document.body.classList.remove("drag");
      document.body.classList.add("wander");
    } else if (state == "wander") {
      state = "drag";
      document.body.classList.remove("wander");
      document.body.classList.add("drag");
    }
  });
}

function playAudio() {
  Tone.Transport.start();
  isPlaying = true;
  for (let i = 0; i < areas.length; i++) {
    areas[i].player.start();
  }
}

function stopAudio() {
  Tone.Transport.stop();
  isPlaying = false;
  for (let i = 0; i < areas.length; i++) {
    areas[i].player.stop();
  }
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  colorMode(HSB, 100);
  angleMode(DEGREES);
  noStroke();

  listener = new Draggable(width / 2, height - 60, 64, 64, listenerImg);
  autoListener = new Vehicle(width / 2, height - 60, listenerImg);

  if (!editableMap && !loadedComposition) {
    fetch("savedListeners.json")
      .then((response) => response.json())
      .then((data) => {
        savedListeners = data.savedListeners;
        let numOfSplices = Math.floor(Math.random() * (savedListeners.length / 2));
        for (let i = 0; i < numOfSplices; i++) {
          let spliceIndex = Math.floor(Math.random() * savedListeners.length);
          savedListeners.splice(spliceIndex, 1);
        }
        
        for(let i = 0; i < savedListeners.length; i++) {
          let l = savedListeners[i];
          listeners.push(l[0]);
        }

        updateListenersNumber();
      })
      .catch((error) => console.error("Error loading savedListeners:", error));
  }

  position = createVector(width / 2, height - 50);
  velocity = createVector(0, 0);

  sizeSlider = document.getElementById("sizeSlider");
  wanderSpeedSlider = document.getElementById("wanderSpeedSlider");
}

function draw() {
  background(0, 0, 0);

  const transport = Tone.Transport.position.split(":");
  let isNew2Bar = transport[1] == "0" && transport[0] % 2 == 0;

  isLoaded = true;

  for (let area of areas) {
    let heading = state == "wander" ? autoListener.vel.heading() : alpha;
    area.show(listener.x, listener.y);
    area.update(listener.x, listener.y, heading, isNew2Bar);

    if(!area.isLoaded) {
      isLoaded = false;
    }

    // Debugging
    if (debug) {
      fill(255);
      stroke(0);
      strokeWeight(2);
      textSize(20);
      text("D: " + distance, area.x - 30, area.y - 15);
      text("V: " + volume, area.x - 30, area.y + 15);

      if (schedulePlay) {
        if (isNew2Bar) {
          fill("red");
        } else {
          fill("white");
        }
        textSize(40);
        text(Tone.Transport.position, 10, height - 20);
      }
    }
  }

  if (!isLoaded) {
    showLoading();
    playBtn.disabled = true;
  } else {
    playBtn.disabled = false;
  }

  if (state == "mobile") {
    getListenerPosition();
    listener.show();
    listener.update(position);
  } else if (state == "drag") {
    listener.over();
    listener.update();
    listener.show();
    let pos = {
      x: listener.x,
      y: listener.y,
    };
    autoListener.update(pos);
  } else if (state == "wander") {
    autoListener.wander();
    autoListener.update();
    autoListener.show();
    autoListener.edges();
    pos = {
      x: autoListener.pos.x,
      y: autoListener.pos.y,
    };
    listener.update(pos);
  }

  if (wanderSpeedSlider) autoListener.maxSpeed = parseFloat(wanderSpeedSlider.value);

  let heading = state == "wander" ? autoListener.vel.heading() : -alpha - 90;

  if(sendPosition) sendPosition({ x: listener.x, y: listener.y, a: heading });

  if(editableMap && areas.length == 0) {
    textSize(30);
    textAlign(CENTER);
    text("drag + drop audio files to begin your composition", width / 2, height / 2);
  }
  if(!editableMap && !loadedComposition && isShowingOthers) showOthers();
  updateCursor();
}

function getListenerPosition() {
  let alphaChange = Math.abs(prevAlpha - alpha);
  let betaChange = Math.abs(prevBeta - beta);
  let gammaChange = Math.abs(prevGamma - gamma);

  size = sizeSlider ? sizeSlider.value : 5;
  
  let acc = p5.Vector.fromAngle(((-alpha - 90) * PI) / 180);

  const forwardAcc = y * cos(beta) + z * sin(beta);
  const avgAcc = lerp(prevAcc, forwardAcc, 0.5);
  
  if (forwardAcc > 0.5 && alphaChange < 1 && betaChange < 1) {
    acc.setMag(avgAcc / size);
    velocity.add(acc);
    fill(255);
  } else {
    acc.set(0,0);
    velocity.mult(0.9);
    if(velocity.mag() < 0.1) {
      velocity.set(0,0);
    }
    fill('red');
  }

  position.add(velocity); 

  if (position.y < 0) position.y = 0;
  if (position.y > height) position.y = height;
  if (position.x < 0) position.x = 0;
  if (position.x > width) position.x = width;

  prevAlpha = alpha;
  prevBeta = beta;
  prevGamma = gamma;

  prevAcc = forwardAcc;
}

function mousePressed() {
  if (state == "mobile" && !isOnboarding) {
    if(
      mouseX > 0 && mouseX < width &&
      mouseY > 0 && mouseY < height
    ) {
      position.x = mouseX;
      position.y = mouseY;
      velocity.set(0, 0);
    }
  } else {
    if (mouseButton === LEFT) {
      listener.pressed();
      if (
        mouseX > listener.x + listener.w / 2 ||
        mouseX < listener.x - listener.w / 2 ||
        mouseY > listener.y + listener.h / 2 ||
        mouseY < listener.y - listener.h / 2
      ) {
        for (let i = areas.length - 1; i >= 0; i--) {
          if (areas[i].isEditable) {
            const isBeingEdited = areas[i].pressed();
            if (isBeingEdited) {
              break;
            }
          }
        }
      } else {
        if(state == "drag") {
          isDragging = true;
        }
      }
    } else if (mouseButton === RIGHT) {
      areas.forEach((area) => {
        if (area.isEditable) area.rightPressed();
      });
    }
  }
}

function mouseReleased() {
  listener.released();
  isDragging = false;
  areas.forEach((area) => {
    if (area.isEditable) area.released();
  });
}

function doubleClicked() {
  for (let i = areas.length - 1; i >= 0; i--) {
    if (areas[i].isEditable && areas[i].centerClicked()) {
      soundAreaEdit(areas[i], i);
      break;
    }
  }
}

function showOthers() {
  // Saved Listeners
  if(!savedListeners || savedListeners.length == 0) return;
    for(let l of savedListeners) {
      let currPos = l[(frameCount - 1) % l.length];
      let listener = listeners.find((l) => {
        return l.id == currPos.id;
      });

      if (listener) {
        listener.x = currPos.x;
        listener.y = currPos.y;
        listener.a = currPos.a;
      } else {
        listeners.push(currPos);
      }
    }

  // Live Listeners
  if(!listeners || listeners.length == 0) return;
  noStroke();
  for (let l of listeners) {

    push();
    translate(l.x, l.y);
    rotate(l.a);
    triangle(
      -othersSize / 2,
      -othersSize / 4,
      -othersSize / 2,
      othersSize / 4,
      othersSize,
      0
    );
    rotate(90);
    image(visitorImg, -16, -16);
    pop();
  }

  updateListenersNumber();
}

function showLoading() {
  fill(0, 0, 0, 50);
  rect(0, 0, width, height);
  fill(255);
  textSize(30);
  textAlign(CENTER);
  text("Loading...", width / 2, height / 2);
}

let updateListenersNumber = () => {
  visitorsMobile.innerHTML = listeners.length;
  visitorsDesktop.innerHTML = listeners.length;
};