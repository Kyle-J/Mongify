var Lingo = require('lingo')
var Async = require('async')

/**
 * Mongify constructor
 *
 * @param options
 * @constructor
 */
var Mongify = function (options) {
}

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
 * Register a resource with mongify
 *
 * @param name
 * @param resource
 */
Mongify.prototype.registerResource = function (name, resource) {

    this.resources.push(name, resource)

}

Mongify.prototype.addResource = function (request, response) {

    // TODO: Replace Lingo - No contributions for too long MAYBE USE MONGOOSE UTILS BUT NEED INJECTING PROPERLY

    var identifier = Mongify.prototype.database.Types.ObjectId(request.params.identifier)

    /**
     * Setup variables
     */
    var resource_name = request.params.resource.toLowerCase(), english = Lingo.en

    /**
     * Check the resource definition exists
     */
    if (Mongify.prototype.database.modelNames().indexOf(english.pluralize(resource_name)) == -1) {
        Mongify.prototype.notFound('NoDefinition', response)
        return
    }

    /**
     * If checks pass, get model and fetch resources
     */
    var model = Mongify.prototype.database.model(english.pluralize(resource_name))

    /**
     * Require a new instance of resource class.
     * Cached instances result in states persisting.
     */
    delete require.cache[require.resolve('./resource')]

    // TODO: Just get resource statically at the moment, change to dynamic later
    // TODO: There should be a factory or singleton constructor here which gets
    // TODO: overriden resource objects (if defined)
    // TODO: Implement get resource method?

    var Resource = require('./resource')
    var resource = new Resource(model)

    document = {}

    /**
     * Set document properties
     */
    Async.forEach(Object.keys(request.params), function (param, next) {

        document[param] = request.params[param];

        next()

    }, function () {

        /**
         * Setup document defaults
         */
        document['tenant_id']   = '1' //TODO: DYNAMIC!
        document['created_on']  = new Date().toISOString()
        document['created_by']  = 1 // TODO: Dynamic!
        document['modified_on'] = document['created_on']
        document['deleted_on']  = null
        document['enabled']     = 1

        resource.addItem(document, function (error, item) {

            if (error) {

                var schema = require('./schemas/error')

                schema.status = 500
                schema.message = error

                response.send(schema);

            } else {

                var schema = require('./schemas/create')

                schema.status   = 201
                schema.item     = item

                response.send(schema)

            }
        })
    })

}

/**
 * Fetch resources from database
 *
 * @param request
 * @param response
 */
Mongify.prototype.fetchResources = function (request, response) {

    // TODO: Replace Lingo - No contributions for too long

    /**
     * Setup variables
     */
    var resource_name = request.params.resource.toLowerCase(), english = Lingo.en

    /**
     * Check the resource name is plural
     */
    if (!english.isPlural(resource_name)) {
        Mongify.prototype.badRequest('InflectionPlural', response)
        return
    }

    /**
     * Check the resource definition exists
     */
    if (Mongify.prototype.database.modelNames().indexOf(resource_name) == -1) {
        Mongify.prototype.notFound('NoDefinition', response)
        return
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

    // TODO  ------------------------------------

    Async.series([
        function (callback) {

            resource.setState(request)
            callback()

        }, function () {

            // Get resource list
            resource.getList(function (error, results) {

                if (error) {

                    var schema = require('./schemas/error')

                    schema.status = 500
                    schema.message = error

                    response.send(schema);

                } else {

                    var schema = require('./schemas/browse')

                    Async.forEach(Object.keys(resource.state), function (param, next) {

                        response.header(param, resource.state[param])
                        schema[param] = resource.state[param]
                        next();

                    }, function () {

                        schema.status = 200
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
 * Get a resource
 *
 * @param request
 * @param response
 * @param next
 */
Mongify.prototype.fetchResource = function (request, response) {

    // TODO: Replace Lingo - No contributions for too long MAYBE USE MONGOOSE UTILS BUT NEED INJECTING PROPERLY

    var identifier = Mongify.prototype.database.Types.ObjectId(request.params.identifier)

    /**
     * Setup variables
     */
    var resource_name = request.params.resource.toLowerCase(), english = Lingo.en

    /**
     * Check the resource name is plural
     */
//    if(!english.isPlural(resource_name) && !) {
//        Mongify.prototype.badRequest('InflectionSingular', response)
//        return
//    }

    /**
     * Check the resource definition exists
     */
    if (Mongify.prototype.database.modelNames().indexOf(english.pluralize(resource_name)) == -1) {
        Mongify.prototype.notFound('NoDefinition', response)
        return
    }

    /**
     * If checks pass, get model and fetch resources
     */
    var model = Mongify.prototype.database.model(english.pluralize(resource_name))

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

    // TODO  ------------------------------------

    Async.series([

        function (callback) {

            resource.setState(request)

            callback()

        }, function () {

            resource.getItem(identifier, function (error, result) {


                if (error) {

                    var schema = require('./schemas/error')

                    schema.status = 500
                    schema.message = error

                    response.send(schema);

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
 * Setup default routes
 *
 * @param callback
 */
Mongify.prototype.attachResourceRoutes = function (server, callback) {

    // Otherwise fall back to standard database look ups

    server.get({ path: '/:resource/', version: Mongify.prototype.apiVersion}, Mongify.prototype.fetchResources)
    server.get({path: '/:resource/:identifier', version: Mongify.prototype.apiVersion}, Mongify.prototype.fetchResource)
    server.post({path: '/:resource/', version: Mongify.prototype.apiVersion}, Mongify.prototype.addResource)
    callback()

}

/**
 * Start the server
 */
Mongify.prototype.attach = function (server, database) {

    Mongify.prototype.database = database;

    if (database.connection.readyState) {
        Async.series([
            function (callback) {
                Mongify.prototype.attachResourceRoutes(server, callback)
            },
            function (callback) {
                callback()
            }
        ]);
    } else {
        return false
    }
}

// Error Responses - ** BORING STUFF ** // TODO: Move Responses into library.


/**
 * Note Found Response
 *
 * @param type
 * @param response
 */
Mongify.prototype.notFound = function (type, response) {

    var result = {}

    result.status = 404;
    result.error = "Bad request."
    result.devMessage = "No resource available at the specified URL. This is either due to an incorrect resource name in the request, or no records exist."

    switch (type) {

        case 'NoDefinition' :

            result.devMessage =
                result.devMessage + "There is NO resource definition (model) for the resource you requested in the database layer. "

    }

    result.userMessage = "Ooops, We couldn't find the item you requested. Please support if you require help with this issue."

    response.send(result)

}

module.exports = new Mongify()