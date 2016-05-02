
var Chat = (function () {
    
    var ui = {
            nickNameForm: $(".nickname-form"),
            nickNameInput: $(".nickname-input"),
            chatWrapper: $(".chat-wrapper"),
            logoutButton: $(".logout-btn"),
            usersList: $(".users-list"),
            sendMessageForm: $(".send-message-form"),
            messageInput: $(".message-input"),
            chatList: $(".chat-list"),
            errorBlock: $(".error"),
            editNicknameModal: $("#editModal"),
            editNicknameForm: $(".edit-nickname-form"),
            editNicknameButton: $(".edit-nickname-btn"),
            editNicknameInput: $(".edit-nickname-input"),
            editNicknameErrorBlock: $(".edit-nickname-error")
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

            ui.editNicknameForm.submit(function (e) {
                e.preventDefault();
                self._editNickname();
            })
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

            ui.nickNameForm.removeClass("has-error");
            ui.errorBlock.html("");
        },

        _login: function () {
            var self = this,
                user = ui.nickNameInput.val(),
                //color = (Math.random()*0xFFFFFF<<0).toString(16);
                color = this._getRandomColor();

            socket.emit("login", {
                user: user,
                color: color
            }, function (data) {
                if (data) {
                    $.post("/login", {
                        user: user,
                        color: color
                    }).done(function () {
                        if (data) {
                            self._showChat();
                        }
                    });
                } else {
                    ui.nickNameForm.addClass("has-error");
                    if (user === "") {
                        ui.errorBlock.html("Please enter your nickname.");
                    } else {
                        ui.errorBlock.html("Nickname already exsists.");
                    }                    
                }
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
            var msg = ui.messageInput.val();

            if (msg !== "") {
                socket.emit("sendMessage", msg);
                ui.messageInput.val("");
            }
        },

        _editNickname: function () {
            var self = this,
                user = ui.editNicknameInput.val();

            socket.emit("editNickname", {
                user: user
            }, function (data) {
                if (data) {
                    $.post("/edit-nickname", {
                        user: user
                    }).done(function () {
                        ui.editNicknameModal.modal("hide")
                    });
                } else {
                    ui.editNicknameForm.addClass("has-error");
                    if (user === "") {
                        ui.editNicknameErrorBlock.html("Please enter your nickname.");
                    } else {
                        ui.editNicknameErrorBlock.html("Nickname already exsists.");
                    }                    
                }
            });
        },

        _getRandomColor: function() {
            var colors = ["FF6699", "CC0099", "3366FF", "CCCC33", "FF6600", "FF3333", "CC00CC", "333399", "CC0066", "990000", "663300", "660000", "800000", "808080", "000000", "FF0000", "800080", "FF00FF", "008000", "00FF00", "808000", "000080", "0000FF", "008080"];
            return colors[Math.floor(Math.random() * colors.length)];
        }

    }

})();

document.addEventListener("DOMContentLoaded", function () {
    Chat.initialize();
});
