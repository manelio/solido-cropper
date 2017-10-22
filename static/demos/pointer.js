;(function() {

  function ex(code, options, callback) {

    console.log(code);

    if (typeof(options) === 'string') {
      options = {
        title: options
      }
    }

    var containerId = options.containerId || 'examples';

    var title = options.title;
    var className = options.class || '';

    var template = 
      document.getElementById('template-example')
      .innerHTML
      .replace(/{title}/g, title)
      .replace(/{code}/g, code)
      .replace(/{class}/g, className)
    ;

    var wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    document.getElementById(containerId).appendChild(wrapper.childNodes[1]);
    var el = document.getElementById('example-' + code + '-touchable');
    var sandboxWrapper = document.getElementById('example-' + code + '-sandbox-wrapper');
    var sandbox = document.getElementById('example-' + code + '-sandbox');

    callback(solido.pointerManager(el), {
      el: el,
      sandbox: sandbox,
      sandboxWrapper: sandboxWrapper
    });
  }

  
  
  
  

  ex('touch', {title: 'Touch'}, function(manager, dom) {
    var count = 0;
    dom.sandbox.innerHTML = count;
    manager
      .on('pointerend', function() {
        dom.sandbox.innerHTML = ++count;
      })
    ;
  });

  if (true) {
  ex('press', 'Press', function(manager, dom) {
    var count = 0;
    dom.sandbox.innerHTML = count;
    manager
      .on('pointersmove', function() {
        dom.sandbox.innerHTML = ++count;
      })
    ;
  });

  ex('double-touch', 'Double Touch', function(manager, dom) {
    var count = 0;
    dom.sandbox.innerHTML = count;
    manager
      .on('pointersmove', function() {
        dom.sandbox.innerHTML = ++count;
      })
    ;
  });
  
  ex('rotate', {title: 'Rotate', class: 'image'}, function(manager, dom) {
    var angle = 0;
    
    var image = new Image();
    image.src = '../images/arrow.png';
    dom.sandboxWrapper.appendChild(image);

    manager
      .on('pointersmove', function(e) {
        var deg = e.incrementAngle * 180 / Math.PI;
        angle += deg;
        image.style.transform = 'rotate(' + (angle.toFixed(3)) + 'deg) translateZ(0)';
      })
    ;
  });
  
  ex('scale', {title: 'Scale', class: 'image'}, function(manager, dom) {
    var scale = 1;

    var image = new Image();
    image.src = '../images/ghostbusters.png';
    dom.sandboxWrapper.appendChild(image);

    manager
      .on('pointersmove', function(e) {
        scale *= e.incrementScale;
        image.style.transform = 'scale(' + scale + ') translateZ(0)';
      })
    ;
  });

  ex('move', {title: 'Move', class: 'image'}, function(manager, dom) {
    
    var image = new Image();
    image.src = '../images/bug.png';
    image.style.zIndex = '99';

    dom.sandboxWrapper.appendChild(image);
    dom.sandboxWrapper.parentNode.style.overflow = 'visible';

    var x = 0;
    var y = 0;

    dom.el.parentNode.removeChild(dom.el);

    solido.pointerManager(image)
      .on('pointersmove', function(e) {
        x += e.incrementX;
        y += e.incrementY;
        image.style.transform = 'translate(' + x + 'px, ' + y +'px) translateZ(0)';
      })
    ;
  });

  ex('demo-rotate', {title: 'Rotate', class: 'image', containerId: 'demo1'}, function(manager, dom) {
    var angle = 0;
    
    var image = new Image();
    image.src = '../images/flower.png';
    dom.sandboxWrapper.appendChild(image);

    manager
      .on('pointersmove', function(e) {
        var deg = e.incrementAngle * 180 / Math.PI;
        angle += deg;
        image.style.transform = 'rotate(' + (angle.toFixed(3)) + 'deg) translateZ(0)';
      })
    ;
  });
  }

  
  /*
  ex('touch', 'Touch')
    .on('pointersmove', function() {

    })
  ;
  ex('press', 'Press');
  ex('double-touch', 'Double Touch');
  ex('touch-2', 'Touch 2');
  ex('swipe', 'Swipe');
  */

  /*
  ex('touch')
    .on('touch', function() {
      console.log('move!');
    })
  ;
  */


  function move(e, mat, origin) {
    var el = this.el;

    origin.style.left = (e.pageX - 15) + 'px';
    origin.style.top = (e.pageY - 15) + 'px';

    el.ix += e.incrementX;
    el.iy += e.incrementY;

    el.style.left = el.ix + 'px';
    el.style.top = el.iy + 'px';

    var cx, cy;

    if (isNaN(e.pageX)) {
      cx = 0;
      cy = 0;
    } else {
      var c = mat.transformPointInverse(e.pageX - el.offsetLeft, e.pageY - el.offsetTop);
      cx = c[0];
      cy = c[1];
    }

    mat.translate(cx, cy);
    mat.rotate(e.incrementAngle);
    mat.scale(e.incrementScale);
    mat.translate(-cx, -cy);

    var matrixString = mat.toCSS3MatrixString();
    el.style.transform = matrixString;
  }

  var els = document.querySelectorAll('.pointable');

  for(var i = 0; i < els.length; i++) {

    (function() {
      var el = els[i];
      el.style.bottom = 'auto';
      el.style.right = 'auto';

      el.ix = el.offsetLeft;
      el.iy = el.offsetTop;

      var origin = document.createElement('div');
      origin.className = 'origin';
      document.getElementById('main-container').appendChild(origin);

      var components = solido.dom.getTransformComponents(el);
      var mat = new solido.math.mat2d();
      mat
        .translate(components.tx, components.ty)
        .rotate(components.r)
        .scale(components.s)
      ;

      solido.pointerManager(el)
      .on('pointersmove', function(e) {
        (move.bind(this))(e, mat, origin);
      });

    })();

  }

})();