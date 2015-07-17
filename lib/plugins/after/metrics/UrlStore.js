'use strict';

var MovingAverage = require('./MovingAverage');
var NAME = 'url';

/**
 * Will take in auditPayloads and convert them into
 * searchable by URL payloads.
 *
 * @public
 * @returns {UrlStore}
 */
function UrlStore() {
    this._store = {};
    this.name = NAME;
}

/**
 * pushes a new payload onto the url seachable
 * stack
 *
 * @param {Object} auditPayload -
 * @returns {undefined}
 */
UrlStore.prototype.push: function push(auditPayload) {
    var url = auditPayload.req.url;
    var statusCode = auditPayload.res.statusCode;
    var latency = auditPayload.latency;
    var store = this._store;
    var urlStore, statusCodes, latencies;

    // We will use an object to create an 'array' like store
    // so that as objects are removed the index stored will
    // remain the correct one.
    if (!store[url]) {
        store[url] = {
            statusCodes: {},
            latencies: new MovingAverage()
        };
    }
    urlStore = store[url];
    statusCodes = urlStore.statusCodes;
    latencies = urlStore.latencies;

    statusCodes[statusCode] = (statusCodes[statusCode] || 0) + 1;
    latencies.add(latency);
};

/**
 *  Removes the auditPayload from the store.
 *
 * @param {Object} auditPayload -
 * @returns {undefined}
 */
UrlStore.prototype.pop: function pop(auditPayload) {
    var url = auditPayload.req.url;
    var statusCode = auditPayload.res.statusCode;
    var latency = auditPayload.latency;
    var urlStore = this._store[url];
    --urlStore.statusCodes[statusCode];
    urlStore.latencies.remove(latency);
};

/**
 * Reports on metrics on a per url basis.
 *
 * @returns {Object} - An object that has all the calulated
 * state from the push and pop operations.
 */
UrlStore.prototype.report: function report() {
    return this._store;
};
