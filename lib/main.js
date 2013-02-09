// Copyright (C) 2013 CrowdStrike, Inc.
// This file is subject to the terms and conditions of the GNU General Public
// License version 2.  See the file COPYING in the main directory for more
// details.

var AWS = require('aws-sdk')

function s3bucket(keyid, secret, bucketName) {
    this.config = new AWS.Config({
	accessKeyId: keyid,
	secretAccessKey: secret,
	sslEnabled: true
    });
    this.s3 = new AWS.S3();

    this.put = function(name, buffer) {
	this.s3.client.putObject({
	    Bucket: bucketName,
	    Key: name,
	    Body: buffer,
	    ContentType: 'text/plain'
	}, function(err, data) {
	    if(err) {
		console.log("Error storing data in bucket\n");
	    }
	});
    }
}

function s3log(keyid, secret, bucketName, filePrefix) {
    this.buffer = '';
    this.buflen = 0;
    this.maxsize = 100;

    this.bucket = new s3bucket(keyid, secret, bucketName);
    this.writecb = function(buffer) {
	var name = filePrefix + (new Date()).toISOString();
	this.bucket.put(name, buffer);
    };

    this.setMaxtime = function(delaySec) {
	this.maxtime = delaySec;
	if(this.timer) {
	    clearTimeout(this.timer);
	}
	this.timer = setTimeout(this.flush, 1000 * this.maxtime);
    };

    this.setMax = function(maxsize, maxtime) {
	this.maxsize = maxsize;
	this.setMaxtime(maxtime);
    }
    
    this.emit = function(str) {
	this.buffer += str + '\n';
	this.buflen += str.length + 1;
	if(this.buflen > this.maxsize) {
	    this.flush();
	}
    };

    // Flush the memory buffer to S3 and return the number of bytes written into
    // the new S3 object.
    this.flush_unbound = function() {
	var len = this.buflen;
	this.writecb(this.buffer);
	this.buffer = '';
	this.buflen = 0;
	this.setMaxtime(this.maxtime);
	return len;
    };

    // Bind flush to this object so we can use it from a timer
    this.flush = (function(obj, method) {
	return function() {
	    return method.apply(obj, arguments);
	}
    })(this, this.flush_unbound);

    this.setMaxtime(3600); // 1 hour
}

module.exports = s3log;
