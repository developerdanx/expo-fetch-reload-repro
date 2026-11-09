// Local server for the repro. Run with: node server.js
// /iter   -> 200, logs that a new JS instance started
// /hang/* -> accepts the request and never sends response headers
// /drop   -> after a random 0-800 ms delay, destroys every held socket
//            (the app sees NSURLErrorNetworkConnectionLost, -1005)
const http = require('http');

let iteration = 0;
const held = new Set();

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/iter')) {
    iteration += 1;
    console.log(`${new Date().toISOString()} JS instance #${iteration} started`);
    res.end(String(iteration));
    return;
  }
  if (req.url.startsWith('/drop')) {
    res.end();
    const delay = Math.random() * 800;
    setTimeout(() => {
      for (const socket of held) socket.destroy();
      held.clear();
    }, delay);
    return;
  }
  held.add(req.socket);
  req.socket.on('close', () => held.delete(req.socket));
});

server.maxConnections = 2048;
server.listen(9876, '127.0.0.1', () => console.log('Listening on http://127.0.0.1:9876'));
