class soundArea {
  constructor(
    x,
    y,
    h,
    minRadius,
    maxRadius,
    filePath,
    schedulePlay,
    isEditable,
    file,
    isAlwaysOn = false
  ) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.volume = -Infinity;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.filePath = filePath;
    this.file = file;
    this.isAlwaysOn = isAlwaysOn;
    this.schedulePlay = schedulePlay;
    this.isEditable = isEditable;
    this.isDragging = false;
    this.state = null;
    this.particles = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.isLoaded = false;

    fetch(filePath, {
      mode: "no-cors",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          this.blob = reader.result;
        };
      })
      .catch((error) =>
        console.error("Error converting file to base64:", error)
      );

      this.player = new Tone.Player(this.filePath, () => {
        this.isLoaded = true;
      });

    this.player.loop = true;
    this.player.volume.value = this.volume;

    this.panner = new Tone.Panner(0).toDestination();
    this.waveform = new Tone.Waveform();
    this.player.connect(this.panner);
    this.player.connect(this.waveform);
  }

  update(listenerX, listenerY, listenerAngle, isPlayTime) {
    this.updateVolume(listenerX, listenerY, isPlayTime);
    this.updatePan(listenerX, listenerY, listenerAngle);
    this.updateAttributes();
  }

  updateVolume(listenerX, listenerY, isPlayTime) {
    let distance = dist(this.x, this.y, listenerX, listenerY);
    let edge = 20;

    if(this.isAlwaysOn) {
      this.volume = 0;
    } else {
      // Contiuous Volume Change
      if (!this.schedulePlay) {
        if (distance < this.minRadius) {
          this.volume = 0;
        } else if (distance > this.maxRadius) {
          this.volume = -Infinity;
        } else if(this.maxRadius - distance < edge) {
          let distFromMax = this.maxRadius - distance;
          this.volume = map(distFromMax, 0, edge, -60, -12);
        } else {
          let distFromMin = distance - this.minRadius;
          this.volume = map(distFromMin, this.minRadius, this.maxRadius - edge, 0, -12);
        }
      }
  
      // Schedule Volume Change
      if (this.schedulePlay && isPlayTime) {
        if (distance < this.maxRadius) {
          this.volume = 0;
        } else {
          this.volume = -Infinity;
        }
      }
    }


    this.player.volume.value = this.volume;
  }

  updatePan(listenerX, listenerY, listenerAngle) {
    let angle = round(atan2(listenerY - this.y, listenerX - this.x));
    let distance = dist(this.x, this.y, listenerX, listenerY);

    let panAngle = 0;

    if(!this.isAlwaysOn) {
      if (distance < this.minRadius) {
        panAngle = 0;
      } else if (distance < this.maxRadius) {
        panAngle = sin(angle - 90 + listenerAngle); // Compare with Mobile version!!! used to be sin(angle - 90 + listenerAngle)
      }
    }

    // Debugging
    // fill(255);
    // textSize(20);
    // text("Pan Angle: " + panAngle, this.x, this.y + 10);

    this.panner.pan.setValueAtTime(panAngle, 0.25);
  }

  updateAttributes() {
    if (this.state === "dragging") {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    } else if (this.state === "resizingMin") {
      this.minRadius = dist(this.x, this.y, mouseX, mouseY);
    } else if (this.state === "resizingMax") {
      this.maxRadius = dist(this.x, this.y, mouseX, mouseY);
    }
  }

  show(listenerX, listenerY) {
    if(!this.isAlwaysOn) {
      this.showMaxRadius();
      this.showParticles();
      this.showTriangle(listenerX, listenerY);
      this.showWaveform();

      if (this.volume > -15 && this.player.state == "started") {
        this.addParticle();
      }
    }
  }

  showMaxRadius() {
    noStroke();
    fill(this.h, 100, 100, 20);
    ellipse(this.x, this.y, this.maxRadius * 2);
  }

  showParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].edges()) {
        this.particles[i].update();
        this.particles[i].show();
      } else {
        this.particles.splice(i, 1);
      }
    }
  }

  showWaveform() {
    let wave = this.waveform.getValue();
    fill(this.h, 100, 100);
    noStroke();
    beginShape();
    for (let i = 0; i <= 360; i++) {
      let waveIndex = floor(map(i, 0, 360, 0, wave.length - 1));
      let waveRadius = map(wave[waveIndex], -1, 1, 0, this.minRadius * 2);

      vertex(this.x + sin(i) * waveRadius, this.y + cos(i) * waveRadius);
    }
    endShape(CLOSE);
  }

  showTriangle(listenerX, listenerY) {
    let distance = dist(this.x, this.y, listenerX, listenerY);
    if(distance < this.minRadius) return;
    
    let listenerAngle = round(atan2(listenerY - this.y, listenerX - this.x));

    let opacity = map(this.volume, -10, 0, 0, 255);

    fill(this.h, 100, 100, opacity);

    let angleR = listenerAngle + 90;
    let angleL = listenerAngle - 90;

    triangle(
      listenerX,
      listenerY,
      this.x + this.minRadius * cos(angleR),
      this.y + this.minRadius * sin(angleR),
      this.x + this.minRadius * cos(angleL),
      this.y + this.minRadius * sin(angleL)
    );
  }

  addParticle() {
    const p = new Particle(
      this.x,
      this.y,
      this.h,
      this.minRadius,
      this.maxRadius
    );
    this.particles.push(p);
  }

  pressed() {
    this.offsetX = this.x - mouseX;
    this.offsetY = this.y - mouseY;
    const distFromCenter = dist(this.x, this.y, mouseX, mouseY);
    
    let isBeingEdited = false;

    if (distFromCenter < this.minRadius - 10) {
      isDirty = true;
      isBeingEdited = true;
      this.state = "dragging";
    } else if (
      distFromCenter >= this.minRadius - 10 &&
      distFromCenter < this.minRadius + 10
    ) {
      isDirty = true;
      isBeingEdited = true;
      this.state = "resizingMin";
    } else if (
      distFromCenter >= this.maxRadius - 10 &&
      distFromCenter < this.maxRadius + 10
    ) {
      isDirty = true;
      isBeingEdited = true;
      this.state = "resizingMax";
    }

    return isBeingEdited;
  }

  rightPressed() {
    const distFromCenter = dist(this.x, this.y, mouseX, mouseY);
    if (distFromCenter < this.minRadius) {
      isDirty = true;
      this.h = random(100);
    }
  }

  released() {
    this.state = null;
  }

  centerClicked() {
    return dist(this.x, this.y, mouseX, mouseY) < this.minRadius;
  }
}
