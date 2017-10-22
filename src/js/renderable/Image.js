import SDOM from 'solido-dom';
import Renderable from './Renderable';

export default class ImageObject extends Renderable {


  constructor(image) {
    super();
    this.el = new Image;
    this.ready = false;
    this.code = 'image';
    this._constructor(image);
  }

  _constructor(image) {
    if (image) {
      this.setImage(image);
    }
  }

  setImage(image, useClone) {
    this.ready = false;

    if (SDOM.isElement(image)) {
      if (useClone) {
        let src = image.src;
        image = new Image;
        image.src = src;
      }
    } else {
      let src = image;
      image = new Image;
      image.src = src;
    }

    this.el = image;

    if (image.complete) {
      setTimeout(function() {
        this.onImageLoaded()
      }.bind(this), 0);
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

    this.el.width = this.w;
    this.el.height = this.h;

    this.el.style.width = 'auto';
    this.el.style.height = 'auto';

    this.eventEmitter.emit('loaded', this);
    this.eventEmitter.emit('ready', this);
    this.ready = true;
  }

}