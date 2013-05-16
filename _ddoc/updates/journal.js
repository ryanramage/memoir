function journal(doc, req) {
    var form = JSON.parse(req.body);
    if (!form.entry)      return [null, "Provide an Entry"];
    if (!doc) return [null, 'no journal to update'];
    if (doc.type !== 'journal') return [null, 'Trying to update a non journal thing'];
    doc.entry = form.entry;
    return [doc, 'UPDATE SUCCESS'];
};