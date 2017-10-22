import SDOM from 'solido-dom';
import SString from 'solido-string';
import Loading from './Loading';

import Animator from './Animator';
import Pointer from './Pointer';

import touche from 'solido-touche';

import Button from './Button';

import TransformationMatrix2D from './TransformationMatrix2D';

import Layers from './layers/Layers';

import ImageRenderable from './renderable/Image';
import XImageRenderable from './renderable/XImage';
import RectangleRenderable from './renderable/Rectangle';
import CircleRenderable from './renderable/Circle';
import ControlBoxRenderable from './renderable/ControlBox';
import HoleRenderable from './renderable/Hole';

import Easing from 'easing';

export default class SolidoCropper {

  constructor(options) {

    this.options = {
      renderer: 'canvas',
      background: '#fff',
      perPixelScaleFactor: 600.0,
      perPixelRotationFactor: 100.0
    }

    this.parseOptions(options);

    this.frameRequestId = 0;

    //this.renderer = new CanvasRenderer();
    //this.layers = new Layers();
    this.layers = [];
    this.animator = new Animator();
    this.transform = new TransformationMatrix2D();
    
    this.keyMap = {};
    this.valuesBefore = {};

    this.dom = {}
    
    this.prepareDom();
    this.prepareEvents();

    //this.disable();

  }

  parseOptions(options) {
    if (SDOM.isElement(options)) {
      let key = options.tagName === 'IMG'?'image':'parent';
      let el = options;
      options = {};
      options[key] = el;
    } else if (typeof(options) === 'string') {

    }

    Object.assign(this.options, options);
  }

