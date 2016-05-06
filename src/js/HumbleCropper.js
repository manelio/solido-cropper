import uDOM from './uDOM';

export default class HumbleCropper {

  constructor(options) {
    this.options = {
      background: '#fff'
    }

    this.dom = {}
    this.anchor = {}
    this.baseValues = {}

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

    this.dom.canvas = uDOM.createElement('canvas');
    this.dom.canvas.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0';
    this.dom.viewport = uDOM.createElement('div');

    uDOM.append(this.dom.container, this.dom.canvas);
    uDOM.append(this.dom.container, this.dom.viewport);
  }

  prepareEvents() {
    this.onImageLoaded = this.onImageLoaded.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onDocumentReady = this.onDocumentReady.bind(this);
    this.onWindowResized = this.onWindowResized.bind(this);
    this.onPan = this.onPan.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    uDOM.addEventListener(this.dom.canvas, 'contextmenu', function(e) { uDOM.stopEvent(e); return false });
    uDOM.addEventListener(this.dom.canvas, 'click', function(e) { uDOM.stopEvent(e); return false });

    uDOM.addEventListener(this.dom.canvas, 'mousedown', this.onMouseDown);
    uDOM.addEventListener(this.dom.canvas, 'touchstart', this.onTouchStart);

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

  onPan(e) {

  }

  getAnchor(pageX, pageY) {
    var doc = document.documentElement;
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    var canvasOffset = this.dom.canvas.getBoundingClientRect();

    return {
      x: pageX - canvasOffset.left - left,
      y: pageY - canvasOffset.top - top
    }
  }

  saveBaseValues() {
    this.baseValues.porigin0  = {
      x: this.porigin.x,
      y: this.porigin.y
    };
    this.baseValues.rot = this.rot;
    this.baseValues.scale = this.scale;
  }

  onMouseDown(e) {
    uDOM.stopEvent(e);
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

    this.anchor = this.getAnchor(e.pageX, e.pageY);
    this.baseValues.p0 = {x: e.pageX, y: e.pageY};
    this.saveBaseValues();
    
    if (!e.which || e.which == 1) {
        this.tool = this.doPan;
    } else if (e.which == 2) {
        this.tool = this.doRotate;
    } else {
        this.tool = this.doZoom;
    }

    uDOM.addEventListener(document, 'mousemove', this.onMouseMove);
    uDOM.addEventListener(document, 'mouseup', this.onMouseUp);
  }

  onMouseMove(e) {
    if (!this.baseValues.p0) return;

    var delta = {
        dx: uDOM.getPageX(e) - this.baseValues.p0.x,
        dy: uDOM.getPageY(e) - this.baseValues.p0.y
    }
    
    this.tool(delta);
    
    this.refresh();
  }

  doPan(delta) {
    this.porigin.x = this.baseValues.porigin0.x + delta.dx;
    this.porigin.y = this.baseValues.porigin0.y + delta.dy;
  }

  doRotate(delta) {
    let po0 = this.baseValues.porigin0;

    let ox =  this.anchor.x - po0.x;
    let oy =  this.anchor.y - po0.y;
    let ang = delta.dy / 100;

    var sin = Math.sin(ang);
    var cos = Math.cos(ang);
    
    this.porigin.x = po0.x - (ox * cos - oy * sin) + ox;
    this.porigin.y = po0.y - (ox * sin + oy * cos) + oy;

    this.rot = this.baseValues.rot + ang;
  }

  doZoom(delta) {
    let po0 = this.baseValues.porigin0;
    let factor = delta.dy / 600.0;
    this.scale = this.baseValues.scale * (1 - factor);

    this.porigin.x = po0.x + (this.anchor.x - po0.x) * factor;
    this.porigin.y = po0.y + (this.anchor.y - po0.y) * factor;
  }

  onMouseUp(e) {    
    uDOM.removeEventListener(document, 'mousemove', this.onMouseMove);
    uDOM.removeEventListener(document, 'mouseup', this.onMouseUp);
  }

  initialize() {
    let kw = this.Iw / this.Cw;
    let kh = this.Ih / this.Ch;
    let kmax = kw > kh?kw:kh;

    let k = kmax;
    var scale = 1/k;

    this.ISw = this.Iw * scale;
    this.ISh = this.Ih * scale;
    
    this.porigin = {x: this.Cw / 2 - this.ISw / 2, y: this.Ch / 2 - this.ISh / 2};
    this.rot = 0;
    this.scale = scale;

    this.refresh();
  }

  refresh() {
      this.dirty = true;
      uDOM.requestAnimationFrame(this.render.bind(this));
  }

  render() {
    var ctx = this.dom.canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, this.Cw, this.Ch);
    
    ctx.save();

    ctx.translate(this.porigin.x, this.porigin.y);

    ctx.rotate(this.rot);
    ctx.scale(this.scale, this.scale);

    ctx.drawImage(this.dom.image, 0, 0, this.Iw, this.Ih);

    ctx.restore();

    ctx.translate(10, 10);
    ctx.fillStyle = '#000';
    ctx.rect(20,20,150,100);
    ctx.stroke();


    /*
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.rect(0, 0, Iw, Ih);
    ctx.rect(Vx + Vw, Vy, -Vw, Vh);
    ctx.closePath();
    ctx.fill("evenodd");
    */
    ctx.restore();
  }

