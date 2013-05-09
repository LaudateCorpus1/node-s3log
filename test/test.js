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
    describe('#emit (with shared s3log)', function() {
    	var log = null;

    	before(function(){
    		var keyid = process.env.AWS_ACCESS_KEY_ID;
			var secret = process.env.AWS_SECRET_ACCESS_KEY;
			var bucket = 'nodes3-log-test-' + Math.random().toString(36).substr(2,16);

			log = new s3log(keyid, secret, bucket, 'test_');
  		});
        it('mitigates log injections', function() {
	        log.emit('first');
	        log.emit('\n');
	        log.emit('second');
	        log.emit('\r');
	        log.emit('more malformed\r\ndata');
	        log.buffer.should.not.equal('first\n\n\nsecond\n\r\nmore malformed\r\ndata\n');
	        log.buffer.should.equal('first\n \nsecond\n \nmore malformed data\n');
	        log.flush();
        });
        it('handles numbers', function() {
	        log.emit(132);
	        log.emit('some string');
	        log.emit(17.34);
	        log.buffer.should.equal('132\nsome string\n17.34\n');
	        log.flush();
        });
        it('handles nulls', function() {
	        log.emit('null data 1');
	        log.emit(null);
	        log.emit('null data 2');
	        log.buffer.should.equal('null data 1\nnull data 2\n');
	        log.flush();
        });
        it('handles undefined', function() {
	        log.emit('undef data 1');
	        log.emit(undefined);
	        log.emit('undef data 2');
	        log.buffer.should.equal('undef data 1\nundef data 2\n');
	        log.flush();
        });
        it('handles objects', function() {
	        log.emit('string data 1');
	        var o = {field1: 'one', field2: 2};
	        log.emit(o);
	        log.emit('string data 2');
	        log.buffer.should.equal('string data 1\n{"field1":"one","field2":2}\nstring data 2\n');
	        log.flush();
        });  
        it('handles objects with circular references', function() {
	        log.emit('string data 1');
	        var o = {field1: 'one', field2: 2};
	        o.me = o;
	        log.emit(o);
	        log.emit('string data 2');
	        log.buffer.should.equal('string data 1\n[object Object]\nstring data 2\n');
	        log.flush();
        });
        it('handles arrays', function() {
	        log.emit('string data 1');
	        log.emit([7,2,'three']);
	        log.emit('string data 2');
	        log.buffer.should.equal('string data 1\n[7,2,"three"]\nstring data 2\n');
	        log.flush();
        });
        it('handles String objects', function() {
	        log.emit('string data 1');
	        log.emit(String('string object data'));
	        log.emit('string data 2');
	        log.buffer.should.equal('string data 1\nstring object data\nstring data 2\n');
	        log.flush();
        });          
    });
});
