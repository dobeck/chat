
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

        /*events = {
            "nickNameForm:submit": "_login"
        },*/

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
                console.log(res);
                var list = "";
                for (i=0; i < res.length; i++) {
                    list += `<li>${res[i]}</li>`;
                }
                ui.usersList.html(list);
            });

            socket.on("setCookie", function () {
                document.cookie = "auth=true";
            });

            socket.on("removeCookie", function () {
                document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            });

            socket.on("addMessage", function(res){
                ui.chatList.append(`<li><strong>${res.user}</strong> : ${res.message}</li>`);
            });
        },

        _checkSession: function () {
            if (document.cookie.split(";").indexOf("auth=true") !== -1) {
                this._showChat();
            }
        },

        _showChat: function () {
            ui.nickNameForm.addClass("hide");
            ui.chatWrapper.removeClass("hide");

            socket.emit("refresh");
        },

        _hideChat: function () {
            ui.nickNameForm.removeClass("hide");
            ui.chatWrapper.addClass("hide");
        },

        _login: function () {
            socket.emit("login", ui.nickNameInput.val(), function (data) {
                if (data) {
                    ui.nickNameForm.addClass("hide");
                    ui.chatWrapper.removeClass("hide");
                }
            });            
        },

        _logout: function () {
            socket.emit("logout", function () {
                ui.nickNameForm.removeClass("hide");
                ui.chatWrapper.addClass("hide");
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
