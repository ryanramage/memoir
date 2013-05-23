/**
 * User: ryan
 * Date: 12-10-10
 * Time: 5:03 PM
 */
define([
    'underscore',
    'underscore.string',
    'moment',
    'js/date_utils',
    'hbt!templates/reference_sheet',
    'hbt!templates/reference_sheet_markdown'
], function (_, _s, moment, date_utils, template, ref_sheet_template) {
    var exports = {};


    exports.getHtml = function(doc){
        if (doc.type === 'lifestream.service') return doc.html;
    };

    exports.getTextDesc = function(doc){
        return _s.stripTags(exports.getHtml(doc));
    };

    exports.getIconClass = function(doc) {
        if (doc.type === 'lifestream.service') return 'lifestream-' +  doc.config.service ;
        return null;
    };

    exports.getHref = function(doc) {
        if (doc.type === 'lifestream.service') return doc.url;
        // for now
        return '#/timeline/' + date_utils.stringifyDate(doc.timestamp);
    };

    function appendNonListedItems(doc, timeline_entries) {

        if (!doc) doc = {};
        if (!doc.references) doc.references = [];
        var to_add = [];

        _.each(timeline_entries, function(entry) {
            var tl_doc = entry.doc;

            if (! _.detect(doc.references, function(check){ return (check === tl_doc._id); })) {

                to_add.push(tl_doc._id);
            }
        });
        doc.references.push.apply(doc.references, to_add);

        return {
            updated : (to_add.length > 0),
            doc : doc
        };
    }

    function orderBasedOnSavedReferences(doc, timeline_entries) {
        var keyMap = {};
        _.each(timeline_entries, function(entry) {
            keyMap[entry.id] = entry.doc;
        });
        var index = 1;

        return _.map(doc.references, function(ref){

            var tl_doc = keyMap[ref];

            return {
                html : exports.getHtml(tl_doc),
                textDesc : exports.getTextDesc(tl_doc),
                icon_class : exports.getIconClass(tl_doc),
                url : exports.getHref(tl_doc),
                ref_date : moment(tl_doc.timestamp).format("h:mm:ss a"),
                index :index++,
                id : tl_doc._id
            };
        });

    }

    exports.createReferenceSheet = function(data) {

        var response = appendNonListedItems(data.journal, data.timeline.rows);
        response.references = orderBasedOnSavedReferences(response.doc, data.timeline.rows);
        response.html = template(response.references);
        return response;

    };

    exports.generateReferenceSheetMarkdown = function(references) {
        return ref_sheet_template(references);
    };


    return exports;
});