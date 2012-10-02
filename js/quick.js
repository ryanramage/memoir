define('js/quick', [
    'jquery',
    'underscore',
    'handlebars',
    'couchr',
    'EpicEditor',
    'moment',
    'hbt!templates/quick',
    'hbt!templates/quick_tag',
    'hbt!templates/quick_people',
    'hbt!templates/quick_journal',
], function ($, _, handlebars, couchr, EpicEditor, moment, base_t, tag_t, people_t, journal_t) {

    var exports = {};
    var selector = '.main'

    exports.setSelector = function (s) {
        selector = s;
    }


    exports.tag = function () {
        showNav('tag');
        $(selector + ' .quick_form').html(tag_t());
    }

    exports.people = function () {
        showNav('people');
        $(selector + ' .quick_form').html(people_t());
        var $person_entry = $(selector + ' input[name="person_entry"]');


        var eventName = "onwebkitspeechchange" in $person_entry.get(0) ? "webkitspeechchange" : "speechchange";
        $person_entry.on(eventName, function(){
           $person_entry.val();
           $person_entry.val('');
        });
    }

    exports.journal = function () {
        showNav('journal');

        var date_str = moment().format('LL');
        $(selector + ' .quick_form').html(journal_t({date_str : date_str}));
        var editor = new EpicEditor().load();
    }


    function showNav(active) {
        $(selector).html(base_t());
        $(selector + ' .nav-tabs').removeClass('active');
        $(selector + ' .' + active).addClass('active');
    }


    return exports;
})