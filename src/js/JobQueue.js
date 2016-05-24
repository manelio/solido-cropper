import SDOM from 'solido-dom';

let _jobqueue = [];
let _jobqueue_max_concurrent_jobs = 8;
let _jobqueue_running = 0;

//let fasync = SDOM.requestAnimationFrame;
let fasync = setTimeout;

export default class JobQueue {
  
  static addJob(job) {
    _jobqueue.unshift(job);
    this.notifyNewJob();
  }

  static notifyNewJob() {
    if (_jobqueue_running >= _jobqueue_max_concurrent_jobs) return;
    if (!_jobqueue.length) {
      _jobqueue_running = 0;
      return;
    }

    let job = _jobqueue.shift();
    
    _jobqueue_running++;
    job(function() {
      
      fasync(function() {
        _jobqueue_running--;
        this.notifyNewJob();

      }.bind(this), 1);

    }.bind(this));
  }

  static fasync(f, t) {
    fasync(f, t);
  }

}
