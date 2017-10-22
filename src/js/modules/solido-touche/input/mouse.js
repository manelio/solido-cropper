import SDOM from 'solido-dom';
import constants from './constants';

export default function(el, _handlers = {}) {

  let npointers = 0;
  let handlers = _handlers || {};

  function onMouseDown(e) {
    SDOM.stopEvent(e);
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

    if (npointers <= 0) {
      SDOM.addEventListener(document, 'mousemove', onMouseMove);
      SDOM.addEventListener(document, 'mouseup', onMouseUp);
    }

    npointers++;
    handlers.start && handlers.start(constants.MOUSE_DEVICE, constants.MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
    handlers.started && handlers.started(constants.MOUSE_DEVICE, 1);

    return false;
  }

  function onMouseMove(e) {
    SDOM.stopEvent(e);  
    handlers.move && handlers.move(constants.MOUSE_DEVICE, constants.MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
    handlers.moved && handlers.moved(constants.MOUSE_DEVICE, 1);
  }

  function onMouseUp(e) {
    npointers--;

    if (npointers <= 0) {
      SDOM.removeEventListener(document, 'mousemove', onMouseMove);
      SDOM.removeEventListener(document, 'mouseup', onMouseUp);
    }

    handlers.end && handlers.end(constants.MOUSE_DEVICE, constants.MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
    handlers.ended && handlers.ended(constants.MOUSE_DEVICE, 1);
  }

  function onContextMenu(e) {
    SDOM.stopEvent(e);
  }

  let attach = () => {
      SDOM.addEventListener(el, 'contextmenu', onContextMenu);
      SDOM.addEventListener(el, 'mousedown', onMouseDown);
  }

  let detach = () => {
      SDOM.removeEventListener(el, 'contextmenu', onContextMenu);
      SDOM.removeEventListener(el, 'mousedown', onMouseDown);
      SDOM.removeEventListener(document, 'mousemove', onMouseMove);
      SDOM.removeEventListener(document, 'mouseup', onMouseUp);
  }

  attach();

  return {
    attach: attach,
    detach: detach
  }
}
