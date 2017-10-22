import constants from './constants';
import SDOM from 'solido-dom';

export default function(e) {
    SDOM.stopEvent(e);

    let dirty = 0;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined') {
        dirty++;
        this.startPointer(constants.TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }

    if (dirty) {
      
      if (this.nrealpointers <= 0) {

        console.log('attach events');

        SDOM.addEventListener(document, 'touchmove', this.onTouchMove);
        SDOM.addEventListener(document, 'touchend', this.onTouchEnd);
        SDOM.addEventListener(document, 'touchcancel', this.onTouchCancel);        
      }
      
      this.nrealpointers += dirty;

      this.startPointers(constants.TOUCH_DEVICE);
    }

    return false;
  }
