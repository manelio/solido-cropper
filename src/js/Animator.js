export default class Animator {

  constructor() {
    this.animations = [];
  }

  addAnimation(animation) {
    animation.t = 0;
    this.animations.push(animation);
  }

  endAnimation(animationId) {
    let n = this.animations.length;
    while (n--) {
      if (this.animations[n].id === animationId) {
        this.animations.splice(n, 1);
      }
    }
  }

  animate() {
    if (!this.t0) {
      this.t0 = Date.now();
      return;
    }
    
    let t1 = Date.now();
    let dt = t1 - this.t0;
    this.t0 = t1;

    let n = this.animations.length;
    while (n--) {
      let remove = false;
      let animation = this.animations[n];
      animation.t += dt;

      if (animation.duration && animation.t >= animation.duration) {
        animation.t = animation.duration;
        remove = true;
      }

      if (animation.action) {
        (animation.action.bind(animation))();
      }

      if (remove) {
        if (animation.end) {
          (animation.end.bind(animation))();
        }
        this.animations.splice(n, 1);
        //console.log(`Animation ${n} ended`);
      }
    }

  }

  oldAnimate() {
    let t1 = Date.now();
    let dt = t1 - this.t0;
    this.t0 = t1;

    if (this.disable) return;

    let T0 = this.origin;
    let T1 = this.target;

    if (!T0) return;


    let dmax = 800;
    if (this.animationDuration > dmax) {
      this.animationDuration = dmax;
      this.disable = true;
    }

    let d = this.animationDuration;
    this.animationDuration += dt;
    
    //d = this.easeOutBounce(d/dmax);
    d = d/dmax;

    let x = T0.x + (T1.x - T0.x) * d;
    let y = T0.y + (T1.y - T0.y) * d;
    let w = T0.w + (T1.w - T0.w) * d;
    let h = T0.h + (T1.h - T0.h) * d;
    let r = T0.r + this.shortAngleDist(T0.r, T1.r) * d;

    let matrix = this.getCenter(x, y, w, h, r);

    this.transform.copy(matrix);

      /*
      let m = this.transform;
      m.setId();

      m.translate(tx, ty);
      m.rotate(r);
      m.scale(s);
    */

    this.imageLayer.dirty = true;
  }

  animation1() {
    this.animationDuration = 0;

    this.target = {
      x: 2297,
      y: 562,
      w: 214,
      h: 70,
      r: .2
    }

    this.origin = {
      x: 0,
      y: 0,
      w: this.Iw,
      h: this.Ih,
      r: 0
    }

    this.disable = false;
  }

  animation2() {
    this.animationDuration = 0;

    this.origin = {
      x: 2297,
      y: 562,
      w: 214,
      h: 70,
      r: .2
    }

    this.target = {
      x: 0,
      y: 0,
      w: this.Iw,
      h: this.Ih,
      r: 0
    }

    this.disable = false;
  }



}