  prepareDom() {
    let options = this.options;

    // Create the container
    let container = SDOM.createElement('div');
    SDOM.addClassName(container, '__solidocropper-container');
    this.dom.container = container;


    this.loading = new Loading(this.dom.container, this.animator);

    // Create the viewport (overflow: hidden)
    let viewport = SDOM.createElement('div');
    SDOM.addClassName(viewport, '__solidocropper-viewport');
    this.dom.viewport = viewport;

    SDOM.append(container, viewport);

    this.layers = [];

    // debug info box

    let debugInfoBox = SDOM.createElement('div');
    SDOM.addClassName(debugInfoBox, '__solidocropper-debug-info-box');
    SDOM.append(this.dom.container, debugInfoBox);

    this.dom.debugInfoBox = debugInfoBox;


    SDOM.after(options.image, this.dom.container);
    options.image.style.visibility = 'hidden';

    let rendererClassName = SString.snakeToCamel(options.renderer, true);
    let RendererClass = require(`./renderers/${rendererClassName}`);

    let renderer = new RendererClass();
    SDOM.append(this.dom.viewport, renderer.el);
    this.layers.push(renderer);

    this.imageLayer = renderer;

    renderer.transformationMatrix = this.transform;

    let imageRenderable = new XImageRenderable();
    this.imageRenderable = imageRenderable;

    this.loading.show();
    imageRenderable.eventEmitter.addListener('ready', function(renderable) {

      //console.log('READY');
      //console.log(renderer);

      this.loading.hide();

      this.onImageLoaded();
      this.imageLayer.dirty = true;

      //console.log(this.imageLayer);

      this.refresh();

      renderer.addItem(imageRenderable);

    }.bind(this));
    imageRenderable.setImage(this.options.image, true);


    let overlay = new RendererClass();

    //overlay.transformationMatrix = this.transform;

    SDOM.append(this.dom.container, overlay.el);
    this.layers.push(overlay);

    let controlBox = new ControlBoxRenderable({x: 100, y: 100, w: 300, h: 300});
    controlBox.capture = true;

    overlay.addItem(controlBox);

    this.overlay = overlay;
    this.controlBox = controlBox;


    let hole = new HoleRenderable({x: 0, y: 0, w: 0, h: 0});
    this.hole = hole;
    overlay.addItem(hole);


    /*
    let circle = new CircleRenderable({x: 150, y: 150, radius: 25});
    overlay.addItem(circle);

    circle.capture = true;
    */

    /*
    console.log(this.layers);
    for (let layer in this.layers) {
      console.log(layer);
    }
    */


    /*

    let layer = new renderer();
    layer.id = 'image';
    this.imageLayer = layer;

    layer.transformationMatrix = this.transform;
    
    let imageRenderable = new XImageRenderable();
    
    imageRenderable.eventEmitter.addListener('ready', function(renderable) {
      this.loading.hide();
      this.onImageLoaded();
      this.imageLayer.dirty = true;
      this.refresh();
    }.bind(this));

    this.imageRenderable = imageRenderable;

    layer.addItem(imageRenderable);

    //let smartImage = new SmartImage(this.dom.image);

    this.addLayer(layer);

    layer = new renderer();
    layer.id = 'overlay';
    let renderable;

    renderable = new HoleRenderable({
      x: 0, y: 0, w: 0, h: 0
    });
    renderable.id = 'viewport';
    this.viewport = renderable;
    layer.addItem(renderable);

    renderable = new RectangleRenderable({
      x: 0, y: 0, w: 50, h: 50
    });
    this.viewportHandler = renderable;

    renderable.capture = true;
    renderable.onChangePosition = this.doMoveHandler.bind(this);
    layer.addItem(renderable);

    this.addLayer(layer);

    imageRenderable.setImage(this.dom.image);

    this.refresh();
    */

    let sensorLayer = SDOM.createElement('div');
    sensorLayer.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 9';
    SDOM.addClassName(sensorLayer, '__solidocropper-sensor');
    SDOM.append(this.dom.container, sensorLayer);

    this.dom.sensor = sensorLayer;



    // BUTTONS (Should be placed in another file)

    let toolbox = SDOM.createElement('div');;
    SDOM.addClassName(toolbox, '__solidocropper-toolbox');
    SDOM.append(this.dom.container, toolbox);


    let _this = this;
    let button;

    button = new Button({
      innerHTML: '<span class="scicon-gear"></span>',
      onPointerMove: function(info) {
        toolbox.style.left = (toolbox.offsetLeft + info.incrementX) + 'px';
        toolbox.style.top = (toolbox.offsetTop + info.incrementY) + 'px';
        toolbox.style.bottom = 'auto';
        toolbox.style.right = 'auto';
      },
      className: '__solidocropper-button-settings'
    });
    SDOM.append(toolbox, button.el);


    button = new Button({
      innerHTML: '<span class="scicon-rotate-left"></span>',
      onBefore: function() {
        this.valuesBefore.matrix = this.transform.getMatrix();
      }.bind(this),
      onPointerMove: function(info) {
        _this.doRotate({x: info.deltaX, y: info.deltaY}, {x: _this.Cw / 2, y: _this.Ch / 2});
        _this.refresh();
      }
    });
    SDOM.append(toolbox, button.el);

    button = new Button({
      innerHTML: '<span class="scicon-expand"></span>',
      onBefore: function() {
        this.valuesBefore.matrix = this.transform.getMatrix();
      }.bind(this),
      onPointerMove: function(info) {
        _this.doZoom({x: info.deltaX, y: info.deltaY * 10}, {x: _this.Cw / 2, y: _this.Ch / 2});
        _this.refresh();
      }
    });
    SDOM.append(toolbox, button.el);

    /*
    button = new Button({
      innerHTML: '<span class="scicon-arrows"></span>',
      onBefore: function() {
        this.valuesBefore.matrix = this.transform.getMatrix();
      }.bind(this),
      onPointerMove: function(info) {
        _this.doPan({x: info.deltaX, y: info.deltaY});
        _this.refresh();
      }
    });
    SDOM.append(toolbox, button.el);
    */

  }

  onKeyDown(e) {
    let keyCode = e.keyCode;

    if (keyCode === 65) {

      this.status = {};

      this.status.translation0 = this.transform.inverse().transformPoint(this.Cw / 2, this.Ch / 2);
      this.status.scale0 = this.transform.getScaleX();
      this.status.rotation0 = this.transform.getRotation();

      console.log(`${this.status.translation0[0]}, ${this.status.translation0[1]}, ${this.status.scale0}, ${this.status.rotation0}`);
      
    } else if (keyCode === 50) {
      let s = this.status;

      this.targetPoint(s.translation0[0], s.translation0[1], s.scale0, s.rotation0);
    } else if (keyCode === 49) {
      this.targetRandomPoint();
    }

    this.keyMap[keyCode] = true;
  }

  onKeyUp(e) {
    let keyCode = e.keyCode;
    this.keyMap[keyCode] = false;
  }

  onWindowFocus() {
    this.keyMap = {};
  }

  onWindowBlur() {
    this.keyMap = {};
  }

