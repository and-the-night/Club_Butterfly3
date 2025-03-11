function updateCursor() {
  cursor(ARROW);

  if(editableMap) {
    areas.forEach((area) => {
      if (area.isEditable) {
        const distFromCenter = dist(area.x, area.y, mouseX, mouseY);
        if (distFromCenter < area.minRadius - 10) {
          cursor(MOVE);
        } else if (
          (distFromCenter >= area.minRadius - 10 &&
            distFromCenter < area.minRadius + 10) ||
          (distFromCenter >= area.maxRadius - 10 &&
            distFromCenter < area.maxRadius + 10)
        ) {
          let angle = atan2(mouseY - area.y, mouseX - area.x);
          if (
            (angle > -22.5 && angle <= 22.5) ||
            angle > 157.5 ||
            angle <= -157.5
          ) {
            cursor("ew-resize");
          } else if (
            (angle > 22.5 && angle <= 67.5) ||
            (angle > -157.5 && angle <= -112.5)
          ) {
            cursor("nwse-resize");
          } else if (
            (angle > 67.5 && angle <= 112.5) ||
            (angle > -112.5 && angle <= -67.5)
          ) {
            cursor("ns-resize");
          } else if (
            (angle > 112.5 && angle <= 157.5) ||
            (angle > -67.5 && angle <= -22.5)
          ) {
            cursor("nesw-resize");
          }
        }
      }
    });
  }

  if (
    mouseX < listener.x + listener.w / 2 &&
    mouseX > listener.x - listener.w / 2 &&
    mouseY < listener.y + listener.h / 2 &&
    mouseY > listener.y - listener.h / 2 &&
    state == "drag"
  ) {
    cursor("grab");

    if(isDragging) {
      cursor("grabbing");
    }
  }
}
