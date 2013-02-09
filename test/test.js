// Copyright (C) 2013 CrowdStrike, Inc.
// This file is subject to the terms and conditions of the GNU General Public
// License version 2.  See the file COPYING in the main directory for more
// details.

var should = require('should');
var s3log = require('../lib/main');
var util = require('util');

describe('s3log', function() {
    describe('#emit', function() {
        it('concatenates logs', function() {
	    var log = new s3log();
	    log.emit('foo');
	    log.emit('bar');
	    log.buffer.should.not.equal('bar\n');
	    log.buffer.should.equal('foo\nbar\n');
        });
	it('writes when over size limit', function() {
	    var log = new s3log();
	    var has_written = false;

	    log.maxsize = 10;
	    log.writecb = function() {
		has_written = true;
	    }
	    log.emit('1234');
	    has_written.should.equal(false);
	    log.buflen.should.equal(5);

	    log.emit('67890123');
	    has_written.should.equal(true);
	});
    });
});
