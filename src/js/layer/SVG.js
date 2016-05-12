import uDOM from '../uDOM';

import Layer from './Layer';

export default class SVG extends Layer {

  constructor() {

    super();

    let el = document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttributeNS(null,'xlink','http://www.w3.org/1999/xlink');
    el.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%;';

    let groupEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupEl.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');

    uDOM.append(el, groupEl);

    this.el = el;
    this.groupEl = groupEl;
  }

  render() {
    let m = this.transformationMatrix.getMatrix();
    this.m = m;

    this.groupEl.setAttributeNS(null, 'transform', `matrix(${m[0]} ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]})`);

    this.items.forEach(function(item, i) {
      this.renderItem(item);
    }.bind(this));

  }

  setSize(w, h) {
    this.width = w;
    this.height = h;

    this.el.setAttributeNS(null,'width', w);
    this.el.setAttributeNS(null,'height', h);
  }

  addItem(item) {
    super.addItem(item);
    let el = this.getElementForItem(item);
    if (el) {
      uDOM.append(this.groupEl, el);
    }
  }

  renderItem(item) {
    
    let el = this.getElementForItem(item);

    switch(item.code) {
      case 'image':
      break;

      case 'rectangle':
        el.setAttributeNS(null, 'x', item.x);
        el.setAttributeNS(null, 'y', item.y);
        el.setAttributeNS(null, 'width', item.w);
        el.setAttributeNS(null, 'height', item.h);
      break;

      case 'hole':
        el.setAttributeNS(null, 'x', 0);
        el.setAttributeNS(null, 'y', 0);
        el.setAttributeNS(null, 'd', `M0 0 h${this.width} v${this.height} h-${this.width}z M${item.x} ${item.y} v${item.h} h${item.w} v-${item.h}z`);
        break;

    }

  }

  getElementForItem(item) {
    let id = item.id;

    if (!this.elMap[id]) {
      this.elMap[id] = this.createElementForItem(item);
    }
    return this.elMap[id];
  }

  createElementForItem(item) {
    let el;

    switch(item.code) {
      case 'image':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        el.setAttributeNS(null, 'x', '0');
        el.setAttributeNS(null, 'y', '0');
        el.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');

        el.setAttributeNS('http://www.w3.org/1999/xlink','href', item.el.src);
        el.setAttributeNS(null, 'width', item.originalWidth);
        el.setAttributeNS(null, 'height', item.originalHeight);

        return el;

      case 'rectangle':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        el.setAttributeNS(null, 'x', item.x);
        el.setAttributeNS(null, 'y', item.y);
        el.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');
        el.setAttributeNS(null, 'fill', '#fff');
        el.setAttributeNS(null, 'width', item.w);
        el.setAttributeNS(null, 'height', item.h);

        el.setAttributeNS(null, 'fill', '#00f');
        el.setAttributeNS(null, 'stroke', '#000');
        el.setAttributeNS(null, 'fill-opacity', .3);

        return el;
        

      case 'hole':
        el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        el.setAttributeNS(null, 'x', item.x);
        el.setAttributeNS(null, 'y', item.y);
        el.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');

        //el.setAttributeNS(null, 'd', `M0 0 h${this.width} v${this.height} h-${this.width}z`);
        //el.setAttributeNS(null, 'd', `M0 0 h${this.width} v${this.height} h-${this.width}z`);

        
        el.setAttributeNS(null, 'fill', '#fff');
        el.setAttributeNS(null, 'fill-rule', 'evenodd');
        el.setAttributeNS(null, 'stroke', '#000');
        el.setAttributeNS(null, 'fill-opacity', .8);


        return el;
    }

  }


}