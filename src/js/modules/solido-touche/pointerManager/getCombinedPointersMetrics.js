export default function() {

  let
    midPositionInPageX = 0,
    midPositionInPageY = 0
  ;

  let p1, p2;
  let n = 0;

  let pointers = this.pointers.asArray();
  
  for (let i in pointers) {
    n++;

    let pointer = pointers[i];

    if (pointer.id === 'virt1') {

      var bounds = this.el.getBoundingClientRect()

      pointer.status.pageX = bounds.left + this.el.offsetWidth / 2;
      pointer.status.pageY = bounds.top + this.el.offsetHeight / 2;

      //console.log(pointer);
    }

    //console.log(`${pointer.id}: ${pointer.status.pageX}, ${pointer.status.pageY}`);

    midPositionInPageX += pointer.status.pageX;
    midPositionInPageY += pointer.status.pageY;

    switch(n) {
      case 1: p1 = pointer; break;
      case 2: p2 = pointer; break;
    }    
  }

  if (n > 0) {
    midPositionInPageX = midPositionInPageX / n;
    midPositionInPageY = midPositionInPageY / n;
  } else {
    midPositionInPageX = this.status.pageX;
    midPositionInPageY = this.status.pageY;
  }

  if (this.options.roundPositions) {
    midPositionInPageX = Math.round(midPositionInPageX);
    midPositionInPageY = Math.round(midPositionInPageY);
  }

  let distance = this.status.distance0, angle = this.status.angle0;
  if (p2) {
    let dx = p2.status.pageX - p1.status.pageX;
    let dy = p2.status.pageY - p1.status.pageY;

    distance = Math.sqrt(dx * dx + dy * dy);
    angle = Math.atan2(dy, dx);

    /*
    if (angle < 0) {
      angle = Math.PI * 2 + angle;
    }
    */
  }

  return {
    positionInPage: {
      x: midPositionInPageX,
      y: midPositionInPageY
    },
    distance: distance,
    angle: angle
  }

}