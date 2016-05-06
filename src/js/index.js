var HumbleCropper = require('./HumbleCropper');

export default HumbleCropper;
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
if (isBrowser) {
  window["HumbleCropper"] = HumbleCropper;
}