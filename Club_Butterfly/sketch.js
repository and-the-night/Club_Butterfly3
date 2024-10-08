let p5lm;

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

class Particle {
  constructor(centerX, centerY, h) {
    this.pos = p5.Vector.random2D().mult(25);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.centerX = centerX;
    this.centerY = centerY;
    this.h = h;
    this.w = random(1, 5);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }

  show() {
    noStroke();
    fill(this.h, 100, 100);
    ellipse(this.pos.x + this.centerX, this.pos.y + this.centerY, this.w);
  }

  edges() {
    return (
      dist(
        this.pos.x + this.centerX,
        this.pos.y + this.centerY,
        this.centerX,
        this.centerY
      ) > 400
    );
  }
}

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

// Sound Areas
class soundArea {
  constructor(x, y, h, channel, minRadius, maxRadius) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.channel = channel;
    this.volume = -Infinity;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.particles = [];
  }

  addParticle() {
    const p = new Particle(this.x, this.y, this.h);
    this.particles.push(p);
  }

  show() {
    noStroke();
    fill(this.h, 100, 100, 20);
    ellipse(this.x, this.y, this.maxRadius * 2);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].edges()) {
        this.particles[i].update();
        this.particles[i].show();
      } else {
        this.particles.splice(i, 1);
      }
    }
  }
}

let areas = [];
let listener;
let autoListener;
// let listeners = [];
let channels = [];
let panners = [];
let waveforms = [];

let debug = false;
let schedulePlay = true;

function preload() {
  listenerImg = loadImage("big-butterfly.png");
  visitorImg = loadImage("small-butterfly.png");

  channels[0] = new Tone.Player("Club_Butterfly-HH.wav");
  channels[1] = new Tone.Player("Club_Butterfly-KICK.wav");
  channels[2] = new Tone.Player("Club_Butterfly-SNR.wav");
  channels[3] = new Tone.Player("Club_Butterfly-BASS.wav");
}

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 100);
  angleMode(DEGREES);
  noStroke();

  p5lm = new p5LiveMedia(this, "DATA", null, "motion");
  p5lm.on("data", newData);

  for (let i = 0; i < channels.length; i++) {
    channels[i].loop = true;
    channels[i].volume.value = -100;
    panners[i] = new Tone.Panner(0).toDestination();
    waveforms[i] = new Tone.Waveform();
    channels[i].connect(panners[i]);
    channels[i].connect(waveforms[i]);
  }

  let playText = state == "mobile" ? "Play" : "►";
  let stopText = state == "mobile" ? "Stop" : "⏹";

  let playBtn = createButton(playText);

  playBtn.mousePressed(() => {
    if (state == "mobile") detect();

    if (!isPlaying) {
      Tone.Transport.start();
      for (let i = 0; i < channels.length; i++) {
        channels[i].start();
        isPlaying = true;
        playBtn.html(stopText);
      }
    } else if (isPlaying) {
      Tone.Transport.stop();
      for (let i = 0; i < channels.length; i++) {
        channels[i].stop();
        isPlaying = false;
        playBtn.html(playText);
      }
    }
  });

  if (state != "mobile") {
    let stateBtn = createButton("↝");

    stateBtn.mousePressed(() => {
      if (state == "drag") {
        state = "wander";
        stateBtn.html("⌖");
      } else if (state == "wander") {
        state = "drag";
        stateBtn.html("↝");
      }
    });
  }

  createElement("h2", "by &theNIGHT 2024");

  listener = new Draggable(20, 20, 32, 32, listenerImg);
  autoListener = new Vehicle(width / 2, height - 100, listenerImg);

  let minRadius = width / 15;
  let maxRadius = width / 2;

  areas[0] = new soundArea(
    width / 2,
    height - minRadius,
    0,
    0,
    minRadius,
    maxRadius
  );
  areas[1] = new soundArea(
    width - minRadius,
    height / 2,
    25,
    1,
    minRadius,
    maxRadius
  );
  areas[2] = new soundArea(width / 2, minRadius, 50, 2, minRadius, maxRadius);
  areas[3] = new soundArea(minRadius, height / 2, 75, 3, minRadius, maxRadius);

  position = createVector(width / 2, height - 50);
  velocity = createVector(0, 0);
}

