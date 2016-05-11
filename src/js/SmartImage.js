import uDOM from './uDOM';

export default class SmartImage {

  canvases = {}
  offCanvas = {}

  constructor(image) {
    this.imageEl = image;
    this.initialize();
  }

  initialize() {
    let imageEl = this.imageEl;

    this.originalWidth = imageEl.naturalWidth;
    this.originalHeight = imageEl.naturalHeight;
    
    let Iw = this.originalWidth;
    let Ih = this.originalHeight;


    let max = Iw > Ih?Iw:Ih;
    let stepPixels = 100;
    let maxSteps = 5;
    let ik = max / stepPixels;
    let k = 1 / ik;
    let steps = Math.floor(ik);

    if (steps > maxSteps) {
      steps = maxSteps;
      stepPixels = max / maxSteps;
    }

    //console.log('stepPixels: ' + stepPixels);
    
    let stepMinScale = stepPixels / Iw;
    let stepMaxScale = stepPixels * steps / Iw;
    let scaleStepSize = (stepMaxScale - stepMinScale) / steps;

    this.scaleSteps = steps;
    this.scaleStepSize = scaleStepSize;

    //console.log(`${steps} steps of ${stepPixels} pixels`);
    //console.log(`min ${stepMinScale}, max ${stepMaxScale}`);
    //console.log(`scale step size ${scaleStepSize}`);
  }

  getCanvasForStep(step) {
    
    if (step > this.scaleSteps - 1) step = this.scaleSteps - 1;

    if (step != this.lastStep) {
      this.lastStep = step;
      //console.log('requesting scale step ' + step);
    }

    if (this.canvases[step]) {
      return this.canvases[step];
    }

    if (step == this.scaleSteps) {
      this.canvases[step] = {
        source: this.imageEl,
        w: this.originalWidth,
        h: this.originalHeight,
        scale: 1
      }
      console.log(`created canvas for step ${step} of original image`);
    } else {
      let k = (step + 1) * this.scaleStepSize;
      let scaledWidth = Math.floor(this.originalWidth * k);
      let scaledHeight = Math.floor(this.originalHeight * k);

      let canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      //canvas.style.cssText = `width: ${scaledWidth}px; height: ${scaledHeight}px; position: absolute; top: 0; left: 0;`;
      //uDOM.append(this.container, canvas);

      let context = canvas.getContext('2d');
      
      canvas.setAttribute('rel', `scale:${step}`);
      context.drawImage(this.imageEl, 0, 0, this.originalWidth, this.originalHeight, 0, 0, scaledWidth, scaledHeight);

      this.canvases[step] = {
        source: canvas,
        context: context,
        w: scaledWidth,
        h: scaledHeight,
        scale: k
      }

      //console.log(this.canvases[step]);
      console.log(`created canvas for step ${step} of size ${scaledWidth} x ${scaledHeight}`);
    }

    
    return this.canvases[step];
  }

  getRenderData(matrix) {

    // logic to serve a pre-resized image
    /*
    let scale = matrix.getScaleX();
    let scaleStep = Math.floor(scale / this.scaleStepSize);
    let canvasData = this.getCanvasForStep(scaleStep);
    */

    let m = matrix.inverse();

    // get the viewport vertices transformed to the image coordinates system
    let V00 = m.transformPoint(0, 0);
    let V10 = m.transformPoint(this.Cw, 0);
    let V11 = m.transformPoint(this.Cw, this.Ch);
    let V01 = m.transformPoint(0, this.Ch);

    /*
    console.log(V00);
    console.log(V10);
    console.log(V11);
    console.log(V01);
    */

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

    if (BB11x > this.originalWidth) {
      BBw -= (BB11x - this.originalWidth);
    }

    if (BB11y > this.originalHeight) {
      BBh -= (BB11y - this.originalHeight);
    }

    return {
      source: this.imageEl,
      
      x0: BB00x,
      y0: BB00y,
      w0: BBw,
      h0: BBh,

      x1: BB00x,
      y1: BB00y,
      w1: BBw,
      h1: BBh,

      scale: 1
    }
  }

}