var assert = require('assert');
var levelup = require('level');
var os = require('os');
var async = require('async');


var db = levelup(os.tmpDir() + '/memoir-test', {
	valueEncoding: 'json'
});


module.exports = function(done) {
	var media = require('../lib/media');

	async.waterfall([
		async.apply(media.add, db, 1377202450431, 1377202459431, '/some/file.mp3'),
		function(cb) {

			// check in range works
			var count = 0;
			media.starts_between(db, 1377202450430, 1377202450435)
				.on('data', function(d){ count++; })
				.on('end', function(){
					if (count == 0) return cb('in range failed: no results');
					cb();
				});				
		},
		function(cb) {

			// check out of range works, no results
			var count = 0;				
			media.starts_between(db, 1377202450429, 1377202450430)
			.on('data', function(d){ count++; })
			.on('end', function(){
				if (count > 0) return cb('out of range failed. ' + count + ' results returned');
				cb();
			});	
		}
	], function(err){
		assert.ifError(err);
		done();
	})	
}