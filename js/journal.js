define(['jquery', 'underscore', 'couchr', 'async',
    'bird-down',
    'cal-heatmap',
    'js/reference',
    'hbt!templates/journal_all',
    'hbt!templates/journal_view'
    ],
function($, _, couchr, async, birddown, CalHeatmap, reference, all_t, view_t){
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

                if (results.next) $('.next').attr('href', '#/journal/' + results.next).show();
                else $('.next').hide();

                if (results.prev) $('.prev').attr('href', '#/journal/' + results.prev).show();
                else $('.prev').hide();

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



    function year(year_str) {
        options.emitter.emit('section', 'journal');

        var date = moment();
        if (year_str) {
            date = moment('Jan 1, ' + year_str);
        }

        var display_year = date.format('YYYY');
        var next_year = moment(date).add('y', 1).format('YYYY');
        var prev_year = moment(date).subtract('y', 1).format('YYYY');

        var start = date.startOf('year');
        var end = moment(start).endOf('year');
        //var end = date.endOf('year');




        var query = {
            descending: true,
            endkey: '"' + start.format('YYYY-MM-DD') + '"',
            startkey: '"' +  end.format('YYYY-MM-DD') + '"'
        };


        couchr.get('_ddoc/_view/journal_entries', query, function(err, results){
            var toShow = {
                rows: results.rows,
                display_year: display_year,
                next_year: next_year,
                prev_year: prev_year
            };


            $(selector).html(all_t(toShow));

            var cal = new CalHeatMap();

            var entries = {};

            _.each(results.rows, function(row){
                var d = moment(row.id, "YYYY-MM-DD");
                entries[d.unix()] = row.value;
            });


            cal.init({
                domain: 'month',
                cellsize: 15,
                subDomain: 'day',
                data: entries,
                start: start.toDate(),
                scales: [500, 100, 2000, 5000],
                onClick: function(date) {
                    var d = moment(date).format("YYYY-MM-DD");
                    window.location = '#/journal/' + d;
                }
            });

        });
    }

    exports.routes = function() {
       return  {
            '/journal/year/*' : year,
            '/journal/*': view,
            '/journal' : year
        };
    };

    return exports;

});