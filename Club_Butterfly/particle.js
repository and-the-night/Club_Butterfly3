class Particle {
  constructor(centerX, centerY, r, g, b, minRadius, maxRadius) {
    this.pos = p5.Vector.random2D().mult(minRadius);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.centerX = centerX;
    this.centerY = centerY;
    this.r = r;
    this.g = g;
    this.b = b;
    this.w = random(1, 5);
    this.maxRadius = maxRadius;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }

  show() {
    noStroke();
    fill(this.r, this.g, this.b);
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

