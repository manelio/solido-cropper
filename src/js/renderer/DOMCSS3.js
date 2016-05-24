import uDOM from '../uDOM';
import Layer from './Layer';

export default class SVG extends Layer {

  constructor() {
    super();

    let el = uDOM.createElement('div');
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

  }

  addItem(item) {
    super.addItem(item);

    let el = this.getElementForItem(item);

    console.log(this.el);
    console.log(el);

    el.style.display = 'block';

    uDOM.append(this.el, el);
  }

  renderItem(item) {
    let el = this.getElementForItem(item);
    let m = this.m;
  }

  getElementForItem(item) {
    if (!this.image) {
      this.image = this.createElementForItem(item);
    }
    return this.image;
  }

  createElementForItem(item) {
    return item.el;
  }


}