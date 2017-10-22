import differentiate from './differentiate';
import normalize from './normalize';

export default function() {

  let opDifference = (current, previous) => {
    return current - previous;
  };

  let opVectorDifference = (current, previous) => {
    return [
      current[0] - previous[0],
      current[1] - previous[1]
    ];
  };

  let opAngularDifference = (current, previous) => {
    let difference0 = current - previous;
    let sign = difference0 < 0?-1:1;
    let phi = Math.abs(difference0) % (Math.PI * 2);

    let difference;

    if (phi > Math.PI) {
      difference = -sign * (Math.PI * 2 - phi);
    } else {
      difference = phi * sign;
    }

    return difference;
  };

  let opDivide = (current, previous) => {
    return current / previous;
  };  

  let values;
  let derivative;
  let speed;

  values = this.trackingPosition.getValues();
  derivative = differentiate(values, opVectorDifference);
  //speed = normalize(derivative);


  values = this.trackingAngle.getValues();
  derivative = differentiate(values, opAngularDifference);
  speed = normalize(derivative);
      
  if (speed[0] > 0 && Math.abs(speed[1]) > 0) {
    this.angleSpeed = speed[1] * 1000 / speed[0];
  }


  values = this.trackingDistance.getValues();
  derivative = differentiate(values, opDifference);
  speed = normalize(derivative);


  if (speed[0] > 0 && Math.abs(speed[1]) > 0) {
    this.distanceSpeed = speed[1] * 1000 / speed[0];
  }

  //console.log(speed);

  this.distanceSpeed = 0;

  this.requestAnimation();

  /*
  console.log('distance');
  values = this.trackingDistance.getValues();
  values.forEach(function(v) {
    console.log(v[2]);
  });
  */

}
