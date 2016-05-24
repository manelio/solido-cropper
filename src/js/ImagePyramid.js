import SDOM from 'solido-dom';
import JobQueue from './JobQueue';

export default class ImagePyramid {

  constructor(image, options) {

    this.options = {
      ready: function() {}
    };
    options = options || {};

    Object.assign(this.options, options);

    this.minSide = 1024;
    this.downscaleRatio = 2;
    this.tileSide = 256;

    this.zoomLevelInfo = {};
    this.tiles = {};

    this._constructor(image);
  }

  _constructor(image) {
    this.setImage(image);
  }

  setImage(image) {
    this.el = image;

    if (image.complete) {
      this.onImageLoaded();
    }
    else {
      SDOM.addEventListener(image, 'load', this.onImageLoaded.bind(this));
    }
  }

  onImageLoaded() {
    this.originalWidth = this.el.naturalWidth;
    this.originalHeight = this.el.naturalHeight;

    this.w = this.originalWidth;
    this.h = this.originalHeight;

    console.log(`image loaded: ${this.w}x${this.h}`);

    this.initialize();
  }

  initialize() {
    let el = this.el;
    let minSide = this.minSide;
    let downscaleRatio = this.downscaleRatio;

    this.originalWidth = el.naturalWidth;
    this.originalHeight = el.naturalHeight;

    let Iw = this.originalWidth;
    let Ih = this.originalHeight;

    let smallerW = Iw;
    let smallerH = Ih;
    let smallerScale = 1;
    let zoomLevel = 0;

    while(zoomLevel < 16) {

      let tilesw = Math.ceil(smallerW / this.tileSide);
      let tilesh = Math.ceil(smallerH / this.tileSide);

      this.zoomLevelInfo[zoomLevel] = {
        w: smallerW,
        h: smallerH,
        tilesw: tilesw,
        tilesh: tilesh,
        ntiles: tilesw*tilesh,
        scale: smallerScale,
        tilesPerSide0: Math.pow(this.downscaleRatio, zoomLevel)
      }

      if (smallerW < minSide && smallerH < minSide) break;

      zoomLevel++;
      smallerW = Math.ceil(smallerW / this.downscaleRatio);
      smallerH = Math.ceil(smallerH / this.downscaleRatio);

      smallerScale = smallerScale / this.downscaleRatio;
    }

    this.maxZoomLevel = zoomLevel;

    this.options.ready(this);
  }

  getTileKey(zoomLevel, i, j) {
    return `${zoomLevel}:${i},${j}`;
  }

  getTile(zoomLevel, i, j, onComplete) {
    console.log(`getTile(${zoomLevel}, ${i}, ${j})`);
    let key = this.getTileKey(zoomLevel, i, j);
    let tile;

    if (!(key in this.tiles)) {
      this.requestForTile(zoomLevel, i, j, function(source) {
        onComplete({
          source: source,
          zoomLevel: zoomLevel,
          i: i,
          j: j
        })
      });
      tile = this.getBestAlternateTile(zoomLevel, i, j);
      onComplete(tile);
      return tile;
    }

    return this.tiles[key];
  }

  requestForTile(zoomLevel, i, j, onComplete) {
    console.log(`requestForTile(${zoomLevel}, ${i}, ${j})`);

    JobQueue.addJob(function(callback) {
      this.buildTile(zoomLevel, i, j, onComplete, callback);
    }.bind(this));

  }

  buildTile(zoomLevel, i, j, onComplete, callback) {
    let source = false;
    onComplete(source);
    callback(source);
  }

  getBestAlternateTile(zoomLevel, i, j) {
    let source = false;

    return {
      source: source,
      zoomLevel: zoomLevel,
      i: i,
      j: j
    }
  }

}
