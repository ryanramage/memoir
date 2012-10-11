/**
 * User: ryan
 * Date: 12-10-10
 * Time: 5:03 PM
 */
define('js/reference', ['underscore', 'underscore.string', 'moment', 'hbt!templates/reference_sheet'], function (_, _s, moment, template) {
    var exports = {};


    exports.getHtml = function(doc){
        if (doc.type === 'lifestream.service') return doc.html;
    }

    exports.getTextDesc = function(doc){
        return _s.stripTags(exports.getHtml(doc));
    }

    exports.getIconClass = function(doc) {
        if (doc.type === 'lifestream.service') return 'lifestream-' +  doc.config.service ;
        return null;
    }

    exports.getHref = function(doc) {

    }

    exports.createReferenceSheet = function(results) {
        var i = 1;
        var list = _.map(results.rows, function(row){
           row.html = exports.getHtml(row.doc);
           row.textDesc = exports.getTextDesc(row.doc);
           row.icon_class = exports.getIconClass(row.doc);
           row.ref_date = moment(row.key).format("h:mm:ss a");
           row.index = i++;
           return row;
        });
        return template(list);
    }
    return exports;
});