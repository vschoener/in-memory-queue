const qyu = require('./qyu');

const q = qyu({
 rateLimit: 50, // maximum number of jobs being processed at the same time
 statsInterval: 300 // When stat event is sent, in ms
});

q.on('done', ({ id, result }) => {
 console.log(`Job done ${id}`); // `id` is an internal identifier generated by `qyu`
});

q.on('error', ({ id, error }) => {
 console.log(`Job ${id} threw an error: ${error.message}`);
});

q.on('drain', () => {
 //console.log('No more jobs to do');
});

q.on('stats', ({ nbJobsPerSecond }) => {
 console.log(`${nbJobsPerSecond} jobs/s processed`)
});

(async () => {

 const id = q.push(
   job, // function to execute
   1,   // optional priority, from 1 to 10, 1 being the highest priority - default: 5
 ); // returns the internal id

 await q.pause(); // returns a promise resolved when `q` has paused (no jobs being processed)
 await q.start(); // returns a promise resolved when `q` has started (first time) or unpaused

 const res = await q.wait(id); // resolves when the job is complete with the job result
 console.log('RES', res);
 process.exit();
})();

// example job:
async function job() {
 await wait(30);
 return {Hello: 'world!'} // That's the job `result`
}

function wait(ms) {
 return new Promise((resolve) => {
   setTimeout(resolve, ms);
 });
}