const http = require("http"),
    express = require("express");

var app = express(),
    server = http.createServer(app),
    socketio = require("socket.io").listen(server),
    port = process.env.PORT || 6666,
    users = []

server.listen(port, function () {
    console.log("HTTP Server is running on port", port);
});

app.use(express.static(__dirname + '/src'));

socketio.sockets.on("connection", function (socket) {

    socket.on("newUser", function (data, callback){

        console.log("newUser data: ", data);
        console.log("newUser callback: ", callback);

        if (users.indexOf(data) != -1){
            callback(false);
        } else{
            callback(true);
            socket.nickname = data;
            users.push(socket.nickname);
        }
    });

});