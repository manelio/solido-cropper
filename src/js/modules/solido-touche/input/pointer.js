import SDOM from 'solido-dom';
import constants from './constants';

export default function(el, _handlers = {}) {

  let ownPointers = {};
  let npointers = 0;
  let handlers = _handlers || {};

  function onTouchStart(e) {
    SDOM.stopEvent(e);

    let dirty = 0;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined') {
        dirty++;
        ownPointers[id] = true;
        handlers.start && handlers.start(constants.TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }

    if (dirty) {
      if (npointers <= 0) {
        SDOM.addEventListener(document, 'touchmove', onTouchMove);
        SDOM.addEventListener(document, 'touchend', onTouchEnd);
        SDOM.addEventListener(document, 'touchcancel', onTouchEnd);
      }
      npointers += dirty;

      handlers.started && handlers.started(constants.TOUCH_DEVICE, dirty);
    }
  }

  function onTouchMove(e) {
    SDOM.stopEvent(e);

    let dirty = processOwnPointers(e, handlers.move);

    if (dirty) {
      handlers.moved && handlers.moved(constants.TOUCH_DEVICE, dirty);
    }
  }

  function onTouchEnd(e) {
    SDOM.stopEvent(e);

    let dirty = processOwnPointers(e, handlers.end);

    if (dirty) {
      npointers -= dirty;
      
      if (npointers <= 0) {
        SDOM.removeEventListener(document, 'touchmove', onTouchMove);
        SDOM.removeEventListener(document, 'touchend', onTouchEnd);
        SDOM.removeEventListener(document, 'touchcancel', onTouchEnd);
      }
      
      handlers.ended && handlers.ended(constants.TOUCH_DEVICE, dirty);
    }
  }

  function processOwnPointers(e, f) {
    let dirty = 0;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined' && id in ownPointers) {
        dirty++;
        f && f.call(this, constants.TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }
    return dirty;
  }

  let attach = () => {
    SDOM.addEventListener(el, 'touchstart', onTouchStart);
  }

  let detach = () => {
    SDOM.removeEventListener(el, 'touchstart', onTouchStart);
    SDOM.removeEventListener(el, 'touchend', onTouchEnd);
    SDOM.removeEventListener(el, 'touchcancel', onTouchCancel);
  }

  attach();

  return {
    attach: attach,
    detach: detach
  }
}
