function map(doc) {
    if (doc.type === 'journal') {
        var size = 0;
        if (doc.entry) {
            size = doc.entry.length;
        }
        emit(doc._id, size);

    }
}