import TransformationMatrix2D from '../TransformationMatrix2D';

export default class Layer {

  constructor() {
    this.dirty = false;

    this.items = [];
    this.elMap = {};

    this.transformationMatrix = new TransformationMatrix2D();
  }

  setSize(w, h) {
    this.dirty = true;
  }

  addItem(item) {
    item.layer = this;
    this.items.push(item);
    this.dirty = true;
  }

}
