import capabilities from './capabilities';
import inputTouch from './touch';
import inputMouse from './mouse';
import inputPointer from './pointer';

export default function(el) {

  let pointerId = 0;
  
  let npointers = 0;
  let pointers = {};

  function key(device, id) {
    return device + ':' + id;
  }

  function start(device, id, point) {

    let pointer = {
      id: ++pointerId,
      t: Date.now(),
      init: {
        x: point.x,
        y: point.y
      },
      status: {
        x: point.x,
        y: point.y,
        dx: 0,
        dy: 0
      }
    }
    pointers[key(device, id)] = pointer;
    npointers++;

    console.log(`${pointerId} start`);
  }

  function move(device, id, point) {
    let k = key(device, id);
    let pointer = pointers[k];

    let i = pointer.init;
    let s = pointer.status;
    
    s.incx = point.x - s.x;
    s.incy = point.y - s.y;
    s.x = point.x;
    s.y = point.y;
    s.dx = point.x - i.x;
    s.dy = point.y - i.y;

    console.log(`(${s.incx}, ${s.incy}) -> (${s.dx}, ${s.dy})`);
  }

  function end(device, id, point) {
    let k = key(device, id);
    let pointer = pointers[k]

    console.log(`${pointer.id} end`);

    if (!--npointers) {
      pointerId = 0;
      console.log('--- --- --- CLEAR!');
    }
    delete pointers[k];
  }

  let handlers = {
    start: start,
    move: move,
    end: end
  }

  inputMouse(el, handlers);
  capabilities.touchEvents && inputTouch(el, handlers);
  capabilities.pointerEvents && inputPointer(el, handlers);
}

