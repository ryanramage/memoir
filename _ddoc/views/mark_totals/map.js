function map(doc) {
    if (doc.timestamp) {
       var start  = doc.timestamp;
       var d = new Date(start);
       var year = Number(d.getFullYear());
       var month = Number(d.getMonth()) + 1;
       var day = Number(d.getDate()) ;
       emit([year, month, day], 1);
    }
}