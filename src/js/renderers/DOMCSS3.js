import SDOM from 'solido-dom';
import Layer from './Layer';

export default class DOMCSS3 extends Layer {

  constructor() {
    super();

    let el = SDOM.createElement('div');
    el.className = 'domcss3-layer';
    el.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; transform-origin: top left';
    
    this.el = el;
  }

  render() {
    let m = this.transformationMatrix.getMatrix();
    this.m = m;

    this.el.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;

    this.items.forEach(function(item, i) {
      this.renderItem(item);
    }.bind(this));

    this.dirty = false;
  }

  addItem(item) {

    super.addItem(item);
    let el = this.getElementForItem(item);

    if (!el) return;

    if (0 && item.eventEmitter) {
      item.eventEmitter.addListener('ready', function(object) {
        item.el.style.display = 'block';
        SDOM.append(this.el, item.el);
      }.bind(this));
    } else {
      el.style.display = 'block';
      SDOM.append(this.el, el);
    }

  }

  renderItem(item) {

    switch(item.code) {
      case 'controlbox':
        let el = this.getElementForItem(item);

        el.style.top = item.y + 'px';
        el.style.left = item.x + 'px';
        el.style.width = (item.w - 4) + 'px';
        el.style.height = (item.h - 4) + 'px';

        if (!item.drawHandles && !item.hiddenHandles) {
          SDOM.addClassName(el, '__solidocropper-controlbox-hide-handles');
          item.hiddenHandles = true;
        } 

        if (item.drawHandles && item.hiddenHandles) {
          SDOM.removeClassName(el, '__solidocropper-controlbox-hide-handles');
          item.hiddenHandles = false;
        } 

      break;
    }

    let el = this.getElementForItem(item);
    let m = this.m;
  }

  getElementForItem(item) {

    let el = this.elMap[item.id];
    if (!el) {
      el = this.createElementForItem(item);
      this.elMap[item.id] = el;
    }
    return el;

  }

  createElementForItem(item) {

    switch(item.code) {
      case 'image':
        return item.el;
      break;

      case 'ximage':
        return item.el;
      break;

      case 'controlbox':
        let div = SDOM.createElement('div');
        div.style.cssText = `position: absolute; border: 2px solid black; top: ${item.y}px; left: ${item.x}px; width: ${item.w - 4}px; height: ${item.h - 4}px;`;
        
        let tl = this.createHandle(item, 0, 0);
        let t = this.createHandle(item, 1, 0);
        let tr = this.createHandle(item, 2, 0);

        let l = this.createHandle(item, 0, 1);
        let r = this.createHandle(item, 2, 1);

        let bl = this.createHandle(item, 0, 2);
        let b = this.createHandle(item, 1, 2);
        let br = this.createHandle(item, 2, 2);

        SDOM.append(div, tl);
        SDOM.append(div, t);
        SDOM.append(div, tr);
        SDOM.append(div, l);
        SDOM.append(div, r);
        SDOM.append(div, bl);
        SDOM.append(div, b);
        SDOM.append(div, br);

        return div;
      break;
    }

    return false;
  }

  createHandle(item, x, y) {

    let div = SDOM.createElement('div');
    SDOM.addClassName(div, '__solidocropper-controlbox-handle');
    let side = item.handleSize;
    let top = y/2 * 100;
    let left = x/2 * 100;

    let borderWidth = 2;

    let marginLeft = (-x/2) * side - borderWidth;
    let marginTop = (-y/2)* side - borderWidth;
    
    div.style.cssText = `position: absolute; border: ${borderWidth}px solid black; top: ${top}%; left: ${left}%; width: ${side}px; height: ${side}px; margin-left: ${marginLeft}px; margin-top: ${marginTop}px;`;
    return div;
  }


}