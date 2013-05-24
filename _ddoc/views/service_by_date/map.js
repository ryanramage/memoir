function map(doc) {
        if (doc.type !== 'lifestream.service' || !doc.timestamp) return;

        if (doc._id.indexOf('-') < 0) return;

        var d = new Date(doc.timestamp);
        var value = doc.config;
        //if (doc.ignored) value = true;
        emit(d.getTime(), value);
}
