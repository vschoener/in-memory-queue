const actionEnum = require('./action');

const pendingJobs = [];
let running = false;

const run = () => {
  if (!running || !pendingJobs.length) {
    return ;
  }
  const { id } = pendingJobs.shift();
  process.send({
    action: actionEnum.EXECUTE_JOB,
    payload: { id },
  });

  // Create a fast non blocking loop
  setImmediate(run);
};

process.on('message', (event) => {
  const { action, payload } = event;
  switch (action) {
    case actionEnum.PUSH:
      pendingJobs.push(payload);
      break;
    case actionEnum.PAUSE:
      running = false;
      break;
    case actionEnum.START:
      running = true;
      run();
      break;
  }
});
