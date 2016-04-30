const http = require("http"),
    express = require("express"),
    helpers = require("./src/js/helpers.js");

var app = express(),
    server = http.createServer(app),
    socketio = require("socket.io")(server),
    port = process.env.PORT || 8000,
    users = [];

app.use(express.static(__dirname + "/src"));

server.listen(port, function( ) {
    console.log("HTTP Server is running on port", port);
});

socketio.sockets.on("connection", function (socket) {

    socket.on("refresh", function () {
        socketio.sockets.emit("users", users);
    });

    socket.on("login", function (res, callback) {
        if (users.indexOf(res) !== -1) {
            callback(false);
        } else {
            callback(true);
            socket.user = res;
            users.push(socket.user);
            socketio.sockets.emit("users", users);
            socketio.sockets.emit("setCookie");
        }
    });

    socket.on("logout", function (callback) {
        callback(true);
        helpers.splice(users, socket.user);
        socketio.sockets.emit("users", users);
        socketio.sockets.emit("removeCookie");
    });

    socket.on("sendMessage", function (res) {
        socketio.sockets.emit("addMessage", {
            message: res,
            user: socket.user
        });
    });

});
