import uDOM from './uDOM';
import Pointer from './Pointer';

import TransformationMatrix2D from './TransformationMatrix2D';
import Layer from './Layer';

import CanvasLayer from './layer/Canvas';
import SVGLayer from './layer/SVG';
import DOMCSS3Layer from './layer/DOMCSS3';

import Element from './Element';
import SmartImage from './SmartImage';

import ImageObject from './renderable/Image';
import RectangleObject from './renderable/Rectangle';
import HoleObject from './renderable/Hole';

export default class HumbleCropper {

  constructor(options) {

    this.options = {
      background: '#fff'
    }

    this.transform = new TransformationMatrix2D();

    this.layers = [];
    this.valuesBefore = {}
    this.dom = {}

    this.keyMap = {};

    if (uDOM.isElement(options)) {
      var key = options.tagName === 'IMG'?'image':'container';
      var el = options;
      options = {};
      options[key] = el;
    }

    Object.assign(this.options, options);
    options = this.options;

    this.prepareDom();
    this.prepareEvents();
  }

  addLayer(layer) {
    this.layers.push(layer);
    uDOM.append(this.dom.container, layer.el);
  }

  prepareDom() {
    let options = this.options;

    this.dom.image = options.image;

    if (!options.container) {
      let container = uDOM.createElement('div');
      container.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden;';
      
      uDOM.addClassName(container, '__humblecropper-container');
      uDOM.after(this.dom.image, container);
      options.container = container;
    }

    this.dom.container = options.container;

    let layer = new CanvasLayer();
    //let layer = new SVGLayer();
    layer.id = 'image';
    this.imageLayer = layer;

    layer.transformationMatrix = this.transform;
    let imageObject = new ImageObject(this.dom.image);
    layer.addItem(imageObject);
    this.addLayer(layer);

    layer = new CanvasLayer();
    //layer = new SVGLayer();
    layer.id = 'overlay';
    let object;

    object = new HoleObject({
      x: 0, y: 0, w: 0, h: 0
    });
    object.id = 'viewport';
    this.viewport = object;
    layer.addItem(object);

    object = new RectangleObject({
      x: 0, y: 0, w: 50, h: 50
    });
    this.viewportHandler = object;

    object.capture = true;
    object.onChangePosition = this.doMoveHandler.bind(this);
    layer.addItem(object);

    this.addLayer(layer);
  }

  prepareEvents() {
    this.onImageLoaded = this.onImageLoaded.bind(this);

    this.onDocumentReady = this.onDocumentReady.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);
    
    uDOM.addEventListener(document, 'keydown', function(e) {
      let keyCode = e.keyCode;
      this.keyMap[keyCode] = true;
    }.bind(this));

    uDOM.addEventListener(document, 'keyup', function(e) {
      let keyCode = e.keyCode;
      this.keyMap[keyCode] = false;
    }.bind(this));

    uDOM.addEventListener(this.dom.container, 'contextmenu', function(e) { uDOM.stopEvent(e); return false });
    uDOM.addEventListener(this.dom.container, 'click', function(e) { uDOM.stopEvent(e); return false });

    uDOM.addEventListener(document, 'DOMContentLoaded', this.onDocumentReady);
    uDOM.addEventListener(window, 'resize', this.onWindowResized);


