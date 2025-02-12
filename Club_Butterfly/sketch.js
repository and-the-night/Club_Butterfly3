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
}

let isPlaying = false;
let isDirty = false;
let isDragging = false;

let x = 0;
let y = 0;
let z = 0;

let alpha = 0;
let prevAlpha = 0;

let beta = 0;
let prevBeta = 0;

let gamma = 0;
let prevGamma = 0;

let vehicleSize = 30;
let othersSize = 15;

let listenerImg;
let visitorImg;

function motion() {
  //iOS
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    console.log("iOS");

    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          motionListener();
        }
      })
      .catch(console.error);
  } else {
    //not iOS
    console.log("Not iOS");
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
    console.log("iOS");

    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          orientationListener();
        }
      })
      .catch(console.error);
  } else {
    //not iOS
    console.log("Not iOS");
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

let canvasWidth = 800;
let canvasHeight = 800;

function preload() {
  listenerImg = loadImage("big-butterfly.png");
  visitorImg = loadImage("small-butterfly.png");

  if (!editableMap && !loadedComposition) {
    let minRadius = canvasWidth / 16;
    let maxRadius = canvasWidth / 2;

    areas[0] = new soundArea(
      canvasWidth / 2,
      canvasHeight - 50,
      0,
      minRadius,
      maxRadius,
      "Club_Butterfly-HH.wav",
      false
    );
    areas[1] = new soundArea(
      canvasWidth - 50,
      canvasHeight / 2,
      25,
      minRadius,
      maxRadius,
      "Club_Butterfly-KICK.wav",
      false
    );
    areas[2] = new soundArea(
      canvasWidth / 2,
      50,
      50,
      minRadius,
      maxRadius,
      "Club_Butterfly-SNR.wav",
      false
    );
    areas[3] = new soundArea(
      50,
      canvasHeight / 2,
      75,
      minRadius,
      maxRadius,
      "Club_Butterfly-BASS.wav",
      false
    );
  }
}

// Buttons

let playText = state == "mobile" ? "Play" : "►";
let stopText = state == "mobile" ? "Stop" : "⏹";

// let playBtn = createButton(playText);
let playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", () => {
  if (state == "mobile") detect();

  if (!isPlaying) {
    playAudio();
  } else if (isPlaying) {
    stopAudio();
  }
});

let stateBtn = document.getElementById("stateBtn");

if (state != "mobile") {
  stateBtn.addEventListener("click", () => {
    if (state == "drag") {
      state = "wander";
    } else if (state == "wander") {
      state = "drag";
    }
  });
}

function playAudio() {
  Tone.Transport.start();
  playBtn.innerHTML = stopText;
  isPlaying = true;
  for (let i = 0; i < areas.length; i++) {
    areas[i].player.start();
  }
}

function stopAudio() {
  Tone.Transport.stop();
  playBtn.innerHTML = playText;
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

  position = createVector(width / 2, height - 50);
  velocity = createVector(0, 0);
}

function newData(data, id) {
  let d = JSON.parse(data);

  let listener = otherListeners.find((l) => l.id == id);

  if (!listener) {
    otherListeners.push({ id: id, ...d });
    console.log("user ", id, " connected");
  } else {
    listener.x = d.x;
    listener.y = d.y;
    listener.a = d.a;
  }
}

function userDisconect(id) {
  let listener = otherListeners.find((l) => l.id == id);

  let index = otherListeners.indexOf(listener);
  if (index !== -1) {
    otherListeners.splice(index, 1);
  }
  console.log("user ", id, " disconnected");
}

function draw() {
  background(0, 0, 0);

  const transport = Tone.Transport.position.split(":");
  let isNew2Bar = transport[1] == "0" && transport[0] % 2 == 0;

  for (let area of areas) {
    let heading = state == "wander" ? autoListener.vel.heading() : alpha;
    area.update(listener.x, listener.y, heading, isNew2Bar);
    area.show(listener.x, listener.y);

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

  if (state == "mobile") {
    getListenerPosition();
    listener.show();
    listener.update(position);
  } else if (state == "drag") {
    stateBtn.innerHTML = "↝";
    listener.over();
    listener.update();
    listener.show();
    let pos = {
      x: listener.x,
      y: listener.y,
    };
    autoListener.update(pos);
  } else if (state == "wander") {
    stateBtn.innerHTML = "⌖";
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

  // let heading = state == "wander" ? autoListener.vel.heading() : -alpha - 90;
  // p5lm.send(JSON.stringify({ x: listener.x, y: listener.y, a: heading }));

  // if(sendPosition) sendPosition({ x: listener.x, y: listener.y, a: heading });
  showOthers();
  updateCursor();
}

accValues = [];
velValues = [];

function getListenerPosition() {
  let absY = Math.abs(y);
  let alphaChange = Math.abs(prevAlpha - alpha);
  let betaChange = Math.abs(prevBeta - beta);
  let gammaChange = Math.abs(prevGamma - gamma);

  if (
    absY > 0.1 &&
    alphaChange < 2 &&
    betaChange < 20
    // gammaChange < 2
  ) {
    let acc = p5.Vector.fromAngle(((-alpha - 90) * PI) / 180);
    acc.setMag(absY / 32);
    velocity.add(acc);
    position.add(velocity);
  } else {
    velocity.set(0, 0);
  }

  accValues.push(absY);
  if(accValues.length > width) accValues.shift();

  velValues.push(velocity.mag());
  if(velValues.length > width) velValues.shift();

  // Draw a graph of y
  stroke(255);
  noFill();
  beginShape();
  for (let i = 0; i < accValues.length; i++) {
    vertex(i, accValues[i]);
  }
  endShape();

    // Draw a graph of velocity
    stroke(255, 0, 0);
    noFill();
    beginShape();
    for (let i = 0; i < velValues; i++) {
      vertex(i, velValues[i]);
    }
    endShape();

    textSize(50);

    text("velocity" + velocity.mag(), 10, 50);

  if (position.y < 0) position.y = 0;
  if (position.y > height) position.y = height;
  if (position.x < 0) position.x = 0;
  if (position.x > width) position.x = width;

  prevAlpha = alpha;
  prevBeta = beta;
  prevGamma = gamma;
}

function mousePressed() {
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
      let confirmDelete = confirm("Are you sure you want to delete this sound area?");
      if (confirmDelete) {
        areas[i].player.dispose();
        areas.splice(i, 1);
      }
      break;
    }
  }
}

function showOthers() {
  noStroke();
  for (let l of otherListeners) {
    push();
    translate(l.x, l.y);
    rotate(l.a + 90);
    triangle(
      -othersSize / 2,
      -othersSize / 4,
      -othersSize / 2,
      othersSize / 4,
      othersSize,
      0
    );
    image(visitorImg, -16, -16);
    pop();
  }
}
