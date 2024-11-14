class Particle {
  constructor(centerX, centerY, h, maxRadius) {
    this.pos = p5.Vector.random2D().mult(25);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.centerX = centerX;
    this.centerY = centerY;
    this.h = h;
    this.w = random(1, 5);
    this.maxRadius = maxRadius;
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
      ) > this.maxRadius
    );
  }
}
