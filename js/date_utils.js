define('js/date_utils', [
  'moment'
], function(moment){

    var exports = {};

    exports.parseDate = function(date) {
        return moment(date, 'YYYY-MM-DDTHH:mm:ss').toDate();
    };

    exports.stringifyDate = function(date) {
        var m = moment(date);
        return m.format('YYYY-MM-DDTHH:mm:ss');
    };
    return exports;
});