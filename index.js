/* RPS25 Multiplayer by Dukemz */
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const readline = require('readline');
const config = require('./config.json');

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

// Run eval commands
if(config.serverEval) {
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
}

// Web server code
app.get('*', function(req, res) {
  // Information about web requests
  if(config.webDebug) {
    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.ip;
    console.log(`GET request to [${req.url}] from ${ip}`);
  }
  
  if(req.url === '/favicon.ico' || req.url === '/index.js' || req.url === '/coffee' ) {
    return res.status(418).send("tea only you FOOL");
  }
  if(req.url.includes('package') || req.url.includes('node_modules')) return res.send("nuh uh");
  res.sendFile(__dirname + req.url);
});

// Server stuff
function disconnectAll() {
  console.log("Disconnecting all players...");
  let n = 0;
  const socks = Array.from(io.sockets.sockets.values());
  for(i in socks) {
    const p = socks[i];
    p.disconnect();
    n++;
  }
  return n+1;
}

// Players
let data = {players:{}};

// Dealing with each player socket
io.on("connection", socket => {
  // New player connected
  console.log(`Player connected (id ${socket.id}).`);

  // Create new player
  data.players[socket.id] = {
    name: "Unnamed",
    pos: {x:Math.random()*584, y:Math.random()*584},
    speed: 2,
    size: 16,
    color: {r:Math.random()*255, g:Math.random()*255, b:Math.random()*255},
    namecol: {r:255, g:255, b:255}
  };

  // Reply to pings sent by the client
  socket.on('ping', function() {
    socket.emit('pong');
  });

  // When player disconnects
  socket.on("disconnect", () => {
    console.log(`Player disconnected (id ${socket.id}).`);
    // Delete player
    delete data.players[socket.id];
  });
});

httpserver.listen(3000, () => {
  console.log("Server online - listening on port 3000.");
  global.updateInterval = setInterval(() => io.sockets.emit('update', data), 10);
});