const http = require("http"),
    express = require("express"),
    session = require("express-session"),
    cookieParser = require("cookie-parser"),
    helpers = require("./src/js/helpers.js");

var app = express(),
    server = http.createServer(app),
    socketio = require("socket.io")(server),
    port = process.env.PORT || 8000,
    users = [],
    messages = [];

app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "chat",
    cookie: {
        maxAge: 999999999,
        path: "/"
    }
}));
app.use(express.static(__dirname + "/src"));

app.post("/login", function (req, res) {
    req.on("data", function (data) {
        res.cookie("user" , data.toString().split("&")[0].split("=")[1]);
        res.cookie("color" , data.toString().split("&")[1].split("=")[1]);
        res.end();
    });
});

app.post("/logout", function (req, res) {
    res.clearCookie("user");
    res.clearCookie("color");
    res.send("Cookie deleted");
    res.end();
});

app.post("/check", function(req, res) {    
    res.send(req.cookies);
    res.end();
 });

server.listen(port, function( ) {
    console.log("HTTP Server is running on port", port);
});

socketio.sockets.on("connection", function (socket) {

    socket.on("refreshChat", function () {
        socketio.sockets.emit("users", users);
        socketio.sockets.emit("messages", messages);
    });

    socket.on("checkSession", function (res, callback) {
        if (res) {
            callback(true);
            socket.user = res.user;
            socket.color = res.color;
            if (users.indexOf(res.user) === -1) {
                users.push(socket.user);
            }
        } else {
            callback(false);
        }
    });

    socket.on("login", function (res, callback) {
        if (users.indexOf(res) !== -1) {
            callback(false);
        } else {
            callback(true);
            socket.user = res.user;
            socket.color = res.color;
            users.push(socket.user);
            socketio.sockets.emit("users", users);
            socketio.sockets.emit("messages", messages);
        }
    });

    socket.on("logout", function (callback) {
        callback(true);
        helpers.splice(users, socket.user);
        socketio.sockets.emit("users", users);
    });

    socket.on("sendMessage", function (res) {
        var message = {
            message: res,
            user: socket.user,
            color: socket.color
        }

        socketio.sockets.emit("addMessage", message);
        messages.push(message);
    });

});
