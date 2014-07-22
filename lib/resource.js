var Async   = require('async')

var Resource = function(model)
{

    Resource.prototype.model = model;

}

/**
 * Default rest states
 *
 * Pass state into the Mongify constructor to override this
 *
 * @type {{limit: number, offset: number, search: null, search_type: string, sort: string, order: string, columns: string}}
 */
Resource.prototype.state = {

    "limit"  : 10,
    "offset" : 0,
    "search" : null,
    "search_type" : 'OR',
    "sort"   : "id",
    "order"  : "order",
    "columns" : "",
    "tenant_id" : 0

}

Resource.prototype.model = {};

/**
 * Set State
 *
 * @param model
 * @param request
 * @param callback
 */
Resource.prototype.setState = function(request, callback)
{

    Async.forEach(Object.keys(Resource.prototype.state), function (state, next) {

        // If the state is in the request use that, else fallback to model definition
        if(request.query.state) Resource.prototype.state[state] = request.query.state
        next();

    }, function () { callback() });

}


Resource.prototype.getList = function(callback)
{

    // TODO: Use state to build up query

    // Run DATABASE lookup here
    Resource.prototype.model.find({}).exec(callback)

}

module.exports = Resource;