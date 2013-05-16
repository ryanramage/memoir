function map(doc) {
    if (doc.type !== 'lifestream.service' || !doc.timestamp || doc.ignored || !doc.config || !doc.config.service) return;
    var d = new Date(doc.timestamp);

    emit([doc.config.service, doc.config.user, d.getTime()], null);
}