var Lingo = require('lingo') // TODO: Replace
var Async = require('async') // TODO: Replace with .when or Q (promises)
var ErrorReponse = require('./responses/errors')
var Http = require('./responses/http')

/**
 * Mongify constructor
 *
 * @param options
 * @constructor
 */
var Mongify = function (options) { }

/**
 * Mongify utility functions
 *
 * @type {exports}
 */
Mongify.prototype.utils = require('./utils')

/**
 * Version
 *
 * @type array
 */
Mongify.prototype.version = '0.0.0'

/**
 * Version
 *
 * @type array
 */
Mongify.prototype.apiVersion = '0.0.0'

/**
 * Available Mongify resources
 *
 * @type {Array}
 */
Mongify.prototype.resources = []

/**
 * Instance of Moongoose after attach() has run
 *
 * @type {{}}
 */
Mongify.prototype.database = {}

/**
 * Log requests toggle
 *
 * @type {boolean}
 */
Mongify.prototype.logRequests = true

/**
 * Protected fields
 *
 * @type {string[]}
 */
Mongify.prototype.protectedFields = [ 'tenant_id', 'created_on', 'created_by', 'modified_on', 'modified_by', 'deleted_on', 'deleted_by', '_id' ]

/**
 * Set the server version. API Version Control.
 * This will be used for Accept-version headers.
 * Use this to change the version for the routes
 * this instance creates in your assembly file.
 *
 * @param version
 */
Mongify.prototype.setApiVersion = function (version) {

    Mongify.prototype.apiVersion = version

}

/**
 * Attach the Mongify routes to a server - This is where Mongify starts
 *
 * @param server
 * @param database
 * @returns {*} Server object or false
 */
Mongify.prototype.attach = function (server, database) {

    Mongify.prototype.database = database;

    if (database.connection.readyState) {

        Mongify.prototype.attachResourceRoutes(server)

        return server

    } else {

        return false

    }
}

/**
 * Setup default Mongify BREAD routes
 *
 * @param server
 * @returns {boolean}
 */
Mongify.prototype.attachResourceRoutes = function (server) {

    server.get({  path: '/:resource/', version: Mongify.prototype.apiVersion}, Mongify.prototype.browse)
    server.get({  path: '/:resource/:identifier', version: Mongify.prototype.apiVersion}, Mongify.prototype.read)
    server.put({  path: '/:resource/:identifier', version: Mongify.prototype.apiVersion}, Mongify.prototype.edit)
    server.put({  path: '/:resource/:identifier/restore', version: Mongify.prototype.apiVersion}, Mongify.prototype.restore)
    server.post({ path: '/:resource/', version: Mongify.prototype.apiVersion}, Mongify.prototype.add)
    server.del({ path: '/:resource/:identifier', version: Mongify.prototype.apiVersion}, Mongify.prototype.delete)

    return true

}


// BREAD
// Browse Read Edit Add Delete


/**
 * Browse Resources
 *
 * @param request
 * @param response
 */
Mongify.prototype.browse = function (request, response) {

    var resource = Mongify.prototype.getResource(request.params.resource, 'plural', response)

    Async.series([
        function (callback) {

            resource.setState(request)
            callback()

        }, function () {

            // Get resource list
            resource.getList(function (error, results) {

                if (error) {

                    var schema = require('./schemas/error')

                    schema.message = error

                    response.send(schema);

                } else {

                    var schema = require('./schemas/browse')

                    Async.forEach(Object.keys(resource.state), function (param, next) {

                        response.header(param, resource.state[param])
                        schema[param] = resource.state[param]
                        next();

                    }, function () {

                        schema.count = results.length
                        schema.total = results.count
                        schema.items = results

                        response.send(schema)

                    });

                }
            })
        }
    ]);
}


/**
 * Read a Resource
 *
 * @param request
 * @param response
 * @param next
 */
Mongify.prototype.read = function (request, response) {

    var identifier = Mongify.prototype.database.Types.ObjectId(request.params.identifier)

    // TODO: Replace Lingo - No contributions for too long MAYBE USE MONGOOSE UTILS BUT NEED INJECTING PROPERLY

    // TODO: Check identifier

    var resource = Mongify.prototype.getResource(request.params.resource, 'singular', response)

    Async.waterfall([

        function (callback) {

            resource.setState(request)

            callback()

        },
        function () {

            resource.getItem(identifier, function (error, result) {


                if (error) {

                    var schema = require('./schemas/error')

                    schema.message = error

                    response.send(schema)

                } else {

                    var schema = require('./schemas/read')
                    var previous_item = {}
                    var next_item = {}

                    Async.series([

                        function (next) {

                            resource.getPrevious(identifier, function (error, result) {
                                previous_item = result
                                next()
                            })

                        }, function (next) {

                            resource.getNext(identifier, function (error, result) {
                                next_item = result
                                next()
                            })

                        }, function () {

                            schema.status = 200
                            schema.state = resource.state.state
                            schema.previous = previous_item[0]._id
                            schema.next = next_item[0]._id
                            schema.item = result[0]

                            response.send(schema)

                        }
                    ])
                }
            })
        }
    ])
}

