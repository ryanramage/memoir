function map(doc) {
    if (doc.timestamp) {
        emit(doc.timestamp, doc.type);
    }
}