function tag_dates(doc, req) {
    var form = JSON.parse(req.body);
    if (!form.timestamp && !form.duration) return [null, 'no data provided'];
    if (!doc) return [null, 'no document to update'];
    if (doc.type !== 'memoir.tag') return [null, 'Trying to update a non tag thing'];

    if (form.timestamp) {
        doc.timestamp = form.timestamp;
    }
    if (form.duration) {
        doc['length'] = form.duration;
    }

    return [doc, 'UPDATE SUCCESS'];
}