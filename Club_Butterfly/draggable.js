// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>

class Draggable {
  constructor(x, y, w, h, img) {
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  over() {
    // Is mouse over object
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      this.rollover = true;
    } else {
      this.rollover = false;
    }
  }

  update(pos) {
    if (pos) {
      this.x = pos.x;
      this.y = pos.y;
    } else {
      // Adjust location if being dragged
      if (this.dragging) {
        this.x = mouseX + this.offsetX;
        this.y = mouseY + this.offsetY;
      }
    }
  }

  show() {
    noStroke();
    // Different fill based on state
    if (this.dragging) {
      fill(50);
    } else if (this.rollover) {
      fill(100);
    } else {
      fill(175, 200);
    }

    push();

    translate(this.x, this.y);
    rotate(-alpha);
    // triangle(
    //   -vehicleSize / 4,
    //   vehicleSize / 3,
    //   vehicleSize / 4,
    //   vehicleSize / 3,
    //   0,
    //   -vehicleSize
    // );
    image(this.img, -this.w / 2, -this.h / 2);

    pop();
  }

  pressed() {
    // Did I click on the rectangle?
    if (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2
    ) {
      this.dragging = true;
      // If so, keep track of relative location of click to corner of rectangle
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
    }
  }

  released() {
    // Quit dragging
    this.dragging = false;
  }
}
