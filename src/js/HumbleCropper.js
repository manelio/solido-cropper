import uDOM from './uDOM';
import Pointer from './Pointer';

import TM2D from './TransformationMatrix2D';
import Layer from './Layer';

import CanvasLayer from './layer/Canvas';
import SVGLayer from './layer/SVG';
import DOMCSS3Layer from './layer/DOMCSS3';

import Element from './Element';
import SmartImage from './SmartImage';
import ImageObject from './renderable/Image';

export default class HumbleCropper {

  constructor(options) {

    this.options = {
      background: '#fff'
    }

    this.valuesBefore = {}

    this.dom = {}

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

    let layer;
    if (window.location.hash === '#domcss3') {
      layer = new DOMCSS3Layer();
    } else if (window.location.hash === '#svg') {
      layer = new SVGLayer();
    } else {
      layer = new CanvasLayer();
    }
    //let layer = new CanvasLayer();
    //let layer = new SVGLayer();

    let imageObject = new ImageObject(this.dom.image);
    
    layer.addItem(imageObject);

    uDOM.append(this.dom.container, layer.el);

    this.layer = layer;

  }

  prepareEvents() {
    this.onImageLoaded = this.onImageLoaded.bind(this);


    this.onDocumentReady = this.onDocumentReady.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);
    
    uDOM.addEventListener(this.dom.container, 'contextmenu', function(e) { uDOM.stopEvent(e); return false });
    uDOM.addEventListener(this.dom.container, 'click', function(e) { uDOM.stopEvent(e); return false });

    uDOM.addEventListener(document, 'DOMContentLoaded', this.onDocumentReady);
    uDOM.addEventListener(window, 'resize', this.onWindowResized);

    this.onBefore = (function() {
      this.valuesBefore.matrix = this.transform.getMatrix();
    }).bind(this);

    this.onMouseDown = (function(e) {
      if (!e.which || e.which == 1) {
        this.tool = this.doPan;
      } else if (e.which == 2) {
        this.tool = this.doRotate;
      } else {
        this.tool = this.doZoom;
      }
    }).bind(this);

    this.onMove = (function(e, delta, point) {
      
      this.tool(delta, point);
      this.refresh();

    }).bind(this);

    let _this = this;

    let pointer = new Pointer(this.dom.container, {
      onBefore: this.onBefore,
      onMouseDown: this.onMouseDown,
      onMove: this.onMove,
      onWheel: function(e, delta, point) {
        _this.doZoom(delta, point);
        _this.refresh();
      }
    });
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

    this.layer.setSize(this.Cw, this.Ch)

  }

  doPan(delta) {
    this.transform
      .setId()
      .translate(delta.x, delta.y)
      .multiply(this.valuesBefore.matrix)
    ;
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

  }


  initialize() {
    let kw = this.Iw / this.Cw;
    let kh = this.Ih / this.Ch;
    let kmax = kw > kh?kw:kh;

    let k = kmax;
    var scale = 1/k;

    this.ISw = this.Iw * scale;
    this.ISh = this.Ih * scale;
    
    this.transform = new TM2D();
    this.transform.translate(this.Cw / 2 - this.ISw / 2, this.Ch / 2 - this.ISh / 2);
    this.transform.scale(scale);
    
    this.refresh();
  }

  refresh() {
      this.dirty = true;
      uDOM.requestAnimationFrame(this.render.bind(this));
  }

  render() {
    this.layer.transformationMatrix = this.transform;
    this.layer.render();
  }

  fith() {
    let kw = this.Iw / this.Cw;
    let kh = this.Ih / this.Ch;
    
    let k = kh;
    var scale = 1/k;

    this.ISw = this.Iw * scale;
    this.ISh = this.Ih * scale;
    
    this.transform = new TM2D();
    this.transform.translate(this.Cw / 2 - this.ISw / 2, this.Ch / 2 - this.ISh / 2);
    this.transform.scale(scale);
    
    this.refresh();
  }

  fitw() {
    let kw = this.Iw / this.Cw;
    let kh = this.Ih / this.Ch;
    
    let k = kw;
    var scale = 1/k;

    this.ISw = this.Iw * scale;
    this.ISh = this.Ih * scale;
    
    this.transform = new TM2D();
    this.transform.translate(this.Cw / 2 - this.ISw / 2, this.Ch / 2 - this.ISh / 2);
    this.transform.scale(scale);
    
    this.refresh();
  }

  random() {
    var x = Math.random() * (this.Iw - 40);
    var y = Math.random() * (this.Ih - 40);

    var w = Math.random() * (this.Iw - x);
    var h = Math.random() * (this.Ih - y);

    this.rect = {
      x: x,
      y: y,
      w: w,
      h: h
    }

    let kw = w / this.Cw;
    let kh = h / this.Ch;
    let kmax = kw > kh?kw:kh;

    let k = kmax;
    var scale = 1/k;

    var ISw = w * scale;
    var ISh = h * scale;

    this.translation = {x: this.Cw / 2 - ISw / 2 - x, y: this.Ch / 2 - ISh / 2 - y};
    this.rotation = 0;
    this.scale = scale;

    this.refresh();
  }



}