export default class SolidoString {

  static snakeToCamel(s, capitalizeFirstLetter) {
      let result = s.replace(/([\-_]\w)/g, function(m){return m[1].toUpperCase();});
      
      if (capitalizeFirstLetter) {
        result = this.capitalizeFirstLetter(result);
      }
      return result;
  }

  static capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

}