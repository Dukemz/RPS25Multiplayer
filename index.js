const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const readline = require('readline');

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

// Run eval commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});
rl.on('line', line => { try {
  console.log(eval(line));
} catch(err) { console.error(err) }
});
console.log("Eval input ready.");

app.get('*', function(req, res) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.ip;
  console.log(`GET request to [${req.url}] from ${ip}`)
  if(req.url === '/favicon.ico' || req.url === '/index.js' || req.url === '/coffee' ) {
    return res.status(418).send("tea only you FOOL");
  }
  if(req.url.includes('package') || req.url.includes('node_modules')) return res.send("nuh uh");
  res.sendFile(__dirname + req.url);
});

let updateInterval;
httpserver.listen(3000, () => {
  console.log("Server online - listening on port 3000.");
  updateInterval = setInterval(() => io.sockets.emit('update', data), 10);
});