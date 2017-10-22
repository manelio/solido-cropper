import inputEvents from './input'; 

import pointerManager from './pointerManager/pointerManager'

let _instanceId = 0;

function touche(el, options) {

  let input = inputEvents(el);

  return {
    foo() {
      console.log(el);
    }
  }

}

var isBrowser = new Function("try {return this === window;}catch(e){ return false;}");
if (isBrowser) {
  if (!window.solido) {
    window.solido = {};
  }

  window.solido.Touche = touche;
  window.solido.pointerManager = pointerManager;
}

