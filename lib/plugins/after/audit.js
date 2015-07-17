// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

'use strict';

var assert = require('assert-plus');
var bunyan = require('bunyan');

var getAuditPayload = require('./getAuditPayload');

///--- API

/**
 * Returns a Bunyan audit logger suitable to be used in a server.on('after')
 * event.  I.e.:
 *
 * server.on('after', restify.auditLogger({ log: myAuditStream }));
 *
 * This logs at the INFO level.
 *
 * @public
 * @function auditLogger
 * @param   {Object}   options at least a bunyan logger (log).
 * @returns {Function}         to be used in server.after.
 */
function auditLogger(options) {
    assert.object(options, 'options');
    assert.object(options.log, 'options.log');
    var errSerializer = bunyan.stdSerializers.err;

    if (options.log.serializers && options.log.serializers.err) {
        errSerializer = options.log.serializers.err;
    }

    var log = options.log.child({
        audit: true,
        serializers: {
            err: errSerializer
        }
    });

    function audit(req, res, route, err) {
        var auditPayload = getAuditPayload(req, res, err);
        log.info(auditPayload, 'handled: %d', res.statusCode);

        return true;
    }

    return audit;
}


///-- Exports

module.exports = auditLogger;
