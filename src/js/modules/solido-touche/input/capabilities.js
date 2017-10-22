let capabilities = {};

if (window) {
  if ('ontouchstart' in window) {
    capabilities.touchEvents = true; 
  } else if (window.navigator.pointerEnabled) {
    capabilities.pointerEvents = true;
  } else if (window.navigator.msPointerEnabled) {
    capabilities.msPointerEvents = true;
  } 

  if (navigator) {
    const maxTouchPoints = navigator.maxTouchPoints || navigator.msMaxTouchPoints;
    if (maxTouchPoints > 1) capabilities.multiTouch = true;
    else if (maxTouchPoints === 1) capabilities.singleTouch = true;
  }
}

export default capabilities;