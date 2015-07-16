'use strict';

/**
 * Simple calculator for moving averages
 * @returns {MovingAverage}
 */
var MovingAverage = function MovingAverage() {
    this.sum = 0;
    this.count = 0;
};

MovingAverage.prototype = {
    /**
     * @param {Number} value -
     * @returns {undefined}
     */
    add: function add(value) {
        this.sum += value;
        ++this.count;
    },

    /**
     * @param {Number} value -
     * @returns {undefined}
     */
    remove: function remove(value) {
        this.sum -= value;
        --this.count;
    },

    /**
     * This is so that moving averages can be properly
     * json.stringified.
     * @returns {Object}
     */
    toJSON: function toJSON() {
        return {
            sum: this.sum,
            count: this.count
        };
    }
};

module.exports = MovingAverage;
