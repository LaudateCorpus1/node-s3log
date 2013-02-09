// Copyright (C) 2013 CrowdStrike, Inc.
// This file is subject to the terms and conditions of the GNU General Public
// License version 2.  See the file COPYING in the main directory for more
// details.

var s3log = require('../lib/main');
var util = require('util');

var keyid = process.env.AWS_ACCESS_KEY_ID;
var secret = process.env.AWS_SECRET_ACCESS_KEY;
var bucket = 'cs-toolapi-logs';

var log = new s3log(keyid, secret, bucket, 'example_');
log.setMax(20, 10); // 20 bytes or 10 seconds

function ntimes(times, cb) {
    for(var i = 0; i < times; i++) {
	cb();
    }
}

// Use this to see what would normally be written to S3
// log.writecb = function(str) { console.log('Writing [' + JSON.stringify(str) + ']'); };

function lastFlush() {
    console.log('Flushing before exit\n');
    var len = log.flush();
    console.log('Flushed ' + len + ' bytes, waiting before exiting.\n');
    // This should be done cleaner
    setTimeout(process.exit, 5000);
}

process.on('SIGINT', lastFlush);
process.on('SIGTERM', lastFlush);

console.log('Press CTRL-C to interrupt\n');

// log 5 bytes (with newline) 11 times
console.log('1st batch');
ntimes(11, function() { log.emit('1234'); });

// wait 15 seconds
setTimeout(function() {
    // then log another 5 bytes 11 times
    console.log('2nd batch');
    ntimes(11, function() { log.emit('1234'); });
}, 15000);
