'use strict';

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
    var latency = res.get('Response-Time');

    if (typeof (latency) !== 'number') {
        latency = Date.now() - req._time;
    }

    return {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        req_id: req.getId(),
        req: req,
        res: res,
        err: err,
        latency: latency,
        secure: req.secure,
        _audit: true
    };
};
