module.exports = {

    splice: function (arr, val) {
        var index = arr.indexOf(val);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    },

    remove: function (arr, val) {
        return arr.filter(function (el) {
            return el.user !== val;
        });
    },

    getRandomHex: function () {
        return "#" + (Math.random()*0xFFFFFF<<0).toString(16);
    }
}

