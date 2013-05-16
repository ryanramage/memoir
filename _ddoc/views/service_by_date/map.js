function map(doc) {
        if (doc.type !== 'lifestream.service' || !doc.timestamp) return;
        var d = new Date(doc.timestamp);
        var value = doc.config;
        //if (doc.ignored) value = true;
        emit(d.getTime(), value);
}
