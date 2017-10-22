import SDOM from 'solido-dom';

export default class Loading {
  
  constructor(el, animator) {
    this.el = el;
    this.animator = animator;
  }

  show() {
    if (this.loadingOverlay) return;

    let loadingOverlay = SDOM.createElement('div');
    loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; overflow: hidden; background: #fff';
    SDOM.addClassName(loadingOverlay, '__solidocropper-loading');


    let loadingOverlayInner = SDOM.createElement('div');
    loadingOverlayInner.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(0deg); font-size: 10px;';
    loadingOverlayInner.innerHTML = 'Loading image ...';
    SDOM.append(loadingOverlay, loadingOverlayInner);

    SDOM.after(this.el, loadingOverlay);
    this.loadingOverlay = loadingOverlay;

    this.animator.addAnimation({
      id: 'loading',
      data: loadingOverlayInner,
      
      action: function() {
        let deg = (this.t / 30) % 360;
        this.data.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`
      }
    });
  }

  hide() {
    this.animator.endAnimation('loading');

    let _this = this;

    this.animator.addAnimation({
      data: this.loadingOverlay,
      duration: 800,
      action: function() {
        this.data.style.opacity = 1 - this.t / this.duration;
      },
      end: function() {
        this.data.remove();
        _this.loadingOverlay = false;
      }
    });
  }
}