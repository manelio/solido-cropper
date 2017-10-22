const timeSeries = () => {

  let self = {
    msHistory: 100,
    values: []
  };

  Object.assign(self, {

    reset(t) {
      this.values = [];
    },

    removeOldValues(t) {
      t = t || Date.now();

      while(this.values.length > 0) {
          if (t - this.values[0][0] <= this.msHistory) {
              break;
          }
          this.values.shift();
      }
    },
    
    addValue(v) {

      let t = Date.now();
      let dt;

      if (this.values.length) {
        let lastValue = this.values[this.values.length - 1];
        dt = t - lastValue[0];
        if (dt < 1) {
          dt = 1;
        }
      } else {
        dt = 1;
      }

      this.removeOldValues(t);

      this.values.push([t, dt, v]);
    },

    getValues() {
      return this.values;
    }

  })

  return self;
}

export default timeSeries;
