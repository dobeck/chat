
const http = require("http"),
    express = require("express");

var app = express(),
    server = http.createServer(app),
    socketio = require("socket.io").listen(server),
    port = process.env.PORT || 6666

server.listen(port, function () {
    console.log("HTTP Server is running on port", port);
});

app.use(express.static(__dirname + '/src'));

