import SDOM from 'solido-dom';
import TransformationMatrix2D from '../TransformationMatrix2D';

import Layer from './Layer';

export default class Canvas extends Layer {

  constructor() {
    super();
    
    let el = SDOM.createElement('canvas');
    this.context = el.getContext('2d');
    el.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%';

    let image = new Image();
    //image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYPADoQNa2ayQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAFUlEQVQI1wXBAQEAAACAEP9PF1CpMCnkBftjnTYAAAAAAElFTkSuQmCC';
    //image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYPAQMdRFoB+QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAGUlEQVQI1wXBAQEAAAiDMLD5k+MmsIqrUHlAFAaCRvCEFwAAAABJRU5ErkJggg==';
    image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AYPAQQkVB4fNgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAGklEQVQI12NkYGCw////PwPT////GRgZGRkAPHgGQBjgxaAAAAAASUVORK5CYII=';
    this.pattern = this.context.createPattern(image, 'repeat');
    
    this.el = el;

    this.tiles = {};
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

    /*
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(100, 0);
    context.moveTo(0, 0);
    context.lineTo(0, 100);
    context.stroke();
    */
    
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

    //let renderer = this.getRendererForItem(item);

    let context = this.context;

    switch(item.code) {
      case 'image':
        context.drawImage(item.el, 0, 0, item.originalWidth, item.originalHeight);
      break;

      case 'ximage':
        this.renderXImage(item);
      break;

      case 'rectangle':
        context.strokeStyle = "rgba(0, 0, 255, .75)";
        context.lineWidth = 2;
        context.strokeRect(item.x, item.y, item.w, item.h);
      break;

      case 'circle':
        context.save();
        context.beginPath();
        context.arc(item.x, item.y, item.radius, 0, 2 * Math.PI, false);
        context.fillStyle = "rgba(255, 255, 255, .25)";
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#000';
        context.stroke();
        context.restore();
      break;

      case 'controlbox':

        let handleSize = item.handleSize;
        let outerSize = item.outerSize;
        
        context.fillStyle = "rgba(255, 255, 255, .25)";
        //context.fillStyle = this.pattern;
        context.strokeStyle = "rgba(0, 0, 0, .5)";
        context.lineWidth = 1;

        //context.save();

        context.beginPath();

        if (item.drawHandles) {
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              if (j === 1 && i === 1) continue;

              let x = item.w / 2 + item.w * (i - 1) * .5 - handleSize * i * .5 + outerSize * (i - 1);
              let y = item.h / 2 + item.h * (j - 1) * .5 - handleSize * j * .5 + outerSize * (j - 1);

              context.rect(item.x + x, item.y + y, handleSize, handleSize);
              context.fillRect(item.x + x, item.y + y, handleSize, handleSize);
            }
          }
        }
        
        context.rect(item.x, item.y, item.w, item.h);
        context.stroke();

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


  renderXImage(item) {

    let context = this.context;

    context.drawImage(
      item.el,
      0, 0, item.originalWidth, item.originalHeight
    );

    return;

    let tileSide = item.tileSide;

    let m = this.transformationMatrix;


    item.Cw = this.width;
    item.Ch = this.height;
    let renderInfo = item.getRenderInfo(m);

    //console.log(renderInfo);

    context.scale(1/renderInfo.scale, 1/renderInfo.scale);

    context.strokeStyle = "rgba(0, 0, 255, .75)";
    context.lineWidth = 2;
    context.font = "30px Arial";

    for (let i = renderInfo.tilex0; i < renderInfo.tilex0 + renderInfo.tilesw1; i++) {
      for (let j = renderInfo.tiley0; j < renderInfo.tiley0 + renderInfo.tilesh1; j++ ) {

        let x = i*tileSide;
        let y = j*tileSide;

        //let tile = this.getXImageTile(item, renderInfo, i, j);
        let tile = false;

        if (tile) {

          let tileSideW = tileSide;
          let tileSideH = tileSide;

          if (x + tileSide > renderInfo.w) {
            tileSideW -= x + tileSide - renderInfo.w;
          }
          if (y + tileSide > renderInfo.h) {
            tileSideH -= y + tileSide - renderInfo.h;
          }

          console.log('before drawImage');
          context.drawImage(
            tile,
            0, 0, tileSideW, tileSideH,
            x, y, tileSideW, tileSideH
          );
          console.log('after drawImage');

        } else {
          //console.log(`WW no tile for ${i}, ${j} (${renderInfo.zoomLevel})`);
        }

        let originalTileSide = tileSide / renderInfo.scale;

        context.fillText(`${renderInfo.zoomLevel}:${i}, ${j} (${originalTileSide}px)`, x + 10, y + 40);
        context.strokeRect(x, y, tileSide, tileSide);

      }
    }

    //console.log(Object.keys(this.tiles).length + ' tiles acquired');

    /*
    context.drawImage(
      renderInfo.source, 
      renderInfo.x0, renderInfo.y0, renderInfo.w0, renderInfo.h0,
      renderInfo.x1, renderInfo.y1, renderInfo.w1, renderInfo.h1
    );
    */

  }

}