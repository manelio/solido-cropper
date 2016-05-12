import uDOM from '../uDOM';
import TransformationMatrix2D from '../TransformationMatrix2D';

import Layer from './Layer';

export default class Canvas extends Layer {

  constructor() {
    super();
    
    let el = uDOM.createElement('canvas');    
    this.context = el.getContext('2d');
    el.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0;';

    this.el = el;
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    this.el.width = w;
    this.el.height = h;
  }

  render() {
    let m = this.transformationMatrix.getMatrix();
    let context = this.context;

    context.save();
    context.clearRect(0, 0, this.width, this.height);
    context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    
    
    this.items.forEach(function(item, i) {
      context.save();
      this.renderItem(item);
      context.restore();
    }.bind(this));
    
    //this.drawSmartImage(context, this.smartImage, this.transform);

    //context.drawImage(this.dom.image, 0, 0, Math.floor(this.Iw), Math.floor(this.Ih));
    //context.drawImage(this.dom.image, 500, 500, 300, 300, 0, 0, 300, 300);
    
    context.restore();

    this.dirty = false;
  }

  renderItem(item) {

    let context = this.context;

    switch(item.code) {
      case 'image':
        context.drawImage(item.el, 0, 0, item.originalWidth, item.originalHeight);
      break;

      case 'rectangle':
        context.strokeStyle = "rgba(0, 0, 255, .75)";
        context.lineWidth = 2;
        context.strokeRect(item.x, item.y, item.w, item.h);
      break;

      case 'hole':
        context.fillStyle = "rgba(255, 255, 255, .75)";
        //context.fillStyle = "rgba(0, 0, 0, .75)";
        context.beginPath();
        context.rect(0, 0, this.width, this.height);
        context.rect(item.x, item.y + item.h, item.w, -item.h);
        context.fill('evenodd');
        context.strokeStyle = "#000";
        context.lineWidth = 2;
        context.strokeRect(item.x, item.y, item.w, item.h);
      break;
    }
    
  }


  drawSmartImage(context, image, transformationMatrix) {
    let renderData = image.getRenderData(transformationMatrix);

    let inverseScale = 1 / renderData.scale;
    context.save();
    context.scale(inverseScale, inverseScale);

    let timer = setTimeout(function() {
      console.log('MMM...');
    }, 250);
    let t0 = Date.now();

    context.drawImage(
      renderData.source,
      renderData.x0,
      renderData.y0,
      renderData.w0,
      renderData.h0,
      renderData.x1,
      renderData.y1,
      renderData.w1,
      renderData.h1
    );

    /*
    context.drawImage(
      renderData.source,
      0,
      0,
      this.Iw,
      this.Ih
    );
    */
    
    
    context.strokeStyle = "#0f0";
    context.lineWidth = 25;

    context.strokeRect(
      renderData.x1,
      renderData.y1,
      renderData.w1,
      renderData.h1
    );
    
    clearTimeout(timer);

    let t1 = Date.now();
    let diff = (t1 - t0) / 1000;

    if (diff > .05) {
      console.log(`t: ${diff.toFixed(2)}`);
    }
    

    context.restore();
  }

}