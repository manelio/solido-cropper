import Renderable from './Renderable';

export default class ControlBox extends Renderable {

  constructor(def) {
    super();

    this.drawHandles = true;
    this.handleSize = 50;
    this.outerSize = 0;

    this.code = 'controlbox';
    
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
  }

  testPoint(x, y) {
    let bbw = this.w + this.outerSize * 2;
    let bbh = this.h + this.outerSize * 2;
    let bbx = this.x - this.outerSize;
    let bby = this.y - this.outerSize;

    //console.log(`${x} ${y}`);
    //console.log(`${bbx} ${bby} ${bbw} ${bbh}`);

    let isInBoundingBox = 
      x > bbx && 
      x < bbx + bbw &&
      y > bby &&
      y < bby + bbh
    ;

    if (!isInBoundingBox) return false;

    if (this.drawHandles) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (j === 1 && i === 1) continue;

          let handlex = this.w / 2 + this.w * (i - 1) * .5 - this.handleSize * i * .5 + this.outerSize * (i - 1);
          let handley = this.h / 2 + this.h * (j - 1) * .5 - this.handleSize * j * .5 + this.outerSize * (j - 1);

          //console.log(`${handlex}, ${handley}`);

          handlex += this.x;
          handley += this.y;

          let isInHandle = 
            x > handlex && 
            x < handlex + this.handleSize &&
            y > handley &&
            y < handley + this.handleSize
          ;

          if (isInHandle) {
            return [i, j];
          }

        }
      }
    }

    return true;
    //return false;
  }

}