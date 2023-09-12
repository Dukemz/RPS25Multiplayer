const socket = io();
console.log("le yeet");

socket.on('pong', () => { // Event for calculating ping
  latency = Date.now() - startTime;
  document.getElementById('ping').innerHTML = `Ping: ${latency}ms`
});

socket.on('connect', () => { // Whenever successfully connected to the server
  document.title = "RPS25";
  console.log("Connected to the server!");
  //if(!window.savedName) window.savedName = prompt("Please enter your name.") || "Unnamed";
  //socket.emit("name", savedName);

  window.pingInterval = setInterval(function() {
    window.startTime = Date.now();
    socket.emit('ping');
    console.log("Ping!")
  }, 2000);
});

socket.on('disconnect', () => { // Whenever disconnected from the server
  document.title = "RPS25 (not connected)";
  console.log("Disconnected from the server!");
  clearInterval(pingInterval);
  alert("Disconnected from the server. The game should attempt to automatically reconnect.");

  document.getElementById('ping').innerHTML = `Ping: ---ms`;
  document.getElementById('count').innerHTML = `0 player(s)`;
});

// This event triggers when recieving an update from the server.
socket.on("update", rdata => {
  
  // Set the local data to the data recieved from the server
  window.data = rdata;

  //const me = data.players[socket.id].pos;
  document.getElementById('count').innerHTML = `${Object.keys(data.players).length} player(s)`;

});