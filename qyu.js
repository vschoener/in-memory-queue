const EventEmitter = require('events');
const fork = require('child_process').fork;
const action = require('./action');

const qyu = (settings) => {
  return new QYU(settings);
}

class QYU extends EventEmitter {
  constructor({ rateLimit, statsInterval }) {
    super();

    this.rateLimit = rateLimit;
    this.statsInterval = statsInterval;
    this.pendingJobs = [];
    this.completedJobs = [];
    this.id = 0;
    this.running = false;
    this.initializeWorker();
  }

  initializeWorker() {
    this.worker = fork('./worker.js');
    this.worker.on('message', async (event) => {
      switch(event.action) {
        case action.EXECUTE_JOB:
          const { id } = event.payload;
          const result = await this.pendingJobs[id]();
          this.completedJobs.push(id);
          this.emit('done', { id, result });
          break;
      }
    });
  };

  async start() {
    this.worker.send({
      action: action.START
    });
  }

  push(job, priority) {
    this.id += 1;

    this.pendingJobs[this.id] = job;
    this.worker.send({
      action: action.PUSH,
      payload: { priority, id: this.id }
    });

    return this.id;
  }

  async pause() {
    this.worker.send({
      action: action.PAUSE,
    });

    return true;
  }

  async wait(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const job = this.completedJobs.find(jobId => jobId === id);
        if (job) {
          resolve(job);
        } else  {
          this.wait(id).then(resolve);
        }
      }, 100);
    });
  }
}

module.exports = qyu;
