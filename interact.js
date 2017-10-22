;(function() {

var pressed = false;
var t = 0;
var el;
var obj;

var animations = [];


var grow = function(object, dt) {

  if (object._remove) {
    object._remove = false;
    return false;
  }

  object.radius += dt / 10;
  object.el.style.width = object.radius + 'px';
  object.el.style.height = object.radius + 'px';
  return true;
}

var shrink = function(object, dt) {

  if (object._remove) {
    object._remove = false;
    return false;
  }

  var keep = true;
  object.radius -= dt / 3;

  if (object.radius < 0) {
    object.radius = 0;
    keep = false;
  }

  object.el.style.width = object.radius + 'px';
  object.el.style.height = object.radius + 'px';

  return keep;
}


function animate() {

    var t1 = Date.now();
    var dt = t1 - t;
    t = t1;

    var _keep = false;
    for (var i = 0; i < animations.length; i++) {
      var animation = animations[i];
      var keep = animation.step(dt);
      if (!keep) {
        animations.splice(i, 1);
      } else {
        _keep = true;
      }
    }

    if (_keep) requestAnimationFrame(animate);
    console.log(dt);

    /*
    var min = 100;
    
    el.style.width = (dt + min) + 'px';
    el.style.height = (dt + min) + 'px';
    */

}

function addAnimation(data, f) {
  var animation = {
    step: function(dt) {
      return f(data, dt);
    }
  }

  animations.push(animation);
}

function onMouseDown(e) {
  e.preventDefault();

  pressed = true;
  t = Date.now();

  el = document.createElement('div');
  el.className = 'aura';
  var px = e.touches?e.touches[0].pageX:e.pageX;
  var py = e.touches?e.touches[0].pageY:e.pageY;
  el.style.left = px + 'px';
  el.style.top = py + 'px';
  document.body.appendChild(el);

  obj = {};
  obj.el = el;
  obj.radius = 100;

  addAnimation(obj, grow);

  console.log('--- --- ---')
  t = Date.now();
  animate();
}

function onMouseUp(e) {
  pressed = false;

  var _obj = obj;
  _obj._remove = true;
  addAnimation(_obj, shrink);

  t = Date.now();
  animate();
  
}

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);

document.addEventListener('touchstart', onMouseDown);
document.addEventListener('touchend', onMouseUp);

})();