  prepareEvents() {
    this.onImageLoaded = this.onImageLoaded.bind(this);

    this.onDocumentReady = this.onDocumentReady.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWindowFocus = this.onWindowFocus.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);

    SDOM.addEventListener(document, 'keydown', this.onKeyDown);
    SDOM.addEventListener(document, 'keyup', this.onKeyUp);
    SDOM.addEventListener(window, 'focus', this.onWindowFocus);
    SDOM.addEventListener(window, 'blur', this.onWindowBlur);

    SDOM.addEventListener(this.dom.container, 'contextmenu', function(e) {
      SDOM.stopEvent(e);
      return false
    });
    SDOM.addEventListener(this.dom.container, 'click', function(e) {
      SDOM.stopEvent(e);
      return false
    });

    SDOM.addEventListener(document, 'DOMContentLoaded', this.onDocumentReady);
    SDOM.addEventListener(window, 'resize', this.onWindowResized);

    
    let pointer = new Pointer(this.dom.sensor, {
      onBefore: function() {
        this.valuesBefore.matrix = this.transform.getMatrix();
      }.bind(this),

      onWheel: this.onWheel.bind(this),
      //onPointerStart: this.onPointerStart.bind(this),
      onPointerJustBeforeMove: this.onPointerJustBeforeMove.bind(this),
      onPointerMove: this.onPointerMove.bind(this),
      onPointerClick: function(info) {

        let item = this.captureItem(info.x, info.y);
        if (item.control === true) {
          this.toggleHandles();
        }

      }.bind(this)
    });

