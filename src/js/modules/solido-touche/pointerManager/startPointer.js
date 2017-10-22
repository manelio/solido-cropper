import solido_pointer from '../pointer';

export default function(deviceType, pointerId, positionInPage) {

    if (this.options.roundPositions) {
      positionInPage.x = Math.round(positionInPage.x);
      positionInPage.y = Math.round(positionInPage.y);
    }

    let pointer = solido_pointer();
    pointer.tracking.addValue([0, 0]);

    pointer.t0 = Date.now();
    pointer.id = pointerId;

    pointer.status.pageX0 = positionInPage.x;
    pointer.status.pageY0 = positionInPage.y;
    pointer.status.pageX = positionInPage.x;
    pointer.status.pageY = positionInPage.y;

    pointer.positionInPage0 = {x: positionInPage.x, y: positionInPage.y};
    pointer.positionInPage = {x: positionInPage.x, y: positionInPage.y};
    pointer.delta = {x: 0, y: 0};
    
    this.pointers.add(pointerId, pointer);

    this.emit('pointerstart', {
      device: deviceType,
      npointers: this.pointers.n,
      pageX: positionInPage.x,
      pageY: positionInPage.y,
      incrementX: 0,
      incrementY: 0,
      pointer: pointer
    });

    this.debug(`startPointer(${deviceType}, ${pointerId}, (${positionInPage.x}, ${positionInPage.y})`);
  }