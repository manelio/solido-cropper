import eventEmitter from 'solido-eventemitter';
import timeSeries from './timeSeries';

const pointerFactory = () => {

  self = {};

  Object.assign(self, {

    tracking: timeSeries(),
    
    status: {
      dirty: false,
      moved: false,
      
      pageX0: 0,
      pageY0: 0,

      pageX: 0,
      pageY: 0
    }
  });

  Object.assign(self, eventEmitter());

  return self;
}

export default pointerFactory;
