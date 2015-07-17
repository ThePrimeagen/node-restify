'use strict';

var MovingAverage = require('./MovingAverage');
var NAME = 'statusCodes';

/**
 * Will take in auditPayloads and store them according
 * to the statusCode.
 *
 * @public
 * @returns {StatusCodeStore}
 */
function StatusCodeStore() {
    this._store = {};
    this.name = NAME;
}

/**
 * Push the auditPayload with the http status code information
 * @param {Object} auditPayload -
 * @returns {undefined}
 */
StatusCodeStore.prototype.push = function push(auditPayload) {
    var statusCode = auditPayload.res.statusCode;
    var latency = auditPayload.latency;
    var store = this._store;

    if (!store[statusCode]) {
        store[statusCode] = new MovingAverage();
    }
    store[statusCode].add(latency);
};

/**
 *  Removes the auditPayload from the store.
 * @param {Object} auditPayload -
 * @returns {undefined}
 */
StatusCodeStore.prototype.pop = function pop(auditPayload) {
    var statusCode = auditPayload.res.statusCode;
    var latency = auditPayload.latency;

    this._store[statusCode].remove(latency);
};

/**
 * Reports on metrics on a per status code basis.
 * @returns {Object}
 */
StatusCodeStore.prototype.report = function report() {
    return this._store;
};
