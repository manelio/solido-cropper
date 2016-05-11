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
    this.el.setAttributeNS(null,'width', w);
    this.el.setAttributeNS(null,'height', h);
  }

  addItem(item) {
    super.addItem(item);
    let el = this.getElementForItem(item);
    uDOM.append(this.groupEl, el);
  }

  renderItem(item) {
    let el = this.getElementForItem(item);
    let m = this.m;
  }

  getElementForItem(item) {
    if (!this.svgImage) {
      this.svgImage = this.createElementForItem(item);
    }
    return this.svgImage;
  }

  createElementForItem(item) {
    let svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    svgImage.setAttributeNS(null, 'x', '0');
    svgImage.setAttributeNS(null, 'y', '0');
    svgImage.setAttributeNS(null, 'transform', 'matrix(1 0 0 1 0 0)');

    svgImage.setAttributeNS('http://www.w3.org/1999/xlink','href', item.el.src);
    svgImage.setAttributeNS(null, 'width', item.originalWidth);
    svgImage.setAttributeNS(null, 'height', item.originalHeight);

    return svgImage;
  }


}