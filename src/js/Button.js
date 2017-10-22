import SDOM from 'solido-dom';
import Pointer from './Pointer';

export default class Button {

  constructor(options) {
    
    options = options || {};

    this.options = {
      onPointerMove: function() {},
      onBefore: function() {},
    }    
    Object.assign(this.options, options);

    let el = SDOM.createElement('button');
    SDOM.addClassName(el, '__solidocropper-button');

    let inner = SDOM.createElement('div');
    SDOM.addClassName(inner, '__solidocropper-button-inner');

    SDOM.append(el, inner);

    inner.innerHTML = this.options.innerHTML;

    new Pointer(el, {
      onPointerStart: function(info) {
        SDOM.addClassName(el, '__solidocropper-button-down')
      },
      onPointerEnd: function(info) {
        SDOM.removeClassName(el, '__solidocropper-button-down')
      },

      onBefore: this.options.onBefore,
      onPointerMove: this.options.onPointerMove
    });

    this.el = el;

  }

}