
var Chat = (function () {
    
    var ui = {
            nickNameForm: $(".nickname-form"),
            nickNameInput: $(".nickname-input"),
            chatWrapper: $(".chat-wrapper")
        },

        /*events = {
            "nickNameForm:submit": "this._login"
        },*/

        socket = io.connect();

    return {

        initialize: function () {
            this._bindEvents();
        },

        _bindEvents: function () {
            var self = this;

            ui.nickNameForm.submit(function (e) {
                e.preventDefault();
                self._login();
            });
        },

        _login: function () {

            console.log("ui.nickNameInput.val(): ", ui.nickNameInput.val());

            socket.emit("newUser", ui.nickNameInput.val(), function (data) {

                console.log("_login: ", data);

                if (data) {
                    ui.nickNameForm.addClass("hide");
                    ui.chatWrapper.removeClass("hide");
                }
            });
        }
    }

})();

document.addEventListener("DOMContentLoaded", function () {
    Chat.initialize();
});

