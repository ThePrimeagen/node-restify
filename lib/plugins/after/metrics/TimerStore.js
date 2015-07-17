'use strict';

var MovingAverage = require('./MovingAverage');
var NAME = 'timers';

/**
 * Will take in auditPayloads and store them according
 * to the timer name.
 *
 * @public
 * @returns {TimerStore}
 */
function TimerStore() {
    this._store = {};
    this.name = NAME;
}

/**
 * Push the auditPayload with the timers information
 * @param {Object} auditPayload -
 * @returns {undefined}
 */
TimerStore.prototype.push = function push(auditPayload) {
    var timers = auditPayload.req.timers;
    var store = this._store;

    Object.
        keys(timers).
        forEach(function (timerKey) {
            var time = timers[timerKey];

            if (!store[timerKey]) {
                store[timerKey] = new MovingAverage();
            }
            store[timerKey].add(time);
        });
};

/**
 *  Removes the auditPayload from the store.
 * @param {Object} auditPayload -
 * @returns {undefined}
 */
TimerStore.prototype.pop = function pop(auditPayload) {
    var timers = auditPayload.req.timers;
    var store = this._store;

    Object
        .keys(timers)
        .forEach(function (timerKey) {
            var time = timers[timerKey];
            store[timerKey].remove(time);
        });
};

/**
 * Reports on metrics on a per timer name basis.
 * @returns {Object}
 */
TimerStore.prototype.report = function report() {
    return this._store;
};
