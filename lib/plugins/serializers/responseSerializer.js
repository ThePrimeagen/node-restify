'use strict';

var assert = require('assert-plus');

var HttpError = require('../../errors').HttpError;

/**
 * The response serializer will take in a response and produce an output
 * that is easily consumed by some of the post processing plugins.
 *
 * @param {Object} options -
 * @param {Boolean} options.body - If the body should be added to the response.
 * @returns {Function}
 * @private
 */
module.exports = function responseSerializer(options) {
    assert.optionalObject(options, 'options');

    return function innerResponseSerializer(res) {

        if (!res) {
            return false;
        }

        var body;

        if (options.body === true) {
            if (res._body instanceof HttpError) {
                body = res._body.body;
            } else {
                body = res._body;
            }
        }

        return {
            statusCode: res.statusCode,
            headers: res._headers,
            trailer: res._trailer || false,
            body: body
        };
    };
};
