node-s3log
==========

Node-s3log is a small module that allows logging into a memory buffer,
which is periodically pushed into Amazon S3.

Usage
-----
Create a new log object with your Amazon credentials, a bucket name, and
a prefix for the log file objects to be stored in that bucket:

    var log = new s3log(keyid, secret, bucket, 'example_');

You can set the maximum number of bytes and the maximum time using the
`setMax()` method:
    
    log.setMax(10e6, 3600); // 10 MB or 1 hour (3600 seconds)

Then you can log data using `log.emit(string)`. If the memory buffer exceeds
10 MB or after every hour, the data will be pushed into the specified S3
bucket. The objects are named by concatenating the specified prefix
('example_' in the example above) and a timestamp.

Caveats
-------
The main intend of the module is to facilitate easier handling of bulky
logs from PaaS solutions. Note that writes to S3 may fail or not complete
before your program exits. This is acceptable in our application but may
not be in yours.

License
-------
The code is licensed under the General Public License Version 2, see the
COPYING file for details.
