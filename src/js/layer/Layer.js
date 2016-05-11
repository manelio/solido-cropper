import TransformationMatrix2D from '../TransformationMatrix2D';

export default class Canvas {

  constructor() {
    this.items = [];
    this.elMap = {};

    this.transformationMatrix = new TransformationMatrix2D();
  }

  setSize(w, h) {

  }

  addItem(item) {
    this.items.push(item);
  }

}
