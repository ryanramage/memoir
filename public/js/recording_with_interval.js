define(['simple-uuid'], function(uuid){

    var recording_with_interval = function(file, start_date, duration){
        this.id = uuid.uuid();
        this.file = file;
        this.start_date = start_date;
        this.duration = duration; // comes to us in seconds
        this.md5 = null;
        this.inError = false;
    };


    recording_with_interval.prototype.setError = function(inError) {
        this.inError = inError;
    };

    recording_with_interval.prototype.getError = function() {
        return this.inError;
    };

    recording_with_interval.prototype.durationMS = function() {
        return this.start_date.valueOf() + (this.duration * 1000);
    };

    recording_with_interval.prototype.getEndMoment = function() {
        return this.start_date.add('s', this.duration);
    };

    return recording_with_interval;

});