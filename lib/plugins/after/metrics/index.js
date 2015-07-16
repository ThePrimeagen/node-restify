// jscs:disable disallowOperatorBeforeLineBreak

'use strict';

var assert = require('assert-plus');

var getAuditPayload = require('./../getAuditPayload');
var requestSerializer = require('./../../serializers/requestSerializer');
var responseSerializer = require('./../../serializers/responseSerializer');

var UrlStore = require('./UrlStore');
var TimerStore = require('./TimerStore');
var StatusCodeStore = require('./StatusCodeStore');

var DEFAULT_MAX_REQUESTS = 1000;

///--- API

/**
 * The HTTPMetrics capturer.  The options passed in requires the
 * server to attach to.
 *
 * @public
 * @function httpMetrics
 * @param {Object} options -
 * @param {Object} options.server -
 * @param {Array.<Store>} [options.stores] -
 * @param {Number} [options.limit=1000] -
 * @returns {Function} - to be used in server.after.
 */
var HttpMetrics = function HttpMetrics(options) {
    assert.object(options, 'options');
    assert.object(options.server, 'options.server');
    assert.optionalNumber(options.maxStoredRequests, 'options.limit');
    assert.optionalArray(options.stores, 'options.stores');

    // We do not concern ourselves about 0 (falsy) since that is
    // truly an silly amount of stored requests.
    if (!options.limit) {
        options.limit = DEFAULT_MAX_REQUESTS;
    }

    // The stores for the metrics.
    this._stores = options.stores || [
        new UrlStore(),
        new TimerStore(),
        new StatusCodeStore()
    ];

    this._storedIdx = -1;
    this._limit = options.limit;
    this._storedPayloads = [];
};

HttpMetrics.prototype = {
    /**
     * This is the piece of middleware that should be used
     * on 'after' events to post process data about the http metrics.
     * @param {Object} req -
     * @param {Object} res -
     * @param {Object} route -
     * @param {Object} err -
     * @returns {Boolean}
     * @private
     */
    _after: function httpMetricsAfter(req, res, route, err) {
        var auditPayload = getAuditPayload(
            requestSerializer(req),
            responseSerializer(res), err);
        var storedIdx = this._storedIdx;
        var limit = this._limit;
        var storedPayloads = this._storedPayloads;
        var stores = this._stores;

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
    },

    /**
     * Performs a simple merge where all the keys from the
     * @returns {Object}
     */
    report: function report() {
        return this._stores.
            map(function (store) {
                return store.report();
            }).
            reduce(function (acc, data) {
                acc[data.name] = data;
                return acc;
            }, {});
    }
};


///-- Exports

module.exports = HttpMetrics;
