import uDOM from '../uDOM';
import Renderable from './Renderable';

export default class Image extends Renderable {

  code = 'image';

  constructor(image) {
    super();
    this.setImage(image);
  }

  setImage(image) {
    this.el = image;

    if (image.complete) {
      this.onImageLoaded();
    }
    else {
      uDOM.addEventListener(image, 'load', this.onImageLoaded.bind(this));
    }
  }

  onImageLoaded() {
    this.originalWidth = this.el.naturalWidth;
    this.originalHeight = this.el.naturalHeight;

    this.w = this.originalWidth;
    this.h = this.originalHeight;
  }

}