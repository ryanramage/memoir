define(['jquery', 'underscore', 'couchr', 'async',
    'bird-down',
    'js/reference',
    'hbt!templates/journal_all',
    'hbt!templates/journal_view'
    ],
function($, _, couchr, async, birddown, reference, all_t, view_t){
    var exports = {};

    var selector = '.main';
    var options;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    };

    function view(date) {
        options.emitter.emit('section', 'journal');

        var d = moment(date, "YYYY-MM-DD");

        var timeline_query = {
            startkey: d.sod().valueOf(),
            endkey: d.eod().valueOf(),
            include_docs: true
        };

        var journal_query = {
            date : date
        };



        async.parallel({
            timeline : function(cb) {
                couchr.get('_ddoc/_view/timeline_items', timeline_query, function(err, resp, req){
                    cb(err, resp); // we do this b/c we dont want the req in the data object
                });
            },
            journal : function(cb) {
                couchr.get('_journal/' + date, function(err, doc){
                    if (err) return cb(null); // no journal found, set null
                    return cb(null,doc);
                });
            }
        }, function(err, data){



            var bd = new birddown({
                doublebrackets : true,
                doublebracketsUrlBase : '#/topics/',
                hashtagUrlBase : "#/topics/",
                cashtagUrlBase : "https://twitter.com/#!/search?q=%24",
                usernameUrlBase : "#/person/",
                listUrlBase : "https://twitter.com/"
            });

            var reference_sheet = reference.createReferenceSheet(data);

            var markup = "";
            if (data.journal.entry) {
                markup = bd.parse(data.journal.entry  + reference.generateReferenceSheetMarkdown(reference_sheet.references));
            }
            $(selector).html(view_t({
                str_date: d.format('dddd, MMMM Do YYYY'),
                date: date,
                markup: markup
            }));


            $(selector).find('.references').html(reference_sheet.html);

            getNextAndPrevEntry(date, function(err, results){
                if (err) return;

                if (results.next) {
                    $('.next').attr('href', '#/journal/' + results.next).show();
                }
                if (results.prev) {
                    $('.prev').attr('href', '#/journal/' + results.prev).show();
                }

            });
        });

    }


    function getNextAndPrevEntry(date, callback) {
        async.parallel({
            next: function(cb) {
                couchr.get('_ddoc/_view/journal_entries',{ startkey: '"' + date + '"', limit: 1, skip: 1 }, cb);
            },
            prev: function(cb) {
                couchr.get('_ddoc/_view/journal_entries',{ startkey: '"' + date + '"', limit: 1, skip: 1, descending : true }, cb);
            }
        }, function(err, resp){
            if (err) return callback(err);

            var results = {
                next: null,
                prev: null
            };
            var next_rows = resp.next[0].rows;
            if (next_rows.length === 1) {
                results.next = next_rows[0].key;
            }
            var prev_rows = resp.prev[0].rows;
            if (prev_rows.length === 1) {
                results.prev = prev_rows[0].key;
            }
            return callback(null, results);

        });
    }



    function all() {
        options.emitter.emit('section', 'journal');
        couchr.get('_ddoc/_view/journal_entries', {descending: true}, function(err, results){
            $(selector).html(all_t(results.rows));
        });
    }

    exports.routes = function() {
       return  {
            '/journal/*': view,
            '/journal' : all
        };
    };

    return exports;

});