  onTouchStart(e) {
    uDOM.stopEvent(e);

    this.saveBaseValues();
    if (this.npointers === 0) {
      uDOM.addEventListener(this.dom.canvas, 'touchmove', this.onTouchMove);
      uDOM.addEventListener(this.dom.canvas, 'touchend', this.onTouchEnd);
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
    this.saveBaseValues();

    for(let i = 0; i < e.changedTouches.length; i++) {
      this.handlePointerEnd(e.changedTouches[i], e);
    }

    var n = Object.keys(this.pointers).length;
    if (n === 0) {
      uDOM.removeEventListener(this.dom.canvas, 'touchmove', this.onTouchMove);
      uDOM.removeEventListener(this.dom.canvas, 'touchend', this.onTouchEnd);
    }
  }

  resetPointers(e) {
    for(let i = 0; i < e.targetTouches.length; i++) {
      let touch = e.targetTouches[i];

      let anchor = this.getAnchor(touch.pageX, touch.pageY);
      let id = touch.identifier;

      this.pointers[id] = {
        p0: {
          x: touch.pageX,
          y: touch.pageY
        },
        anchor: anchor
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
        x: p2.p0.x - p1.p0.x,
        y: p2.p0.y - p1.p0.y
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
      x: touch.pageX - this.pointers[id].p0.x,
      y: touch.pageY - this.pointers[id].p0.y
    }

    this.porigin.x = this.baseValues.porigin0.x + delta.x;
    this.porigin.y = this.baseValues.porigin0.y + delta.y;


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

    let po0 = this.baseValues.porigin0;
    let p1 = this.pointers[this.p1id];
    let p2 = this.pointers[this.p2id];

    let ox =  ( p1.anchor.x + p2.anchor.x ) / 2 - po0.x;
    let oy =  ( p1.anchor.y + p2.anchor.y ) / 2 - po0.y;

    let delta = {
      x: ( touch1.pageX + touch2.pageX ) / 2 - (p1.p0.x + p2.p0.x) / 2,
      y: ( touch1.pageY + touch2.pageY ) / 2 - (p1.p0.y + p2.p0.y) / 2
    }

    let vector = {
      x: touch2.pageX - touch1.pageX,
      y: touch2.pageY - touch1.pageY
    }

    let l = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    let deltal = l - this.l0;
    var ang = Math.atan2(vector.y, vector.x) - Math.atan2(this.vector0.y, this.vector0.x);

    // calculate new origin
    this.porigin.x = this.baseValues.porigin0.x + delta.x;
    this.porigin.y = this.baseValues.porigin0.y + delta.y;

    // calculate new rotation
    this.rot = this.baseValues.rot + ang;

    // calculate new scale
    let factor = deltal / this.l0;
    this.scale = this.baseValues.scale * (1 + factor);

    // compensate origin because object anchoring
    var sin = Math.sin(ang);
    var cos = Math.cos(ang);
    this.porigin.x -= (((ox * cos - oy * sin)) * (1 + factor) - ox) ;
    this.porigin.y -= (((ox * sin + oy * cos)) * (1 + factor) - oy) ;
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
    for(let i = 0; i < e.targetTouches.length; i++) {
      let touch = e.targetTouches[i];

      let anchor = this.getAnchor(touch.pageX, touch.pageY);
      let id = touch.identifier;

      this.pointers[id] = {
        p0: {
          x: touch.pageX,
          y: touch.pageY
        },
        anchor: anchor
      }
      
    }

    let id = pointer.identifier;
    delete this.pointers[id];
    this.npointers--;
  }



}
