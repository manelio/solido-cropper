import SDOM from 'solido-dom';
import ImagePyramid from './ImagePyramid';
import JobQueue from './JobQueue';

export default class CanvasImagePyramid extends ImagePyramid {

  buildTile(zoomLevel, i, j, onComplete, callback) {
    //console.log(`begin building (${zoomLevel}, ${i}, ${j})`);

    let zoomLevelInfo = this.zoomLevelInfo[zoomLevel];

    let canvas = SDOM.createElement('canvas');
    let tileSide = this.tileSide;

    canvas.width = tileSide;
    canvas.height = tileSide;

    let _process;
    let context = canvas.getContext('2d');
    let tilesPerSide0 =  zoomLevelInfo.tilesPerSide0;
    let tileSide0In1 = tileSide / tilesPerSide0;
    let ntiles =  tilesPerSide0 * tilesPerSide0;
    let el = this.el;

    let i0Ini = i * Math.pow(2, zoomLevel);
    let j0Ini = j * Math.pow(2, zoomLevel);

    _process = function process(ntile, callback) {

      if (ntile < ntiles) {
        let j0 = Math.floor(ntile / tilesPerSide0);
        let i0 = ntile % tilesPerSide0;

        context.drawImage(el,
          (i0 + i0Ini) * tileSide, (j0 + j0Ini) * tileSide, tileSide, tileSide,
          i0 * tileSide0In1, j0 * tileSide0In1, tileSide0In1, tileSide0In1
        );
        
        JobQueue.fasync(function() {
          _process(ntile+1, callback);
        }, 1);
      } else {
        onComplete(canvas);
        callback(canvas);
      }
    }

    JobQueue.fasync(function() {
      _process(0, callback);
    }, 1);

    /*
    fasync(function() {
      console.log(`finished building (${zoomLevel}, ${i}, ${j})`);
      callback();
    }, Math.floor(Math.random() * 5) * 1000 + 1000);
    */

  }

  getBestAlternateTile(zoomLevel, i, j) {
    let canvas = SDOM.createElement('canvas');
    let tileSide = this.tileSide;
    canvas.width = tileSide;
    canvas.height = tileSide;
    let context = canvas.getContext('2d');

    context.fillRect(0, 0, tileSide, tileSide);

    return {
      source: canvas,
      zoomLevel: zoomLevel,
      i: i,
      j: j
    }

  }

}
