var SolidoCropper = require('./SolidoCropper');

export default SolidoCropper;
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
if (isBrowser) {
  window["SolidoCropper"] = SolidoCropper;
}