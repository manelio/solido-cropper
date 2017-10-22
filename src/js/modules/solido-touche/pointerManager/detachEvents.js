import SDOM from 'solido-dom';

export default function() {
  SDOM.removeEventListener(this.el, 'mousedown', this.onMouseDown);
  SDOM.removeEventListener(this.el, 'mousewheel', this.onMouseWheel);
  SDOM.removeEventListener(this.el, 'DOMMouseScroll', this.onMouseWheel);

  SDOM.removeEventListener(this.el, 'touchstart', this.onTouchStart);
}