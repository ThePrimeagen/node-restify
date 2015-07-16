'use strict';

var assert = require('assert-plus');

/**
 * The request serializer will take in a request and produce an output
 * that is easily consumed by some of the post processing plugins.
 *
 * @param {Object} options -
 * @param {Boolean} options.body - If the body should be added to the request.
 * @returns {Function}
 * @private
 */
module.exports = function requestSerializer(options) {
    assert.optionalObject(options, 'options');

    return function innerRequestSerializer(req) {

        if (!req) {
            return false;
        }

        var timers = (req.timers || []);
        var timerMap = timers.reduce(function (acc, time) {
            var t = time.time;
            var _t = Math.floor((1000000 * t[0]) +
                (t[1] / 1000));
            acc[time.name] = _t;

            return acc;
        }, {});
        var query = typeof req.query === 'function' ? req.query() : req.query;
        var body = options.body === true ? req.body : undefined;

        return {
            // account for native and queryParser plugin usage
            query: query,
            method: req.method,
            url: req.url,
            headers: req.headers,
            httpVersion: req.httpVersion,
            trailers: req.trailers,
            version: req.version(),
            body: body,
            timers: timerMap
        };
    };
};
