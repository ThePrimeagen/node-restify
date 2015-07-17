'use strict';

var requestSerializer = require('./../serializers/requestSerializer');
var responseSerializer = require('./../serializers/responseSerializer');

/**
 * Takes in a request and response and produces a payload of the req/res
 * pair.
 *
 * @param {Object} req -
 * @param {Object} res -
 * @param {Object} err -
 * @returns {Object} - The audit payload.
 * @private
 */
module.exports = function getAuditPayload(req, res, err) {

    // Short circuit case.
    if (req._auditLog) {
        return req._auditLog;
    }

    var latency = res.get('Response-Time');

    if (typeof (latency) !== 'number') {
        latency = Date.now() - req._time;
    }

    req._auditLog = {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        req_id: req.getId(),
        req: requestSerializer(req),
        res: responseSerializer(res),
        err: err,
        latency: latency,
        secure: req.secure,
        _audit: true
    };
    return req._auditLog;
};
