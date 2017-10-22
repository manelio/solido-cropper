import constants from './constants';
import SDOM from 'solido-dom';

export default function(e) {
  SDOM.stopEvent(e);  
  this.movePointer(constants.MOUSE_DEVICE, constants.MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
  this.movePointers(constants.MOUSE_DEVICE);
}