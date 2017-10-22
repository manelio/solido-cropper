import constants from './constants';
import SDOM from 'solido-dom';

export default function(e) {
  SDOM.stopEvent(e);
  this.endPointer(constants.MOUSE_DEVICE, constants.MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
  this.endPointers(constants.MOUSE_DEVICE);

  //if (this.status.npointers <= 0) {
    SDOM.removeEventListener(document, 'mousemove', this.onMouseMove);
    SDOM.removeEventListener(document, 'mouseup', this.onMouseUp);
  //}
}