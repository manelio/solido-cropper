import uDOM from './uDOM';
import TM2D from './TransformationMatrix2D';
import Layer from './Layer';
import Element from './Element';


export default class HumbleCropper {

  constructor(options) {

    this.items = [/*
      {
        x: 10,
        y: 10,
        w: 50,
        h: 50
      },
      {
        x: 100,
        y: 100,
        w: 70,
        h: 90
      }
    */]

    this.options = {
      background: '#fff'
    }

    this.dom = {}
    this.containerPoint = {}
    this.valuesBefore = {}

    this.pointers = {};
    this.npointers = 0;

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
      container.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0';
      
      uDOM.addClassName(container, '__humblecropper-container');
      uDOM.after(this.dom.image, container);
      options.container = container;
    }

    this.dom.container = options.container;

    this.dom.canvas2 = uDOM.createElement('canvas');
    this.dom.ctx2 = this.dom.canvas2.getContext('2d');

    this.dom.canvas = uDOM.createElement('canvas');
    this.dom.canvas.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0';
    this.dom.viewport = uDOM.createElement('div');

    uDOM.append(this.dom.container, this.dom.canvas);
    uDOM.append(this.dom.container, this.dom.viewport);
  }

  prepareEvents() {
    this.onImageLoaded = this.onImageLoaded.bind(this);

    // Mouse
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);    
    this.onMouseWheel = this.onMouseWheel.bind(this);    

    // Touch devices
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.onDocumentReady = this.onDocumentReady.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);
    
    uDOM.addEventListener(this.dom.container, 'contextmenu', function(e) { uDOM.stopEvent(e); return false });
    uDOM.addEventListener(this.dom.container, 'click', function(e) { uDOM.stopEvent(e); return false });

    uDOM.addEventListener(this.dom.container, 'mousedown', this.onMouseDown);
    uDOM.addEventListener(this.dom.container, 'mousewheel', this.onMouseWheel);
    uDOM.addEventListener(this.dom.container, 'touchstart', this.onTouchStart);

    uDOM.addEventListener(document, 'DOMContentLoaded', this.onDocumentReady);
    uDOM.addEventListener(window, 'resize', this.onWindowResized);
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


    var k = 1000 / Iw;
    this.imageK = k;

    this.dom.canvas2.width = Iw*k;
    this.dom.canvas2.height = Ih*k;

    let ctx2 = this.dom.ctx2;
    ctx2.drawImage(image, 0, 0, Iw, Ih, 0, 0, Iw*k, Ih*k);

    this.prepareCanvas();
    this.initialize();
  }

  prepareCanvas() {
    let canvas = this.dom.canvas;
    let 
      Cw = canvas.offsetWidth,
      Ch = canvas.offsetHeight
    ;

    let
      ContainerW = this.dom.container.offsetWidth,
      ContainerH = this.dom.container.offsetHeight
    ;

    this.Cw = ContainerW;
    this.Ch = ContainerH;

    this.dom.canvas.width = this.Cw;
    this.dom.canvas.height = this.Ch;
  }

  getContainerClick(pageX, pageY) {
    var doc = document.documentElement;
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    var canvasOffset = this.dom.container.getBoundingClientRect();

    return {
      x: pageX - canvasOffset.left - left,
      y: pageY - canvasOffset.top - top
    }
  }

  saveValuesBefore() {
    this.valuesBefore.matrix = this.transform.getMatrix();
  }

  onMouseDown(e) {
    uDOM.stopEvent(e);
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

    this.containerPoint = this.getContainerClick(e.pageX, e.pageY);
    this.valuesBefore.pagePoint = {x: e.pageX, y: e.pageY};
    this.saveValuesBefore();

    let a = this.containerPoint;
    this.items.forEach(function(item) {
      if (a.x > item.x && a.x < item.x + item.w && a.y > item.y && a.y < item.y + item.h) {
        this.itemx0 = item.x;
        this.itemy0 = item.y;
        this.item = item;
      }
    }.bind(this));

    
    if (!this.item) {
      if (!e.which || e.which == 1) {
          this.tool = this.doPan;
      } else if (e.which == 2) {
          this.tool = this.doRotate;
      } else {
          this.tool = this.doZoom;
      }
    }

    uDOM.addEventListener(document, 'mousemove', this.onMouseMove);
    uDOM.addEventListener(document, 'mouseup', this.onMouseUp);
  }

  onMouseMove(e) {
    if (!this.valuesBefore.pagePoint) return;

    var delta = {
        x: uDOM.getPageX(e) - this.valuesBefore.pagePoint.x,
        y: uDOM.getPageY(e) - this.valuesBefore.pagePoint.y
    }
    
    if (!this.item) {
      this.tool(delta);
    } else {
      this.item.x = this.itemx0 + delta.x;
      this.item.y = this.itemy0 + delta.y;
    }
    
    this.refresh();
  }

  doPan(delta) {
    this.transform
      .setId()
      .translate(delta.x, delta.y)
      .multiply(this.valuesBefore.matrix)
    ;
  }

  doZoom(delta) {
    let factor = delta.y / 600.0;

    this.transform
      .setId()      
      .translate(this.containerPoint.x, this.containerPoint.y)
      .scale(1-factor)
      .translate(-this.containerPoint.x, -this.containerPoint.y)
      .multiply(this.valuesBefore.matrix)
    ;

  }

  doRotate(delta) {
    let ang = delta.y / 100;

    this.transform
      .setId()      
      .translate(this.containerPoint.x, this.containerPoint.y)
      .rotate(ang)
      .translate(-this.containerPoint.x, -this.containerPoint.y)
      .multiply(this.valuesBefore.matrix)
    ;

  }

  onMouseUp(e) {
    this.item = false;

    uDOM.removeEventListener(document, 'mousemove', this.onMouseMove);
    uDOM.removeEventListener(document, 'mouseup', this.onMouseUp);
  }


  onMouseWheel(e) {    
    var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
    this.containerPoint = this.getContainerClick(e.pageX, e.pageY);
    this.saveValuesBefore();

    this.doZoom({x: 0, y: -delta * 10});
    this.refresh();
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

    //var t = new TM2D();
    //t.translate(this.translation.x, this.translation.y);
    //t.rotate(this.rotation);
    //t.scale(this.scale, this.scale);

    //var m = t.getMatrix();
    //t.invert();
    //var P00 = t.transformPoint(0, 0);

    let m = this.transform.getMatrix();
    

    var ctx = this.dom.canvas.getContext('2d');

    this.ctx = ctx;

    ctx.save();
    ctx.clearRect(0, 0, this.Cw, this.Ch);
    
    ctx.save();

    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

    //ctx.translate(this.porigin.x, this.porigin.y);
    //ctx.rotate(this.rot);    
    //ctx.scale(this.scale, this.scale);

    ctx.save();
    
    //ctx.scale(1/this.imageK, 1/this.imageK);
    
    ctx.drawImage(this.dom.image, 0, 0, Math.floor(this.Iw), Math.floor(this.Ih));
    //ctx.drawImage(this.dom.canvas2, 0, 0, Math.floor(this.Iw * this.imageK), Math.floor(this.Ih * this.imageK));
    ctx.restore();
    
    if (this.rect) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
      ctx.stroke();
      ctx.closePath();
    }

    //ctx.rect(Vx + Vw, Vy, -Vw, Vh); 

    ctx.restore();

    // render viewport
    /*
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.rect(0, 0, this.Iw, this.Ih);
    //ctx.rect(Vx + Vw, Vy, -Vw, Vh);
    ctx.rect(300 + 100, 300, -100, 100);
    ctx.closePath();
    ctx.fill("evenodd");
    */

    
    ctx.restore();


    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 255, .4)';
    this.items.forEach(function(item) {      
      ctx.fillRect(item.x, item.y, item.w, item.h);
    });

    ctx.stroke();
    ctx.closePath();

    ctx.restore();
    

  }

  onTouchStart(e) {
    uDOM.stopEvent(e);

    this.saveValuesBefore();
    if (this.npointers === 0) {
      uDOM.addEventListener(this.dom.container, 'touchmove', this.onTouchMove);
      uDOM.addEventListener(this.dom.container, 'touchend', this.onTouchEnd);
    }

    for(let i = 0; i < e.changedTouches.length; i++) {
      this.handlePointerStart(e.changedTouches[i], e);
    }
  }

  onTouchMove(e) {
    uDOM.stopEvent(e);
    this.handlePointerMove(e);
  }

  onTouchEnd(e) {
    uDOM.stopEvent(e);
    this.saveValuesBefore();

    for(let i = 0; i < e.changedTouches.length; i++) {
      this.handlePointerEnd(e.changedTouches[i], e);
    }

    var n = Object.keys(this.pointers).length;
    if (n === 0) {
      uDOM.removeEventListener(this.dom.container, 'touchmove', this.onTouchMove);
      uDOM.removeEventListener(this.dom.container, 'touchend', this.onTouchEnd);
    }
  }

  resetPointers(e) {
    for(let i = 0; i < e.targetTouches.length; i++) {
      let touch = e.targetTouches[i];

      let containerPoint = this.getContainerClick(touch.pageX, touch.pageY);
      let id = touch.identifier;

      this.pointers[id] = {
        pagePoint: {
          x: touch.pageX,
          y: touch.pageY
        },
        containerPoint: containerPoint
      }
    }
  }

  handlePointerStart(pointer, e) {

    this.resetPointers(e);
    this.npointers++;

    if (this.npointers > 1) {
      let keys = Object.keys(this.pointers);
      let p1 = this.pointers[keys[0]];
      let p2 = this.pointers[keys[1]];

      this.p1id = keys[0];
      this.p2id = keys[1];

      let vector0 = {
        x: p2.pagePoint.x - p1.pagePoint.x,
        y: p2.pagePoint.y - p1.pagePoint.y
      }

      let l0 = Math.sqrt(vector0.x * vector0.x + vector0.y * vector0.y);
      this.vector0 = vector0;
      this.l0 = l0;
    }
  }

  handlePointerMoveOnePointer(e) {
    var touch;
    var id;
    
    let touches = e.touches;
    for(let i = 0; i < touches.length; i++) {
      touch = touches[i];
      id = touch.identifier;
    }

    let delta = {
      x: touch.pageX - this.pointers[id].pagePoint.x,
      y: touch.pageY - this.pointers[id].pagePoint.y
    }

    this.doPan(delta);
  }

  handlePointerMoveTwoPointers(e) {
    var touch, touch1, touch2;
    var id;

    let touches = e.touches;

    for(let i = 0; i < touches.length; i++) {
      touch = touches[i];
      id = touch.identifier;

      if (id == this.p1id) {
        touch1 = touch;
      } else if (id == this.p2id) {
        touch2 = touch;
      }
    }

    let p1 = this.pointers[this.p1id];
    let p2 = this.pointers[this.p2id];

    let containerMidpoint =  {
      x: ( p1.containerPoint.x + p2.containerPoint.x ) / 2,
      y: ( p1.containerPoint.y + p2.containerPoint.y ) / 2
    }

    let delta = {
      x: ( touch1.pageX + touch2.pageX ) / 2 - (p1.pagePoint.x + p2.pagePoint.x) / 2,
      y: ( touch1.pageY + touch2.pageY ) / 2 - (p1.pagePoint.y + p2.pagePoint.y) / 2
    }

    let vector = {
      x: touch2.pageX - touch1.pageX,
      y: touch2.pageY - touch1.pageY
    }

    let l = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    let deltal = l - this.l0;
    var ang = Math.atan2(vector.y, vector.x) - Math.atan2(this.vector0.y, this.vector0.x);

    let factor = deltal / this.l0;

    console.log(containerMidpoint);

    this.transform
      .setId()
      .translate(containerMidpoint.x, containerMidpoint.y)
      .translate(delta.x, delta.y)
      .scale(1 + factor)
      .rotate(ang)
      .translate(-containerMidpoint.x, -containerMidpoint.y)
      .multiply(this.valuesBefore.matrix)
    ;
  }

  handlePointerMove(e) {
    if (this.npointers > 1) {
      this.handlePointerMoveTwoPointers(e);
    } else {
      this.handlePointerMoveOnePointer(e);
    }
    this.refresh();
  }

  handlePointerEnd(pointer, e) {
    this.resetPointers(e);

    let id = pointer.identifier;
    delete this.pointers[id];
    this.npointers--;
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


    console.log(this.rect);

    this.translation = {x: this.Cw / 2 - ISw / 2 - x, y: this.Ch / 2 - ISh / 2 - y};
    this.rotation = 0;
    this.scale = scale;



    console.log(this.translation);
    console.log(this.scale);

    this.refresh();


  }



}
