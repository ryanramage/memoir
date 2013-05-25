function map (doc) {
    if (doc.type === 'memoir.tag') {

        var text = doc.text;
        if (doc.text && doc.text.length > 50) text = text.substring(0, 50) + ' ...';

        emit(doc.timestamp, {p: 0, ms: doc.length, t: text} );
        // so we can get end of our tags if they are long!
        emit(doc.timestamp + doc.length, {p: 1, ms: doc.length });
    }
}