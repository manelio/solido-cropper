// Adapted from Transform class by Simon Sarris
// www.simonsarris.com
// sarris@acm.org
// https://github.com/simonsarris/Canvas-tutorials/blob/master/transform.js

export default class TransformationMatrix {
  
  constructor(m) {
    if (m) this.m = m;
    else this.setId();
  }

  setId() {
    this.m = [1,0,0,1,0,0];
    return this;
  };

  invert() {
    let m = this.m;
    let
      k = 1 / (m[0] * m[3] - m[1] * m[2]),
      a = m[3] * k,
      b = -m[1] * k,
      c = -m[2] * k,
      d = m[0] * k,
      e = k * (m[2] * m[5] - m[3] * m[4]),
      f = k * (m[1] * m[4] - m[0] * m[5])
    ;
    this.m = [a, b, c, d, e, f];
    return this;
  }

  multiply(m2) {
    let m = this.m;

    if (typeof(m2) === 'object' && !m2.length) {
      m2 = m2.getMatrix();
    }
    
    let
      a = m[0] * m2[0] + m[2] * m2[1],
      b = m[1] * m2[0] + m[3] * m2[1],
      c = m[0] * m2[2] + m[2] * m2[3],
      d = m[1] * m2[2] + m[3] * m2[3],
      e = m[0] * m2[4] + m[2] * m2[5] + m[4],
      f = m[1] * m2[4] + m[3] * m2[5] + m[5]
    ;

    this.m = [a, b, c, d, e, f];
    return this;
  };

  rotate(rad) {
    let
      m = this.m,
      cos = Math.cos(rad),
      sin = Math.sin(rad),
      a = m[0] * cos + m[2] * sin,
      b = m[1] * cos + m[3] * sin,
      c = m[0] * -sin + m[2] * cos,
      d = m[1] * -sin + m[3] * cos
    ;
    this.m[0] = a;
    this.m[1] = b;
    this.m[2] = c;
    this.m[3] = d;
    return this;
  }

  translate(x, y) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
    return this;
  };

  scale(sx, sy) {
    if (sy === undefined) sy = sx;

    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
    return this;
  };

  transformPoint(px, py) {
    let
      m = this.m,
      x = px,
      y = py
    ;

    px = x * m[0] + y * m[2] + m[4];
    py = x * m[1] + y * m[3] + m[5];

    return [px, py];
  };  

  getMatrix() {
    let m = this.m;
    return [m[0], m[1], m[2], m[3], m[4], m[5]];
  }
  
  setMatrix(m) {
    this.m[0] = m[0];
    this.m[1] = m[1];
    this.m[2] = m[2];
    this.m[3] = m[3];
    this.m[4] = m[4];
    this.m[5] = m[5];
    return this;
  }

}

export default TransformationMatrix;