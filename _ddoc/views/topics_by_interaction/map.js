function map(doc) {
    var _ = require('views/lib/underscore')._;
    var tt = require('views/lib/twitter-text');
    var BirdDown = require('views/lib/bird-down');
    var bd = new BirdDown();
    var moment = require('views/lib/moment');

    if (doc.type === 'journal' && doc.entry) {
        var timestamp = moment(doc._id, "YYYY-MM-DD").valueOf();

        var names = _.map(tt.extractHashtags(doc.entry), function(name){ return name.toLowerCase(); });


        var people = _.uniq(names);
        _.each(people, function(person){
            emit([person, timestamp], {type: 'journal'});
        });

        var local_topics = bd.extractLocalTopics(doc.entry);
        _.each(local_topics, function(person){
            emit([person, timestamp], {type: 'journal'});
        });
    }
}