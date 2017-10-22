import constants from './constants';
import SDOM from 'solido-dom';

export default function(e) {
    SDOM.stopEvent(e);

    let dirty = false;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined' && this.pointers.hasId(id)) {
        dirty = true;
        this.movePointer(constants.TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }

    if (dirty) {
      this.movePointers(constants.TOUCH_DEVICE);
    }
  }