    let pointer = new Pointer(this.dom.container, {
      onBefore: function() {
        this.valuesBefore.matrix = this.transform.getMatrix();
      }.bind(this),

      onWheel: this.onWheel.bind(this),
      onPointerStart: this.onPointerStart.bind(this),
      onPointerMove: this.onPointerMove.bind(this)
    });

  }

  captureItem(x, y) {
    for (var i in this.layers) {
      let layer = this.layers[i];

      let inverseTransformationMatrix = layer.transformationMatrix.inverse();
      let transformedPoint = inverseTransformationMatrix.transformPoint(x, y);
      let tpx = transformedPoint[0];
      let tpy = transformedPoint[1];

      for (var j in layer.items) {
        let item = layer.items[j];

        if (
          tpx > item.x && 
          tpx < item.x + item.w &&
          tpy > item.y &&
          tpy < item.y + item.h && 
          item.capture
        ) {
          return item;
        }

      }
    }
    
    return false;
  }

  onPointerStart(info) {
    
    let e = info.event;

    let item = this.captureItem(info.x, info.y);

    if (item) {
      
      this.origx = item.x;
      this.origy = item.y;

      this.activeItem = item;
      this.tool = this.doMoveItem;

    } else {
      if (!e.which || e.which == 1) {
        this.tool = this.doPan;
      } else if (e.which == 2) {
        this.tool = this.doRotate;
      } else {
        this.tool = this.doZoom;
      }

    }

  }

  onPointerMove(info) {

    if (info.npointers === 1) {
      let delta = {
        x: info.deltaX,
        y: info.deltaY
      };

      let point = {
        x: info.x0,
        y: info.y0
      };

      this.tool(delta, point);
    
    } else {

      let l = Math.sqrt(info.vector.x * info.vector.x + info.vector.y * info.vector.y);
      let deltal = l - info.l0;
      var ang = Math.atan2(info.vector.y, info.vector.x) - Math.atan2(info.vector0.y, info.vector0.x);
      
      let factor = deltal / info.l0;

      this.transform
        .setId()
        .translate(info.x, info.y)
        .translate(info.deltaX, info.deltaY)
        .scale(1 + factor)
        .rotate(ang)
        .translate(-info.x, -info.y)
        .multiply(this.valuesBefore.matrix)
      ;

      this.imageLayer.dirty = true;

    }

    this.refresh();
  }

  onWheel(info) {
    this.valuesBefore.matrix = this.transform.getMatrix();

    let delta = {
      x: info.deltaX,
      y: info.deltaY
    };

    let point = {
      x: info.x0,
      y: info.y0
    };

    this.doZoom(delta, point);
    this.refresh();
  }

  onDocumentReady() {
    this.prepareCanvas();
    this.prepareImage();
  }

  prepareImage() {
    if (this.dom.image.complete) this.onImageLoaded.bind(this)();
    else {
      uDOM.addEventListener(this.dom.image, 'load', this.onImageLoaded)
    }
  }

  onWindowResized() {
    this.prepareCanvas();
    this.layers.forEach(function(layer) {
      layer.dirty = true;
    });
    this.refresh();
  }

  onImageLoaded() {
    let image = this.dom.image;
    let 
      Iw = image.naturalWidth,
      Ih = image.naturalHeight
    ;

    this.Iw = Iw;
    this.Ih = Ih;

    console.log(`Original image size: ${Iw} x ${Ih}`);

    this.prepareCanvas();
    this.initialize();
  }

  prepareCanvas() {
    let
      ContainerW = this.dom.container.offsetWidth,
      ContainerH = this.dom.container.offsetHeight
    ;

    this.Cw = ContainerW;
    this.Ch = ContainerH;

    this.layers.forEach(function(layer) {
      layer.setSize(ContainerW, ContainerH)
    });

  }

  doPan(delta) {
    this.transform
      .setId()
      .translate(delta.x, delta.y)
      .multiply(this.valuesBefore.matrix)
    ;

    this.imageLayer.dirty = true;

  }

  doZoom(delta, relativePoint) {
    let factor = delta.y / 600.0;

    this.transform
      .setId()
      .translate(relativePoint.x, relativePoint.y)
      .scale(1-factor)
      .translate(-relativePoint.x, -relativePoint.y)
      .multiply(this.valuesBefore.matrix)
    ;

    this.imageLayer.dirty = true;

  }

  doRotate(delta, relativePoint) {
    let ang = delta.y / 100;

    this.transform
      .setId()
      .translate(relativePoint.x, relativePoint.y)
      .rotate(ang)
      .translate(-relativePoint.x, -relativePoint.y)
      .multiply(this.valuesBefore.matrix)
    ;

    this.imageLayer.dirty = true;

  }

  doMoveItem(delta) {
    this.activeItem.setPosition(this.origx + delta.x, this.origy + delta.y);
  }

  doMoveHandler(item) {

    let x0 = item.x + item.w;
    let y0 = item.y + item.h;

    let w = 2*x0 - this.Cw;
    let h = 2*y0 - this.Ch;
    let x = x0 - w;
    let y = y0 - h;

    if (w < 0) {
      w = -w;
      x = x - w;
      
    }

    if (h < 0) {
      h = -h;
      y =  y - h;
    }

    this.viewport.setPosition(x, y);
    this.viewport.setSize(w, h);
  }


  initialize() {
    let kw = this.Iw / this.Cw;
    let kh = this.Ih / this.Ch;
    let kmax = kw > kh?kw:kh;

    let k = kmax;
    var scale = 1/k;

    this.ISw = this.Iw * scale;
    this.ISh = this.Ih * scale;

    let x0 = this.Cw / 2 - this.ISw / 2;
    let y0 = this.Ch / 2 - this.ISh / 2;

    /*
    this.transform.translate(x0, y0);
    this.transform.scale(scale);

    this.viewportHandler.x = x0 + this.ISw - this.viewportHandler.w;
    this.viewportHandler.y = y0 + this.ISh - this.viewportHandler.h;

    this.doMoveHandler(this.viewportHandler);

    this.refresh();
    */

    // center to girl's eyes
    //this.center(2297, 562, 214, 70, 0);

    this.center(0, 0, this.Iw, this.Ih, 0);

  }

  updateSelectionHandler() {

    //let inverse = this.transform.inverse();
    let inverse = this.transform;
    let point = inverse.transformPoint(
      this.selection.x + this.selection.w,
      this.selection.y + this.selection.h
    );

    this.viewportHandler.x = point[0] - 50;
    this.viewportHandler.y = point[1] - 50;

    this.doMoveHandler(this.viewportHandler);
  }

  center(x, y, w, h, rotation) {
    
    rotation = rotation || 0;
    let kw = w / this.Cw;
    let kh = h / this.Ch;
    let kmax = Math.max(kw, kh);
    let kmin = Math.min(kw, kh);

    let k = kmax / .90; // percent margin

    let Cwk = this.Cw*k;
    let Chk = this.Ch*k;

    let hdiff = Chk - h;
    let wdiff = Cwk - w;

    this.selection = {
      x: x,
      y: y,
      w: w,
      h: h,
      rotation: rotation
    };

    //this.transform.translate(x - wdiff / 2, y - hdiff / 2);
    this.transform.translate(x, y);
    this.transform.translate(w/2, h/2);
    this.transform.rotate(rotation);
    this.transform.translate(-w/2, -h/2);
    this.transform.translate(- wdiff / 2, - hdiff / 2);
    this.transform.scale(k);
    this.transform.invert();

    this.updateSelectionHandler();

    this.refresh();
  }

  refresh() {
    uDOM.requestAnimationFrame(this.render.bind(this));
  }

  render() {
    this.layers.forEach(function(layer) {
      if (layer.dirty) {
        layer.render();
      }
    }.bind(this));
  }

}