function draw() {
  background(0, 0, 0);
  const transport = Tone.Transport.position.split(":");
  let isNew2Bar = transport[1] == "0" && transport[0] % 2 == 0;

  if (schedulePlay) {
    if (isNew2Bar) {
      fill("red");
    } else {
      fill("white");
    }
    textSize(40);
    text(Tone.Transport.position, 10, height - 20);
  }

  for (let area of areas) {
    let distance = Math.round(
      dist(
        area.x,
        area.y,
        listener.x + listener.w / 2,
        listener.y + listener.h / 2
      )
    );

    let volume = area.volume;

    // Contiuous Volume Change
    if (!schedulePlay) {
      if (distance < area.minRadius) {
        volume = 0;
      } else if (distance > area.maxRadius) {
        volume = -Infinity;
      } else {
        volume = map(distance, area.minRadius, area.maxRadius, 0, -15);
      }
    }

    // Schedule Volume Change
    if (schedulePlay) {
      if (isNew2Bar) {
        if (distance < area.maxRadius) {
          volume = 0;
        } else {
          volume = -Infinity;
        }
      }
    }

    area.volume = volume;

    if (volume > -15 && channels[area.channel].state == "started") {
      area.addParticle();
    }

    channels[area.channel].volume.value = volume;

    let panAngle = 0;
    let listenerAngle = round(atan2(listener.y - area.y, listener.x - area.x));

    if (volume == 1) {
      panAngle = 0;
    } else {
      panAngle = sin(listenerAngle - 90 + alpha);
    }

    panners[area.channel].pan.setValueAtTime(panAngle, 0.25);

    let wave = waveforms[area.channel].getValue();
    fill(area.h, 100, 100);
    noStroke();
    beginShape();
    for (let i = 0; i <= 360; i++) {
      let waveIndex = floor(map(i, 0, 360, 0, wave.length - 1));
      let waveRadius = map(wave[waveIndex], -1, 1, 0, 125);

      vertex(area.x + sin(i) * waveRadius, area.y + cos(i) * waveRadius);
    }
    endShape(CLOSE);

    let opacity = map(volume, -15, 0, 0, 255);

    fill(area.h, 100, 100, opacity);

    angleR = listenerAngle + 90;
    angleL = listenerAngle - 90;

    triangle(
      listener.x + listener.w / 2,
      listener.y + listener.h / 2,
      area.x + area.minRadius * cos(angleR),
      area.y + area.minRadius * sin(angleR),
      area.x + area.minRadius * cos(angleL),
      area.y + area.minRadius * sin(angleL)
    );

    // Debugging
    if (debug) {
      fill(255);
      stroke(0);
      strokeWeight(2);
      textSize(20);
      text("D: " + distance, area.x - 30, area.y - 15);
      text("V: " + volume, area.x - 30, area.y + 15);
    }

    area.show();
  }

  if (state == "mobile") {
    getListenerPosition();
    listener.show();
    listener.update(position);
  } else if (state == "drag") {
    listener.over();
    listener.update();
    listener.show();
  } else {
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

  console.log("x:", listener.x, "y:", listener.y);
  p5lm.send(JSON.stringify({ x: listener.x, y: listener.y }));
  let heading = state == "wander" ? autoListener.vel.heading() : -alpha - 90;

  // if(sendPosition) sendPosition({ x: listener.x, y: listener.y, a: heading });
  showOthers();
}

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

  if (position.y < 0) position.y = 0;
  if (position.y > height) position.y = height;
  if (position.x < 0) position.x = 0;
  if (position.x > width) position.x = width;

  prevAlpha = alpha;
  prevBeta = beta;
  prevGamma = gamma;
}

function mousePressed() {
  listener.pressed();
}

function mouseReleased() {
  listener.released();
}

function showOthers() {
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
}

function newData(data, id) {
  console.log("data:", data, "from:", id);
}
