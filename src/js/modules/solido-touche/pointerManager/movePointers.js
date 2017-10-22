export default function(deviceType) {
  let combined = this.getCombinedPointersMetrics();
  
  let delta = {
    x: combined.positionInPage.x - this.status.pageX,
    y: combined.positionInPage.y - this.status.pageY
  }

  let increment = {
    x: combined.positionInPage.x - this.status.pageX,
    y: combined.positionInPage.y - this.status.pageY
  }

  this.status.pageX = combined.positionInPage.x;
  this.status.pageY = combined.positionInPage.y;

  //console.log(combined.angle);

  let deltaAngle = combined.angle - this.status.angle0;
  let deltaDistance = combined.distance - this.status.distance0;

  let deltaScale;
  if (this.status.distance0 < 0.0001) {
    deltaScale = 1;
  } else {
    deltaScale = combined.distance / this.status.distance0;
  }

  let incrementAngle = deltaAngle - this.status.deltaAngle;
  this.status.deltaAngle = deltaAngle;
  
  let incrementScale = deltaScale / this.status.deltaScale;
  this.status.deltaScale = deltaScale;

  console.log(incrementScale.toFixed(2));


  this.trackingPosition.addValue([delta.x, delta.y]);
  this.trackingAngle.addValue(combined.angle);
  this.trackingDistance.addValue(deltaScale);

  let pointerData = {
    device: deviceType,
    combined: true,
    npointers: this.status.npointers,
    pageX: this.status.pageX,
    pageY: this.status.pageY,
    
    deltaX: delta.x,
    deltaY: delta.y,
    incrementX: increment.x,
    incrementY: increment.y,
    
    deltaAngle: deltaAngle,
    incrementAngle: incrementAngle,
    
    deltaDistance: deltaDistance,

    deltaScale: deltaScale,
    incrementScale: incrementScale
  }

  this.emit('pointersmove', pointerData);
}