    this.pointer = pointer;

  }

  captureItem(x, y) {
    for (var i in this.layers) {
      let layer = this.layers[i];

      let inverseTransformationMatrix = layer.transformationMatrix.inverse();
      let transformedPoint = inverseTransformationMatrix.transformPoint(x, y);
      let tpx = transformedPoint[0];
      let tpy = transformedPoint[1];

      for (let j = layer.items.length - 1; j >= 0; j--) {
        let item = layer.items[j];

        if (!item.capture) {
          continue;
        }

        let test = item.testPoint(tpx, tpy);

        if (test) {
          item.control = test;
          return item;
        }
      }
    }
    
    return false;
  }

  onPointerJustBeforeMove(info) {

    //console.log(info);

    let e = info.event;

    let item = this.captureItem(info.x, info.y);
    if (item.code === 'controlbox' && item.control === true) {
      item = false;
    }

    this.activeItem = false;

    if (item) {
      
      this.origx = item.x;
      this.origy = item.y;
      this.origw = item.w;
      this.origh = item.h;

      this.activeItem = item;
      this.tool = this.doMoveItem;

    } else {
      if ((!e.which || e.which == 1) && this.keyMap[16] || e.which == 2) {
        this.tool = this.doRotate;
      } else if (e.which == 1 && this.keyMap[17]) {
        this.tool = this.doZoom;
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
      this.overlay.dirty = true;

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
    
    //this.loading.hide();

    let image = this.imageRenderable;
    let 
      Iw = image.originalWidth,
      Ih = image.originalHeight
    ;

    this.Iw = Iw;
    this.Ih = Ih;

    //console.log(`Original image size: ${Iw} x ${Ih}`);
    
    this.imageLayer.dirty = true;
    this.overlay.dirty = true;

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
    //this.overlay.dirty = true;

  }

  doZoom(delta, relativePoint) {
    
    let psf = this.options.perPixelScaleFactor;
    let factor = delta.y > 0 ? 1/(1 + delta.y / psf) : (1 - delta.y / psf);

    /*
    let scale0 = this.transform.getScaleX();
    let scale = scale0 * factor;

    if (scale > 1) {
      factor = 1/scale;
    }
    */

    this.transform
      .setId()
      .translate(relativePoint.x, relativePoint.y)
      .scale(factor)
      .translate(-relativePoint.x, -relativePoint.y)
      .multiply(this.valuesBefore.matrix)
    ;

    this.imageLayer.dirty = true;
    //this.overlay.dirty = true;

  }

  doRotate(delta, relativePoint) {
    let ang = delta.y / this.options.perPixelRotationFactor;

    this.transform
      .setId()
      .translate(relativePoint.x, relativePoint.y)
      .rotate(ang)
      .translate(-relativePoint.x, -relativePoint.y)
      .multiply(this.valuesBefore.matrix)
    ;

    this.imageLayer.dirty = true;
    //this.overlay.dirty = true;

  }

  doMoveItem(delta) {

    let i = this.overlay.transformationMatrix.inverse();
    let tp = i.transformPoint(delta.x, delta.y);

    let tp0 = i.transformPoint(0, 0);

    let dx = tp[0] - tp0[0];
    let dy = tp[1] - tp0[1];

    let item = this.activeItem;
    let control = item.control;

    if( Object.prototype.toString.call( control ) === '[object Array]' ) {
      control = control.join('');
    }


    if (item.code === 'circle') {
      item.setPosition(this.origx + dx, this.origy + dy);
      this.overlay.dirty = true;
      return;
    }

    let x1 = item.x;
    let y1 = item.y;
    let w1 = item.w;
    let h1 = item.h;

    switch(control) {
      case '00':
        x1 = this.origx + dx;
        y1 = this.origy + dy;
        w1 = this.origw - dx;
        h1 = this.origh - dy;
      break;
      case '10':
        y1 = this.origy + dy;
        h1 = this.origh - dy;
      break;
      case '20':
        y1 = this.origy + dy;
        w1 = this.origw + dx;
        h1 = this.origh - dy;
      break;
      case '01':
        x1 = this.origx + dx;
        w1 = this.origw - dx;
      break;
      case '21':
        w1 = this.origw + dx;
      break;
      case '02':
        x1 = this.origx + dx;
        w1 = this.origw - dx;
        h1 = this.origh + dy;
      break;
      case '12':
        h1 = this.origh + dy;
      break;
      case '22':
        w1 = this.origw + dx;
        h1 = this.origh + dy;
      break;

      default:
        //x1 = this.origx + dx;
        //y1 = this.origy + dy;
      break;
    }

    let center = true;
    let sticky = true;

    if (center) {
      let x2, y2, w2, h2;

      switch(control) {
        case '00':
        case '10':
        case '01':
          w1 = (this.Cw / 2 - x1) * 2;
          h1 = (this.Ch / 2 - y1) * 2;
        break;

        case '22':
        case '21':
        case '12':
          x2 = this.origx +  w1;
          y2 = this.origy +  h1;
          
          w2 = (x2 - this.Cw / 2.0) * 2;
          h2 = (y2 - this.Ch / 2.0) * 2;

          w1 = w2;
          h1 = h2;

          x1 = x2 - w2;
          y1 = y2 - h2;
        break;

        case '02':
          w1 = (this.Cw / 2 - x1) * 2;
          
          y2 = this.origy +  h1;
          h2 = (y2 - this.Ch / 2.0) * 2;
          h1 = h2;
          y1 = y2 - h2;
        break;
        
        case '20':
          h1 = (this.Ch / 2 - y1) * 2;

          x2 = this.origx +  w1;
          w2 = (x2 - this.Cw / 2.0) * 2;
          w1 = w2;
          x1 = x2 - w2;
        break;
      }
    }

    if (x1 < 0) {
      x1 = 0;
    }

    if (y1 < 0) {
      y1 = 0;
    }

    if (x1 + w1 > this.Cw) {
      w1 = this.Cw - x1;
    }

    if (y1 + h1 > this.Ch) {
      h1 = this.Ch - y1;
    }


    if (center && sticky) {
      switch(control) {
        case '10':
        case '12':
          this.doPan({x: 0, y: -delta.y});
        break;

        case '01':
        case '21':
          this.doPan({x: -delta.x, y: 0});
        break;

        default:
          this.doPan({x: -delta.x, y: -delta.y});
      }
      
    }


    //x1 = Math.ceil((this.Cw - w1) / 2);
    //y1 = Math.ceil((this.Ch - h1) / 2);

    //this.activeItem.setPosition(this.origx + delta.x, this.origy + delta.y);
    //this.activeItem.setPosition(this.origx + dx, this.origy + dy);
    item.setPosition(x1, y1);
    item.setSize(w1, h1);

    this.hole.setPosition(x1, y1);
    this.hole.setSize(w1, h1);


    this.overlay.dirty = true;
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
    //console.log('IW: ' + this.Iw);
    this.valuesBefore.matrix = new TransformationMatrix2D();

    this.center(0, 0, this.Iw, this.Ih, 0);

    let t = this.transform;
    let tl = t.transformPoint(0, 0);
    let br = t.transformPoint(this.Iw, this.Ih);

    this.controlBox.setPosition(tl[0], tl[1]);
    this.controlBox.setSize(br[0] - tl[0], br[1] - tl[1]);

    this.hole.setPosition(tl[0], tl[1]);
    this.hole.setSize(br[0] - tl[0], br[1] - tl[1]);

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

    //let k = kmax / .90; // percent margin
    let k = kmax / 1; // percent margin

    let Cwk = this.Cw*k;
    let Chk = this.Ch*k;

    let hdiff = Chk - h;
    let wdiff = Cwk - w;

    let m = new TransformationMatrix2D();

    //console.log(`${Cwk}, ${Chk}, ${hdiff}, ${wdiff}`);
    //console.log(`${this.Cw}, ${this.Ch}`);

    m.translate(x, y);
    m.translate(w/2, h/2);
    m.rotate(rotation);
    m.translate(-w/2, -h/2);
    m.translate(- wdiff / 2, - hdiff / 2);
    m.scale(k);
    m.invert();

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

    //console.log(`${x}, ${y}, ${w}, ${h}, ${rotation}`);

    let m = this.getCenter(x, y, w, h, rotation);

    this.transform.copy(m);

    //this.updateSelectionHandler();
    this.imageLayer.dirty = true;
    this.overlay.dirty = true;
    this.refresh();
  }

  refresh() {

    if (this.dom.debugInfoBox) {

      let scale = this.transform.getScaleX();
      let scaledW = this.Iw * scale;
      let scaledH = this.Ih * scale;

      //console.log(this.transform.getMatrix());
      
      let selectionW = this.controlBox.w / scale;
      let selectionH = this.controlBox.h / scale;
      //let selectionW = 0;
      //let selectionH = 0;

      //let rotation = this.transform.getPositiveRotation() * 180 / Math.PI;
      let rotation = this.transform.getRotation() * 180 / Math.PI;

      this.dom.debugInfoBox.innerHTML = `
      <div><label>Original</label> ${this.Iw} &times; ${this.Ih}</div>
      <div><label>Scaled</label> ${parseInt(scaledW)} &times; ${parseInt(scaledH)} (&times; ${scale.toFixed(3)})</div>
      <div><label>Selection</label> ${parseInt(selectionW)} &times; ${parseInt(selectionH)}</div>
      <div><label>Rotation</label> ${rotation.toFixed(2)}&deg;</div>
      `;
    }

    if (!this.t0) {
      this.t0 = Date.now();
    }

    if (!this.frameRequestId) {
      this.frameRequestId = SDOM.requestAnimationFrame(this.render.bind(this));
    }
    
  }

  shortAngleDist(a0, a1) {
    let max = Math.PI * 2;
    let da = (a1 - a0) % max;
    return 2*da % max - da;
  }

  render() {
    SDOM.requestAnimationFrame(this.render.bind(this));

    //console.log(frameId);

    
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
    this.loading.show();
    this.imageRenderable.setImage(image);
  }

  targetRandomPoint() {
      let target = {
        x: Math.random() * this.Iw,
        y: Math.random() * this.Ih,
        scale: Math.random() * (1 - .01) + .01,
        //rotation: Math.random() * Math.PI - Math.PI / 2
        rotation: Math.random() * Math.PI * 2
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
    let dr = this.shortAngleDist(target.rotation, rotation0);
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

        this.data.cropper.imageLayer.dirty = true;
        this.data.cropper.refresh();
      }
    })
  }

  toggleHandles() {
    this.controlBox.drawHandles = !this.controlBox.drawHandles;
    this.overlay.dirty = true;
  }

  disable() {
    SDOM.removeEventListener(document, 'keydown', this.onKeyDown);
    SDOM.removeEventListener(document, 'keyup', this.onKeyUp);

    SDOM.addClassName(this.dom.container, '__solidocropper-disabled');
    SDOM.removeClassName(this.dom.container, '__solidocropper-enabled');
    this.pointer.detachEvents();
  }

  enable() {

    SDOM.addEventListener(document, 'keydown', this.onKeyDown);
    SDOM.addEventListener(document, 'keyup', this.onKeyUp);

    SDOM.addClassName(this.dom.container, '__solidocropper-enabled');
    SDOM.removeClassName(this.dom.container, '__solidocropper-disabled');
    this.pointer.attachEvents();
  }

}


//SolidoCropper.SolidoPointer = SolidoPointer;