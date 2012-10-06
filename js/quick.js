define('js/quick', [
    'jquery',
    'underscore',
    'async',
    'handlebars',
    'couchr',
    'EpicEditor',
    'moment',
    'jquery-lifestream',
    'hbt!templates/quick',
    'hbt!templates/quick_tag',
    'hbt!templates/quick_people',
    'hbt!templates/quick_people_row',
    'hbt!templates/quick_journal',
    'hbt!templates/quick_lifestream'
], function ($, _, async, handlebars, couchr, EpicEditor, moment, lifestream, base_t, tag_t, people_t, people_row_t, journal_t, lifestream_t) {

    var exports = {};
    var selector = '.main'
    var options;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    }


    exports.tag = function () {
        showNav('tag');
        $(selector).find('.quick_form').html(tag_t());
    }


    function addPerson(name) {
        // split
        // get valid name
        var person = {
            name : name,
            handle : name
        }

        $(selector).find('.table.name').show();
        $(selector).find('.table.name tbody').append(people_row_t(person))

    }


    exports.people = function () {
        showNav('people');
        $(selector).find('.quick_form').html(people_t());
        var $person_entry = $(selector).find('input[name="person_entry"]');

        $(selector).find('form').on('submit', function(){
            addPerson($person_entry.val());
            return false;
        })


        var eventName = "onwebkitspeechchange" in $person_entry.get(0) ? "webkitspeechchange" : "speechchange";
        $person_entry.on(eventName, function(){
           addPerson($person_entry.val());
           $person_entry.val('');
        });
    }

    exports.journal = function () {
        showNav('journal');

        var date_str = moment().format('LL');
        $(selector).find('.quick_form').html(journal_t({date_str : date_str}));
        var editor = new EpicEditor().load();
    }

    exports.lifestream = function() {
        showNav('lifestream');
        $(selector).find('.quick_form').html(lifestream_t());
        var settings = {
            list:[
              {
                service: "github",
                user: "ryanramage"
              },
              {
                service: "twitter",
                user: "eckoit"
              }
            ]
        };
        async.parallel({
            lifestream : function(cb){
                $('#lifestream').lifestream(settings, cb);
            },
            previous : function(cb) {
                couchr.get('_ddoc/_view/service_by_date', {limit: 200}, function(err, resp){
                    var ids = {};
                    _.each(resp.rows, function(row){
                        var state = 'exists';
                        if (row.value === true) state = 'ignore';
                        ids[row.id] = state;
                    });
                    cb(null, ids);
                });
            }
        }, function(err, results){
            var docs = [];
            _.each(results.lifestream, function(item){
                item._id = item.config.service + '-' + item.date.getTime();
                if (results.previous[item._id]) return;
                item.type = 'lifestream.service';
                item.timestamp = item.date.getTime();
                delete item.config._settings;
                docs.push(item);
            });
            if (docs.length > 0){
                couchr.post('_db/_bulk_docs', {docs: docs}, function(err, resp){
                    console.log(err, resp);
                });
            }

        });
    }

    exports.routes = function() {
       return  {
            '/quick/tag' : exports.tag,
            '/quick/people' : exports.people,
            '/quick/journal' : exports.journal,
            '/quick/lifestream' : exports.lifestream,
            '/quick' : exports.tag
        }
    }



    function showNav(active) {
        options.emitter.emit('section', 'quick');
        $(selector).html(base_t());
        $(selector).find('.nav-tabs').removeClass('active');
        $(selector).find('.' + active).addClass('active');
    }


    return exports;
})