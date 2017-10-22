export default function(deviceType, pointerId, positionInPage) {

    if (!this.pointers.hasId(pointerId)) {
      return;
    }

    let pointer = this.pointers.get(pointerId);
    pointer.tracking.removeOldValues();

    let pointerData = {
      device: deviceType,
      npointers: this.pointers.n,
      pageX: positionInPage.x,
      pageY: positionInPage.y
    }

    this.emit('pointerend', pointerData);
    pointer.emit('end', pointerData);

    this.pointers.remove(pointerId);
    
    this.debug(`endPointer(${deviceType}, ${pointerId}, (${positionInPage.x}, ${positionInPage.y})`);
  }
