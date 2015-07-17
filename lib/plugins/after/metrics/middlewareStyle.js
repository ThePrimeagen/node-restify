'use strict';

var assert = require('assert-plus');

var getAuditPayload = require('./../getAuditPayload');

var UrlStore = require('./UrlStore');
var TimerStore = require('./TimerStore');
var StatusCodeStore = require('./StatusCodeStore');

var DEFAULT_MAX_REQUESTS = 1000;

///--- API

/**
 * The HttpMetrics should be added as an 'after' event on the server.
 * After each event the metrics will store that event and kick out
 * any old requests.  Metrics will be delivered on an interval of
 * options.rate (ms, defaults to 1000).
 *
 * @public
 * @function httpMetrics
 * @param {Object} options -
 * @param {Object} options.server -
 * @param {Array.<Store>} [options.stores] -
 * @param {Number} [options.limit=1000] -
 * @param {Number} [options.rate=1000] - How often the server should emit a
 * httpMetrics event.  Value is in milliseconds
 * @param {Number} [options.port=8080] - Used in the output server for
 * what port to listen on.
 * @param {Boolean} [options.emitEvents=true] - If an output/debug
 * server should be created.
 * @returns {HttpMetrics} -
 */
var HttpMetrics = function HttpMetrics(options) {
    assert.object(options, 'options');
    assert.object(options.server, 'options.server');
    assert.optionalNumber(options.limit, 'options.limit');
    assert.optionalNumber(options.rate, 'options.rate');
    assert.optionalArray(options.stores, 'options.stores');
    assert.optionalBoolean(options.emitEvents, 'options.emitEvents');

    // We do not concern ourselves about 0 (falsy) since that is
    // truly an silly amount of stored requests.
    if (!options.limit) {
        options.limit = DEFAULT_MAX_REQUESTS;
    }

    // The stores for the metrics.
    var stores = options.stores || [
        new UrlStore(),
        new TimerStore(),
        new StatusCodeStore()
    ];

    var storedIdx = -1;
    var limit = options.limit;
    var storedPayloads = [];
    var server = this.server = options.server;
    var rate = options.rate || 1000;
    var emit = options.emitEvents === undefined && true || options.emitEvents;

    function report() {
        return stores
            .map(function (store) {
                return store.report();
            })
            .reduce(function (acc, data) {
                acc[data.name] = data;
                return acc;
            }, {});
    }

    if (emit) {
        var id = setInterval(function () {
            server.emit('httpMetrics', report);
        }, rate);

        server.on('close', clearInterval.bind(null, id));
    }

    return function innerHttpMetrics(req, res, route, err) {
        var auditPayload = getAuditPayload(req, res, err);

        // Identifies the payload and stores the payload in both the
        // in the local payload store and each one of the seachable
        // stores.
        var idx = ++storedIdx % limit;
        var removed = storedPayloads[idx];
        storedPayloads[idx] = auditPayload;
        stores.forEach(function (store) {
            store.push(auditPayload);
        });

        // If removed, then all stores need to pop.
        if (removed !== undefined) {
            for (var i = 0; i < stores.length; i++) {
                stores[i].pop(removed);
            }
        }

        return true;
    };
};


///-- Exports

module.exports = HttpMetrics;