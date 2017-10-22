export default function() {

  let itemsArray = [];
  let itemsHash = {};

  function SMap() {
    this.n = 0;
  }

  SMap.prototype.add = function(id, object) {
    if (!(id in itemsHash)) {
      itemsArray.push(object);
      itemsHash[id] = object;
      this.n++;
    }
  };

  SMap.prototype.get = function(id) {
    if (id in itemsHash) {
      return itemsHash[id];
    }
  }

  SMap.prototype.getByIndex = function(index) {
    if (index < itemsArray.length) {
      return itemsArray[index];
    }
  }

  SMap.prototype.remove = function(id) {
    if (id in itemsHash) {
      let object = itemsHash[id];
      let index = itemsArray.indexOf(object);
      itemsArray.splice(index, 1);
      delete itemsHash[id];
      this.n--;
    }
  };

  SMap.prototype.asArray = function() {
    return itemsArray;
  };

  SMap.prototype.hasId = function(id) {
    return id in itemsHash;
  };

  return new SMap();
}