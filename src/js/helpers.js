module.exports = {

    splice: function (arr, val) {
        var index = arr.indexOf(val);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

