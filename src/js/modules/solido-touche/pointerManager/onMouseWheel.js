import constants from './constants';
import SDOM from 'solido-dom';

export default function(e) {
  SDOM.stopEvent(e);
  
  var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
  //this.relativePoint = this.getRelativePoint(e.pageX, e.pageY);
  //this.saveValuesBefore();

  /*
  (this.options.onWheel.bind(this))({
    event: e,
    device: 'mouse',
    x0: this.relativePoint.x,
    y0: this.relativePoint.y,
    x: this.relativePoint.x,
    y: this.relativePoint.y,
    deltaX: 0,
    deltaY: -delta * 10
  });
  */
}