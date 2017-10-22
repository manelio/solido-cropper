import constants from './constants';
import SDOM from 'solido-dom';

export default function(e) {
  SDOM.stopEvent(e);
  document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

  //if (this.status.npointers === 0) {
    SDOM.addEventListener(document, 'mousemove', this.onMouseMove);
    SDOM.addEventListener(document, 'mouseup', this.onMouseUp);
  //}

  this.startPointer(constants.MOUSE_DEVICE, constants.MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
  this.startPointers(constants.MOUSE_DEVICE);

  return false;
}