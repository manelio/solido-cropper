import SDOM from 'solido-dom';

export default function() {
  SDOM.addEventListener(this.el, 'mousedown', this.onMouseDown);
  SDOM.addEventListener(this.el, 'mousewheel', this.onMouseWheel);
  SDOM.addEventListener(this.el, 'DOMMouseScroll', this.onMouseWheel);

  SDOM.addEventListener(this.el, 'touchstart', this.onTouchStart);
}