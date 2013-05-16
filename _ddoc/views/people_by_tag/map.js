function map(doc) {
    if (doc.type === 'person') {
        emit(doc.tag, null);
    }
}