import constants from './constants';
import SDOM from 'solido-dom';

export default function(e) {
    SDOM.stopEvent(e);

    let dirty = 0;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined' && this.pointers.hasId(id)) {
        dirty++;
        this.endPointer(constants.TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }

    if (dirty) {
      this.nrealpointers -= dirty;

      if (this.nrealpointers <= 0) {
        
        console.log('detach events');

        SDOM.removeEventListener(document, 'touchmove', this.onTouchMove);
        SDOM.removeEventListener(document, 'touchend', this.onTouchEnd);
        SDOM.removeEventListener(document, 'touchcancel', this.onTouchEnd);
      }      

      this.endPointers(constants.TOUCH_DEVICE);
    }

  }
