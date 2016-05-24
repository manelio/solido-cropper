import SDOM from 'solido-dom';

import EventEmitter from './events/EventEmitter';

import Animator from './Animator';
import Pointer from './Pointer';

import TransformationMatrix2D from './TransformationMatrix2D';

import CanvasLayer from './layer/Canvas';
import SVGLayer from './layer/SVG';
import DOMCSS3Layer from './layer/DOMCSS3';

import ImageObject from './renderable/Image';
import XImageObject from './renderable/XImage';
import RectangleObject from './renderable/Rectangle';
import HoleObject from './renderable/Hole';

import CanvasImagePyramid from './CanvasImagePyramid';

import Easing from 'easing';

let frameRequestId = 0;

export default class HumbleCropper {

  constructor(options) {

    this.options = {
      background: '#fff'
    }

    this.animator = new Animator();
    this.transform = new TransformationMatrix2D();

    this.layers = [];
    this.valuesBefore = {}
    this.dom = {}

    this.keyMap = {};

    if (SDOM.isElement(options)) {
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
    SDOM.append(this.dom.container, layer.el);
  }

  setLoading(status) {
    if (status) {
      if (this.loadingOverlay) return;
      let loadingOverlay = SDOM.createElement('div');
      loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; overflow: hidden; background: #fff';
      SDOM.addClassName(loadingOverlay, '__humblecropper-loading');


      let loadingOverlayInner = SDOM.createElement('div');
      loadingOverlayInner.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); font-size: 10px;';
      loadingOverlayInner.innerHTML = 'Loading image ...';
      SDOM.append(loadingOverlay, loadingOverlayInner);

      SDOM.after(this.dom.container, loadingOverlay);
      this.loadingOverlay = loadingOverlay;

      this.animator.addAnimation({
        id: 'loading',
        data: loadingOverlayInner,
        
        action: function() {
          let deg = (this.t / 30) % 360;
          this.data.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`
        }
      });
      

    } else {

      this.animator.endAnimation('loading');

      let _this = this;

      this.animator.addAnimation({
        data: this.loadingOverlay,
        duration: 800,
        action: function() {
          this.data.style.opacity = 1 - this.t / this.duration;
        },
        end: function() {
          this.data.remove();
          _this.loadingOverlay = false;
        }
      });

    }
  }

  prepareDom() {
    let options = this.options;

    this.dom.image = options.image;

    if (!options.container) {
      let container = SDOM.createElement('div');
      container.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; overflow: hidden;';
      SDOM.addClassName(container, '__humblecropper-container');
      SDOM.after(this.dom.image, container);
      options.container = container;
    }
    this.dom.container = options.container;

    this.setLoading(true);

    let renderer = CanvasLayer;

    let layer = new renderer();
    layer.id = 'image';
    this.imageLayer = layer;

    layer.transformationMatrix = this.transform;
    
    let imageObject = new XImageObject();
    
    imageObject.eventEmitter.addListener('ready', function(object) {
      this.setLoading(false);
      this.onImageLoaded();
      this.imageLayer.dirty = true;
      this.refresh();
    }.bind(this));

    this.imageObject = imageObject;

    layer.addItem(imageObject);

    //let smartImage = new SmartImage(this.dom.image);

    this.addLayer(layer);

    layer = new renderer();
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

    imageObject.setImage(this.dom.image);


    // debug info box

    let debugInfoBox = SDOM.createElement('div');
    debugInfoBox.style.cssText = 'position: absolute; top: 15px; left: 15px;';
    SDOM.addClassName(debugInfoBox, '__humblecropper-debug-info-box');
    SDOM.append(this.dom.container, debugInfoBox);

    debugInfoBox.innerHTML = 'xxx';
    
    this.dom.debugInfoBox = debugInfoBox;

    this.refresh();
  }

  prepareEvents() {
    this.onImageLoaded = this.onImageLoaded.bind(this);

    this.onDocumentReady = this.onDocumentReady.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);
    
    SDOM.addEventListener(document, 'keydown', function(e) {
      let keyCode = e.keyCode;

      if (keyCode === 65) {

        this.status = {};

        this.status.translation0 = this.transform.inverse().transformPoint(this.Cw / 2, this.Ch / 2);
        this.status.rotation0 = this.transform.getRotation();
        this.status.scale0 = this.transform.getScaleX();

        console.log(this.status);

      } else if (keyCode === 50) {
        let s = this.status;

        this.targetPoint(s.translation0[0], s.translation0[1], s.scale0, s.rotation0);
      } else if (keyCode === 49) {
        this.targetRandomPoint();
      }

      //console.log(keyCode);

      this.keyMap[keyCode] = true;
    }.bind(this));

    SDOM.addEventListener(document, 'keyup', function(e) {
      let keyCode = e.keyCode;
      this.keyMap[keyCode] = false;
    }.bind(this));

    SDOM.addEventListener(this.dom.container, 'contextmenu', function(e) { SDOM.stopEvent(e); return false });
    SDOM.addEventListener(this.dom.container, 'click', function(e) { SDOM.stopEvent(e); return false });

    SDOM.addEventListener(document, 'DOMContentLoaded', this.onDocumentReady);
    SDOM.addEventListener(window, 'resize', this.onWindowResized);

    let pointer = new Pointer(this.dom.container, {
      onBefore: function() {
        this.valuesBefore.matrix = this.transform.getMatrix();
      }.bind(this),

      onWheel: this.onWheel.bind(this),
      onPointerStart: this.onPointerStart.bind(this),
      onPointerMove: this.onPointerMove.bind(this),
      onPointerClick: function() {
        // console.log('click!');
      }
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
      if ((!e.which || e.which == 1) && this.keyMap[16] || e.which == 2) {
        this.tool = this.doRotate;
      } else if ((!e.which || e.which == 1)) {
        this.tool = this.doPan;
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
  }


  onWindowResized() {
    this.prepareCanvas();
    this.layers.forEach(function(layer) {
      layer.dirty = true;
    });
    this.refresh();
  }

  onImageLoaded() {
    
    this.setLoading(false);

    let image = this.imageObject;
    let 
      Iw = image.originalWidth,
      Ih = image.originalHeight
    ;

    this.Iw = Iw;
    this.Ih = Ih;

    console.log(`Original image size: ${Iw} x ${Ih}`);
    
    this.imageLayer.dirty = true;

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
    //this.doPan({x: -delta.x, y: -delta.y});
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

    console.log('IW: ' + this.Iw);
    this.valuesBefore.matrix = new TransformationMatrix2D();

    this.center(0, 0, this.Iw, this.Ih, 0);
    this.refresh();
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

  getCenter(x, y, w, h, rotation) {
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

    let m = new TransformationMatrix2D();

    m.translate(x, y);
    m.translate(w/2, h/2);
    m.rotate(rotation);
    m.translate(-w/2, -h/2);
    m.translate(- wdiff / 2, - hdiff / 2);
    m.scale(k);
    m.invert();

    /*
    m.scale(k);
    m.translate(- wdiff / 2, - hdiff / 2);
    m.translate(-w/2, -h/2);
    m.rotate(rotation);
    m.translate(w/2, h/2);
    m.translate(x, y);
    */
    return m;
  }


  center(x, y, w, h, rotation) {
    
    this.selection = {
      x: x,
      y: y,
      w: w,
      h: h,
      rotation: rotation
    };

    let m = this.getCenter(x, y, w, h, rotation);
    this.transform.copy(m);

    this.updateSelectionHandler();
    this.imageLayer.dirty = 1;
    this.refresh();
  }

  refresh() {

    if (this.dom.debugInfoBox) {

      let scale = this.transform.getScaleX();
      let scaledW = this.Iw * scale;
      let scaledH = this.Ih * scale;
      let selectionW = this.viewport.w / scale;
      let selectionH = this.viewport.h / scale;

      this.dom.debugInfoBox.innerHTML = `
      <div><label>Original</label> ${this.Iw} &times; ${this.Ih}</div>
      <div><label>Scaled</label> ${parseInt(scaledW)} &times; ${parseInt(scaledH)} (&times; ${scale.toFixed(3)})</div>
      <div><label>Selection</label> ${parseInt(selectionW)} &times; ${parseInt(selectionH)}</div>
      `;
    }

    if (!this.t0) {
      this.t0 = Date.now();
    }

    if (!frameRequestId) {
      frameRequestId = SDOM.requestAnimationFrame(this.render.bind(this));
    }
    
  }

  shortAngleDist(a0, a1) {
    let max = Math.PI * 2;
    let da = (a1 - a0) % max;
    return 2*da % max - da;
  }

  render() {
    SDOM.requestAnimationFrame(this.render.bind(this));
    
    this.animator.animate();
    this.layers.forEach(function(layer) {
      if (layer.dirty) {
        layer.render();
      }
    }.bind(this));
  }

  setImage(image) {
    if (typeof(image) === 'string') {
      //image += '?t=' + Math.random();
    }

    this.animator.endAnimation('targeting');
    this.setLoading(true);
    this.imageObject.setImage(image);
  }

  targetRandomPoint() {
      let target = {
        x: Math.random() * this.Iw,
        y: Math.random() * this.Ih,
        scale: Math.random() * (1 - .01) + .01,
        rotation: Math.random() * Math.PI - Math.PI / 2
        //rotation: Math.random() * Math.PI * 2
        //rotation: Math.random() * Math.PI / 2
        //rotation: Math.PI
      }
      this.targetPoint(target.x, target.y, target.scale, target.rotation);
  }

  targetPoint(x, y, scale, rotation) {
    // get current TSR for the viewport center

    let t = this.transform;

    let m0 = t.getMatrix();

    let i = t.inverse();
    let Cw = this.Cw;
    let Ch = this.Ch;
    
    let translation0 = i.transformPoint(Cw / 2, Ch / 2);
    //let rotation0 = t.getPositiveRotation();
    let rotation0 = t.getRotation();
    let scale0 = t.getScaleX();

    let target = {
      x: x,
      y: y,
      scale: scale,
      rotation: rotation
    }

    let dtx = (target.x - translation0[0]);
    let dty = (target.y - translation0[1]);
    let dr = cropper.shortAngleDist(target.rotation, rotation0);
    let ds = target.scale / scale0;

    this.animator.endAnimation('targeting');
    
    this.animator.addAnimation({
      id: 'targeting',
      data: {
        t: t,
        target: target,
        Cw: this.Cw,
        Ch: this.Ch,
        cropper: this
      },
      duration: 400,
      action: function(animation) {
        let k = this.t / this.duration;
        k = Easing.easeInOutQuad(k);

        t.setMatrix(m0);
        t.translate(-dtx * k, -dty * k);
        
        let aboutX = target.x;
        let aboutY = target.y;

        t.translate(aboutX, aboutY);
        t.scale((1 - k) + ds * k);
        t.rotate(dr * k);
        t.translate(-aboutX, -aboutY);

        cropper.imageLayer.dirty = true;
        cropper.refresh();
      }
    })
  }

}

HumbleCropper.CanvasImagePyramid = CanvasImagePyramid;
