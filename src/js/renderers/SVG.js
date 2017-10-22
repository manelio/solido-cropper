import SDOM from 'solido-dom';
import Layer from './Layer';

export default class SVG extends Layer {

  constructor() {

    super();

    let el = document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttributeNS(null,'xlink','http://www.w3.org/1999/xlink');
    el.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%;';

    let groupEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupEl.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');
    groupEl.setAttributeNS(null, 'stroke-width', '0');

    SDOM.append(el, groupEl);

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

    this.dirty = false;
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
      SDOM.append(this.groupEl, el);
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

      case 'controlbox':
        el.setAttributeNS(null, 'x', item.x);
        el.setAttributeNS(null, 'y', item.y);
        el.setAttributeNS(null, 'width', item.w);
        el.setAttributeNS(null, 'height', item.h);

        if (!item.drawHandles && !item.hiddenHandles) {
          item.tl.setAttributeNS(null, 'display', 'none');
          item.t.setAttributeNS(null, 'display', 'none');
          item.tr.setAttributeNS(null, 'display', 'none');
          item.l.setAttributeNS(null, 'display', 'none');
          item.r.setAttributeNS(null, 'display', 'none');
          item.bl.setAttributeNS(null, 'display', 'none');
          item.b.setAttributeNS(null, 'display', 'none');
          item.br.setAttributeNS(null, 'display', 'none');

          item.hiddenHandles = true;
        }

        if (item.drawHandles && item.hiddenHandles) {
          item.tl.setAttributeNS(null, 'display', 'block');
          item.t.setAttributeNS(null, 'display', 'block');
          item.tr.setAttributeNS(null, 'display', 'block');
          item.l.setAttributeNS(null, 'display', 'block');
          item.r.setAttributeNS(null, 'display', 'block');
          item.bl.setAttributeNS(null, 'display', 'block');
          item.b.setAttributeNS(null, 'display', 'block');
          item.br.setAttributeNS(null, 'display', 'block');

          item.hiddenHandles = false;
        } 
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
      case 'ximage':

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

      case 'controlbox':

        let el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        el.setAttributeNS(null, 'x', item.x);
        el.setAttributeNS(null, 'y', item.y);
        el.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');
        el.setAttributeNS(null, 'width', item.w);
        el.setAttributeNS(null, 'height', item.h);
        el.setAttributeNS(null, 'stroke-width', '0');


        let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttributeNS(null, 'x', 0);
        rect.setAttributeNS(null, 'y', 0);
        rect.setAttributeNS(null, 'width', '100%');
        rect.setAttributeNS(null, 'height', '100%');

        rect.setAttributeNS(null, 'stroke-width', '1');
        rect.setAttributeNS(null, 'stroke', '#000');
        
        rect.setAttributeNS(null, 'fill-opacity', 0);

        let tl = this.createHandle(item, 0, 0);
        let t = this.createHandle(item, 1, 0);
        let tr = this.createHandle(item, 2, 0);

        let l = this.createHandle(item, 0, 1);
        let r = this.createHandle(item, 2, 1);

        let bl = this.createHandle(item, 0, 2);
        let b = this.createHandle(item, 1, 2);
        let br = this.createHandle(item, 2, 2);

        SDOM.append(el, tl);
        SDOM.append(el, t);
        SDOM.append(el, tr);
        SDOM.append(el, l);
        SDOM.append(el, r);
        SDOM.append(el, bl);
        SDOM.append(el, b);
        SDOM.append(el, br);

        item.tl = tl;
        item.t = t;
        item.tr = tr;
        item.l = l;
        item.r = r;
        item.bl = bl;
        item.b = b;
        item.br = br;
        
        SDOM.append(el, rect);

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

  createHandle(item, x, y) {

    let side = item.handleSize;
    let top = y/2 * 100;
    let left = x/2 * 100;

    let marginLeft = (-x/2) * side;
    let marginTop = (-y/2) * side;

    let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttributeNS(null, 'x', top + '%');
    rect.setAttributeNS(null, 'y', left + '%');
    rect.setAttributeNS(null, 'width', side);
    rect.setAttributeNS(null, 'height', side);
    rect.setAttributeNS(null, 'fill', '#fff');

    rect.setAttributeNS(null, 'stroke-width', '1');
    rect.setAttributeNS(null, 'stroke', '#000');

    rect.setAttributeNS(null, 'fill-opacity', .25);
    rect.setAttributeNS(null, 'transform', `translate(${marginTop} ${marginLeft})`);
    return rect;
  }



}