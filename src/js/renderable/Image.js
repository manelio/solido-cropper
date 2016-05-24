import SDOM from 'solido-dom';
import Renderable from './Renderable';

export default class ImageObject extends Renderable {


  constructor(image) {
    super();
    this.ready = false;
    this.code = 'image';
    this._constructor(image);
  }

  _constructor(image) {
    if (image) {
      this.setImage(image);
    }
  }

  setImage(image) {
    this.ready = false;

    if (SDOM.isElement(image)) {
      this.el = image;
    } else {
      this.el = new Image;
      this.el.src = image;
      image = this.el;
    }

    if (image.complete) {
      this.onImageLoaded();
    }
    else {
      this.eventEmitter.emit('loading', this);
      SDOM.addEventListener(image, 'load', this.onImageLoaded.bind(this));
    }
  }

  onImageLoaded() {
    this.originalWidth = this.el.naturalWidth;
    this.originalHeight = this.el.naturalHeight;

    this.w = this.originalWidth;
    this.h = this.originalHeight;

    this.eventEmitter.emit('loaded', this);
    this.eventEmitter.emit('ready', this);
    this.ready = true;
  }

}