export default function (deviceType) {
  let combined = this.getCombinedPointersMetrics();
  this.status.pageX = combined.positionInPage.x;
  this.status.pageY = combined.positionInPage.y;

  this.status.angle0 = combined.angle;
  this.status.distance0 = combined.distance;

  // WARNING: this is new
  this.status.deltaAngle = 0;
  this.status.deltaDistance = 0;
  this.status.deltaScale = 1;

  this.trackingPosition.reset();
  this.trackingDistance.reset();
  this.trackingAngle.reset();

  this.angleSpeed = 0;
  this.distaceSpeed = 0;
}