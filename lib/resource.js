var Async   = require('async')

/*
 * // TODO: Build in syntax for ranges, OR and = to be accessed via query string
 * // TODO: https://github.com/CarltonSoftware/api-documentation/wiki/Performing-a-property-search
 */

/**
 *
 * @param model - Mongoose model. Dependency.
 * @constructor
 */
var Resource = function(model)
{

    // Check Model is not null and is at least a function (class).
    if(typeof model !== 'function') {

        // This shouldn't happen if everything is setup correctly. Log and dump out of execution.
        console.error(new Error("Resource objects depend on a valid Mongoose model object.").stack)
        process.exit(1);

    }

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
    "filter" : null,
    "filter_type" : 'OR',
    "sort"   : "created_on",
    "direction"  : "asc",
    "fields" : [ '*' ],
    "state"  : 1,
    "tenant_id" : 1

}

/**
 * Protected states cannot be overridden using query string params.
 * These can only be set programmatic. Use for auth related states.
 *
 * @type {string[]}
 */
Resource.prototype.protectedStates = [ "tenant_id" ]

/**
 * Allowed fields from schema. Add * to return all fields
 *
 * @type {string[]}
 */
Resource.prototype.allowedFields = [ '*' ]

/**
 * Model dependency
 *
 * @type {{}}
 */
Resource.prototype.model = {};

/**
 * Set State
 *
 * @param model
 * @param request
 * @param callback
 */
Resource.prototype.setState = function(request)
{

    Async.forEach(Object.keys(Resource.prototype.state), function (state, next) {

        // If the state is in the request use that, else fallback to model definition
        if(request.query[state]) {

            if(['filter', 'fields'].indexOf(state) != -1) {

                request.query[state] = request.query[state].split('|').filter(function(index) {
                    return Resource.prototype.protectedStates.indexOf(index) == -1
                })

            }

            Resource.prototype.state[state] = request.query[state]

        }
        next();

    }, function () {

        if(Resource.prototype.state.filter) {

            var parsed = {}
            Async.forEach(Object.keys(Resource.prototype.state.filter), function (filter, next) {

                var split = Resource.prototype.state.filter[filter].split(':')
                parsed[split[0]] = split[1]
                next()

            }, function () {

                Resource.prototype.state.filter = parsed

            })

        }

    });

}

/**
 * Get resource list
 *
 * @param callback
 */
Resource.prototype.getList = function(callback)
{

    /**
     * Get a new Mongoose query object
     */
    var query = Resource.prototype.model.find({})

    /**
     * Build the query and execute, callback with results
     */
    Resource.prototype.buildListQuery(query).exec(callback)

}


Resource.prototype.getItem = function(identifer, callback)
{

    /**
     * Get a new Mongoose query object
     */
    var query = Resource.prototype.model.find({})

    /**
     * Build the query and execute, callback with results
     */
    Resource.prototype.buildItemQuery(identifer, query).exec(callback)

}

Resource.prototype.getNext = function (identifer, callback) {

    Resource.prototype.model.find({ _id: { $gt: identifer }}).sort({ _id: 1 }).limit(1).exec(callback)

}

Resource.prototype.getPrevious = function (identifer, callback) {

    Resource.prototype.model.find({ _id: { $gt: identifer }}).sort({ _id: -1 }).limit(1).exec(callback)

}

Resource.prototype.insert = function (data, callback) {


    
}

/**
 * Build list database query form state
 *
 * @param query
 * @returns {*}
 */
Resource.prototype.buildListQuery = function(query)
{
    var select = []
    if(this.allowedFields.indexOf('*') !== -1) {
        select = this.state.fields != '*' ? this.state.fields.join(' ') : ' -tenant_id'
    }else{
        select = this.state.fields.filter(function(index) { return this.allowedFields.indexOf(index) != -1 }).join(' ')
    }

    var sort = {}
    sort[this.state.sort] = this.state.direction

    query.select(select)
    query.limit(this.state.limit).skip(this.state.offset)
    query.sort(sort)
    query.where(this.state.filter)
   // query.where('state', this.state.state)
    query.where('tenant_id', this.state.tenant_id)


    return query
}

/**
 * Build item database query form state
 *
 * @param query
 * @returns {*}
 */
Resource.prototype.buildItemQuery = function(identifer, query)
{
    query.where('_id', identifer)

    var select = []
    if(this.allowedFields.indexOf('*') !== -1) {
        select = this.state.fields != '*' ? this.state.fields.join(' ') : ' -tenant_id'
    }else{
        select = this.state.fields.filter(function(index) { return this.allowedFields.indexOf(index) != -1 }).join(' ')
    }

    query.select(select)
  //  query.where('state', this.state.state)
    query.where('tenant_id', this.state.tenant_id)

    return query

}

module.exports = Resource;