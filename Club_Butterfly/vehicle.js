// Wander (Main)
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/ujsR2vcJlLk
// https://thecodingtrain.com/learning/nature-of-code/5.5-wander.html

// Main: https://editor.p5js.org/codingtrain/sketches/LVtVlS52Q
// With Sliders: https://editor.p5js.org/codingtrain/sketches/uxemh7FGc
// Deleting Positions: https://editor.p5js.org/codingtrain/sketches/EWHjy--Os
// 3D: https://editor.p5js.org/codingtrain/sketches/t6sFXmVrk
// Displacement: https://editor.p5js.org/codingtrain/sketches/VdHUvgHkm
// Perlin Noise: https://editor.p5js.org/codingtrain/sketches/XH2DtikuI

class Vehicle {
  constructor(x, y, img) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, -1);
    this.acc = createVector(0, 0);
    this.maxSpeed = 0.25;
    this.maxForce = 0.01;
    this.r = 30;
    this.img = img;

    this.wanderTheta = PI / 2;

    this.currentPath = [];
    this.paths = [this.currentPath];
  }

  wander() {
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(100);
    wanderPoint.add(this.pos);

    let wanderRadius = 50;

    let theta = this.wanderTheta + this.vel.heading();

    let x = wanderRadius * cos(theta);
    let y = wanderRadius * sin(theta);
    wanderPoint.add(x, y);

    let steer = wanderPoint.sub(this.pos);
    steer.setMag(this.maxForce);
    this.applyForce(steer);

    let displaceRange = 0.3;
    this.wanderTheta += random(-displaceRange, displaceRange);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update(pos) {
    if (pos) {
      this.pos.x = pos.x;
      this.pos.y = pos.y;
    } else {
      this.vel.add(this.acc);
      if(this.maxSpeed > 1) {
        this.vel.mult(this.maxSpeed);
      }
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0);

      this.currentPath.push(this.pos.copy());
    }
  }

  show() {
    fill(255);
    noStroke();
    push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      // triangle(-this.r / 3, -this.r / 4, -this.r / 3, this.r / 4, this.r, 0);
      rotate(90);
      image(this.img, -32, -32);
    pop();
  }

  edges() {
    let hitEdge = false;
    if (this.pos.x > width || this.pos.x < 0) {
      this.vel.mult(-1, 1);
      hitEdge = true;
    }

    if (this.pos.y > height || this.pos.y < 0) {
      this.vel.mult(1, -1);
      hitEdge = true;
    } 
    
    if (hitEdge) {
      this.currentPath = [];
      this.paths.push(this.currentPath);
    }
  }
}