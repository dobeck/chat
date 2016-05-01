
var Chat = (function () {
    
    var ui = {
            nickNameForm: $(".nickname-form"),
            nickNameInput: $(".nickname-input"),
            chatWrapper: $(".chat-wrapper"),
            logoutButton: $(".logout-btn"),
            usersList: $(".users-list"),
            sendMessageForm: $(".send-message-form"),
            messageInput: $(".message-input"),
            chatList: $(".chat-list")
        },

        socket = io.connect();

    return {

        initialize: function () {
            this._checkSession();
            this._bindEvents();
            this._socketListeners();
        },

        _bindEvents: function () {
            var self = this;

            ui.nickNameForm.submit(function (e) {
                e.preventDefault();
                self._login();
            });

            ui.logoutButton.on("click", function (e) {
                e.preventDefault();
                self._logout();
            });

            ui.sendMessageForm.submit(function(e){
                e.preventDefault();
                self._sendMessage();
            });
        },

        _socketListeners: function () {

            socket.on("users", function (res) {
                var list = "";
                for (i=0; i < res.length; i++) {
                    list += `<li>${res[i]}</li>`;
                }
                ui.usersList.html(list);
            });

            socket.on("messages", function(res){
                var list = "";
                for (i=0; i < res.length; i++) {
                    list += `<li style="color: #${res[i].color}"><strong>${res[i].user}</strong> : ${res[i].message}</li>`;
                }
                ui.chatList.html(list);
                ui.chatList[0].scrollTop = ui.chatList[0].scrollHeight
            });

            socket.on("addMessage", function(res){
                ui.chatList.append(`<li style="color: #${res.color}"><strong>${res.user}</strong> : ${res.message}</li>`);
                ui.chatList[0].scrollTop = ui.chatList[0].scrollHeight
            });
        },

        _checkSession: function () {
            var self = this;

            $.post("/check").done(function (res) {
                if (res.user && res.color) {
                    socket.emit("checkSession", res, function (resp) {
                        if (resp) {
                            self._showChat();
                        }
                    });
                }
            });
        },

        _showChat: function () {
            ui.nickNameForm.addClass("hide");
            ui.chatWrapper.removeClass("hide");

            socket.emit("refreshChat");
        },

        _hideChat: function () {
            ui.nickNameForm.removeClass("hide");
            ui.chatWrapper.addClass("hide");
        },

        _login: function () {
            var self = this,
                user = ui.nickNameInput.val(),
                color = (Math.random()*0xFFFFFF<<0).toString(16);

            socket.emit("login", {
                user: user,
                color: color
            }, function (data) {
                $.post("/login", {
                    user: user,
                    color: color
                }).done(function () {
                    if (data) {
                        self._showChat();
                    }
                });                
            });            
        },

        _logout: function () {
            var self = this;

            socket.emit("logout", function () {
                $.post("/logout").done(function () {
                    self._hideChat();
                });                
            });
        },

        _sendMessage: function () {
            socket.emit("sendMessage", ui.messageInput.val());
            ui.messageInput.val("");
        }

    }

})();

document.addEventListener("DOMContentLoaded", function () {
    Chat.initialize();
});