/**
 * Edit Resource
 *
 * @param request
 * @param response
 */
Mongify.prototype.edit = function (request, response) {

    var identifier = Mongify.prototype.database.Types.ObjectId(request.params.identifier)

    var resource = Mongify.prototype.getResource(request.params.resource, 'singular', response)

    data = {}

    /**
     * Set document properties
     */
    Async.forEach(Object.keys(request.params), function (param, next) {

        if(Mongify.prototype.protectedFields.indexOf(param)  -1)
            data[param] = request.params[param];

        next()

    }, function () {

        /**
         * Setup document defaults
         */
        data['modified_on'] = new Date().toISOString()
        data['modified_by'] = 1 // TODO: Dynamic

        resource.updateItem(identifier, data, function (error, item) {

            if (error) {

                var schema = require('./schemas/error')

                schema.message = error

                response.send(schema)

            } else {

                var schema = require('./schemas/update')

                schema.item     = item

                response.send(schema)

            }
        })
    })

}

/**
 * Add Resource
 *
 * @param request
 * @param response
 */
Mongify.prototype.add = function (request, response) {

    var resource = Mongify.prototype.getResource(request.params.resource, 'singular', response)

    data = {}

    console.log(request.params)

    /**
     * Set document properties
     */
    Async.forEach(Object.keys(request.params), function (param, next) {

        if(Mongify.prototype.protectedFields.indexOf(param)  -1)
            data[param] = request.params[param];

        next()

    }, function () {

        /**
         * Setup document defaults
         */
        data['tenant_id']   = 1
        data['created_on']  = new Date().toISOString()
        data['deleted_on']  = 0
        data['deleted_by']  = 0
        data['created_by']  = 1
        data['modified_on'] = 0
        data['modified_by'] = 0
        data['enabled']     = 1

        resource.addItem(data, function (error, item) {

            if (error) {

                var schema = require('./schemas/error')

                schema.message = error

                response.send(schema);

            } else {

                var schema = require('./schemas/create')

                schema.item     = item

                response.send(schema)

            }
        })
    })

}

/**
 * Add Resource
 *
 * @param request
 * @param response
 */
Mongify.prototype.delete = function (request, response) {

    var identifier = Mongify.prototype.database.Types.ObjectId(request.params.identifier)

    var resource = Mongify.prototype.getResource(request.params.resource, 'singular', response)

    data = {}

    data['deleted_on']  = new Date().toISOString()
    data['deleted_by']  = 1 // TODO: Dynamic

    resource.updateItem(identifier, data, function (error, item) {

        if (error) {

            var schema = require('./schemas/error')

            schema.message = error

            response.send(schema);

        } else {

            var schema = require('./schemas/update')

            schema.item = item

            response.send(schema)

        }
    })

}

/**
 * Add Resource
 *
 * @param request
 * @param response
 */
Mongify.prototype.restore = function (request, response) {

    var identifier = Mongify.prototype.database.Types.ObjectId(request.params.identifier)

    var resource = Mongify.prototype.getResource(request.params.resource, 'singular', response)

    data = {}

    data['deleted_on']  = 0
    data['deleted_by']  = 0

    resource.updateItem(identifier, data, function (error, item) {

        if (error) {

            var schema = require('./schemas/error')

            schema.message = error

            response.send(schema);

        } else {

            var schema = require('./schemas/update')

            schema.item = item

            response.send(schema)

        }
    })

}

/**
 * Get Resource Object
 *
 * @param resource_name
 * @param response
 * @returns {Resource}
 */
Mongify.prototype.getResource = function (resource_name, inflection, response) {

    var english = Lingo.en, resource_name = resource_name.toLowerCase();

    /**
     * Check the resource name is plural
     */
    if (inflection == "plural" && !english.isPlural(resource_name)) {
        ErrorReponse.badRequest('InflectionPlural', response)
    }

    /**
     * Check the resource name is plural
     */
    if (inflection == "singular" && english.isPlural(resource_name)) {
        ErrorReponse.badRequest('InflectionSingular', response)
    }

    /**
     * Now ensure that the resource name is plural
     */
    if(!english.isPlural(resource_name)) resource_name = english.pluralize(resource_name)

    /**
     * Check the model definition exists
     */
    if (Mongify.prototype.database.modelNames().indexOf(resource_name) == -1) {
        ErrorReponse.notFound('NoDefinition', response)
    }

    /**
     * If checks pass, get model and fetch resources
     */
    var model = Mongify.prototype.database.model(resource_name)

    /**
     * Require a new instance of resource class.
     * Cached instances result in states persisting.
     */
    delete require.cache[require.resolve('./resource')]

    // TODO: Just get resource statically at the moment, change to dynamic later
    // TODO: There should be a factory or singleton constructor here which gets
    // TODO: overriden resource objects (if defined)

    var Resource = require('./resource')
    var resource = new Resource(model)

    return resource

}

module.exports = new Mongify()