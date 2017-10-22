export default function(deviceType, pointerId, positionInPage) {

    if (!this.pointers.hasId(pointerId)) {
      return;
    }

    if (this.options.roundPositions) {
      positionInPage.x = Math.round(positionInPage.x);
      positionInPage.y = Math.round(positionInPage.y);
    }

    let pointer = this.pointers.get(pointerId);

    let deltaX = positionInPage.x - pointer.status.pageX0;
    let deltaY = positionInPage.y - pointer.status.pageY0;

    if (!pointer.status.moved) {
      let deltaLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (deltaLength > this.options.touchDistanceThreshold) {
        pointer.status.moved = true;
        console.log('moved!');
      }
    }

    let increment = {
      x: positionInPage.x - pointer.status.pageX,
      y: positionInPage.y - pointer.status.pageY
    }

    pointer.tracking.addValue([increment.x, increment.y]);

    pointer.status.pageX = positionInPage.x;
    pointer.status.pageY = positionInPage.y;

    this.debug(`movePointer(${deviceType}, ${pointerId}, (${positionInPage.x}, ${positionInPage.y}), (${deltaX}, ${deltaY})`);

    let pointerData = {
      device: deviceType,
      npointers: this.status.npointers,
      pageX: positionInPage.x,
      pageY: positionInPage.y,
      incrementX: increment.x,
      incrementY: increment.y
    }

    this.emit('pointermove', pointerData);
    pointer.emit('move', pointerData);
  }