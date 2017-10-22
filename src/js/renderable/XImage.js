import TransformationMatrix2D from '../TransformationMatrix2D';
import RenderableImage from './Image';

export default class XImage extends RenderableImage {

  _constructor(image) {

    this.code = 'ximage';
    this.minSide = 1024;
    this.downscaleRatio = 2;
    this.zoomLevelInfo = {};

    this.tileSide = 256;

    this.offcanvas = {};
    this.tiles = {};
    this.building = {};

    super._constructor(image);
  }

  onImageLoaded() {
    super.onImageLoaded();
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
        scale: smallerScale
      }

      if (smallerW < minSide && smallerH < minSide) break;

      zoomLevel++;
      smallerW = Math.ceil(smallerW / this.downscaleRatio);
      smallerH = Math.ceil(smallerH / this.downscaleRatio);

      smallerScale = smallerScale / this.downscaleRatio;
    }

    this.maxZoomLevel = zoomLevel;

    //console.log(this.zoomLevelInfo);
    
  }

  getRenderInfoForZoomLevel(zoomLevel) {
    let zoomLevelInfo = this.zoomLevelInfo[zoomLevel];
    return zoomLevelInfo;
  }

  getRenderInfo(matrix) {

    let scale = matrix.getScaleX();
    
    let zoomLevel = -(Math.ceil(Math.log(scale) / Math.log(this.downscaleRatio)));
    if (zoomLevel < 0) {
      zoomLevel = 0;
    } else if (zoomLevel > this.maxZoomLevel) {
      zoomLevel = this.maxZoomLevel;
    }

    let renderInfo = this.getRenderInfoForZoomLevel(zoomLevel);

    let m = new TransformationMatrix2D(matrix.getMatrix());
    m.scale(1/renderInfo.scale);
    m.invert();

    // get the viewport vertices transformed to the image coordinates system
    let V00 = m.transformPoint(0, 0);
    let V10 = m.transformPoint(this.Cw, 0);
    let V11 = m.transformPoint(this.Cw, this.Ch);
    let V01 = m.transformPoint(0, this.Ch);


    // calculate the viewport bounding box
    let BB00x = Math.min(V00[0], V01[0], V11[0], V10[0]);
    let BB00y = Math.min(V00[1], V01[1], V11[1], V10[1]);
    let BB11x = Math.max(V00[0], V01[0], V11[0], V10[0]);
    let BB11y = Math.max(V00[1], V01[1], V11[1], V10[1]);

    let BB00 = [Math.floor(BB00x), Math.floor(BB00y)];
    let BB11 = [Math.ceil(BB11x), Math.ceil(BB11y)];

    let BBw = BB11x - BB00x;
    let BBh = BB11y - BB00y;

    if (BB00y < 0) {
      BBh += BB00y;
      BB00y = 0;
    }

    if (BB00x < 0) {
      BBw += BB00x;
      BB00x = 0;
    }

    if (BB11x > renderInfo.w) {
      BBw -= (BB11x - renderInfo.w);
    }

    if (BB11y > renderInfo.h) {
      BBh -= (BB11y - renderInfo.h);
    }

    let tilex0 = Math.floor(BB00x / this.tileSide);
    let tiley0 = Math.floor(BB00y / this.tileSide);

    let tilex1 = Math.ceil((BB00x + BBw) / this.tileSide);
    let tiley1 = Math.ceil((BB00y + BBh) / this.tileSide);

    let tilesw1 = tilex1 - tilex0;
    let tilesh1 = tiley1 - tiley0;

    //console.log(`tiles: x0: ${tilex0}, y0: ${tiley0}, w1: ${tilesw1}, h1: ${tilesh1}`);

    let info = {
      source: renderInfo.source,
      w: renderInfo.w,
      h: renderInfo.h,
      
      tilesw: renderInfo.tilesw,
      tilesh: renderInfo.tilesh,

      tilex0: tilex0,
      tiley0: tiley0,
      tilesw1: tilesw1,
      tilesh1: tilesh1,

      x0: BB00x,
      y0: BB00y,
      w0: BBw,
      h0: BBh,

      x1: BB00x,
      y1: BB00y,
      w1: BBw,
      h1: BBh,

      zoomLevel: zoomLevel,
      scale: renderInfo.scale
    };

    return info;
  }

}