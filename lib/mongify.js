var Lingo   = require('lingo')
var Async   = require('async')

/**
 * Mongify constructor
 *
 * @param options
 * @constructor
 */
var Mongify = function () { }

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
Mongify.prototype.version = 0.1;

/**
 * Available Mongify resources
 *
 * @type {Array}
 */
Mongify.prototype.resources = [];

/**
 * Instance of Moongoose after attach() has run
 */
Mongify.prototype.database = {};

/**
 * Register a resource with mongify
 *
 * @param name
 * @param resource
 */
Mongify.prototype.registerResource = function(name, resource) {
    this.resources.push(name, resource)
}

/**
 * Fetch resources from database
 *
 * @param request
 * @param response
 */
Mongify.prototype.fetchResources = function(request, response)
{
    // TODO: Replace Lingo - No contributions for too long

    /**
     * Setup variables
     */
    var resource_name = request.params.resource.toLowerCase(), english = Lingo.en

    /**
     * Check the resource name is plural
     */
    if(!english.isPlural(resource_name)) {
        Mongify.prototype.badRequest('InflectionPlural', response)
        return
    }

    /**
     * Check the resource definition exists
     */
    if(Mongify.prototype.database.modelNames().indexOf(resource_name) == -1) {
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
        function(callback) {

            // Setup the resource state
            resource.setState(request, callback)
            callback()

        },
        function(callback) {

            // Get resource list
            resource.getList(function(err, results){

                console.log(results)

                if (err) {

                    response.send(err);

                }else {

                    var payload = {};

                    Async.forEach(Object.keys(resource.state), function (param, next) {

                        response.header(param, resource.state[param])
                        payload[param] = resource.state[param]
                        next();

                    }, function () {

                        payload.count = results.length
                        payload.total = results.count
                        payload[resource_name] = results

                        response.send(payload)

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
Mongify.prototype.fetchResource = function(request, response) {

    // TODO: Replace Lingo - No contributions for too long

    var identifer     = Mongify.prototype.database.Types.ObjectId(request.params.identifer)

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
    if(Mongify.prototype.database.modelNames().indexOf(english.pluralize(resource_name)) == -1) {
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
    // Get resource list
    resource.getItem(identifer, function(err, results){

        if (err) {

            response.send(err);

        }else {

            var payload = {};

            Async.forEach(Object.keys(resource.state), function (param, next) {

                response.header(param, resource.state[param])
                payload[param] = resource.state[param]
                next();

            }, function () {

                payload[resource_name] = results

                response.send(payload)

            });
        }
    })
}

/**
 * Setup default routes
 *
 * @param callback
 */
Mongify.prototype.attachResourceRoutes = function(server, callback) {

    // Otherwise fall back to standard database lookups
    server.get('/:resource/',           Mongify.prototype.fetchResources)
    server.get('/:resource/:identifer', Mongify.prototype.fetchResource)
    callback()

}

/**
 * Start the server
 */
Mongify.prototype.attach = function(server, database) {

    Mongify.prototype.database = database;

    if(database.connection.readyState) {
        Async.series([
            function(callback) {
                Mongify.prototype.attachResourceRoutes(server, callback)
            },
            function(callback) {
                callback()
            }
        ]);
    }else{
        return false
    }
}

// Error Responses - ** BORING STUFF ** // TODO: Move Responses into library.
/**
 * Bad Request Response
 *
 * @param type
 * @param response
 */
Mongify.prototype.badRequest = function(type, response) {

    var result = {}

    result.status = 400;
    result.error = "Bad request."
    result.devMessage = "The requested resource could not be retrieved due to a problem with the request."

    switch(type) {

        case 'InflectionSingular' :

            result.devMessage =
                result.devMessage +
                "A singular resource was requested but no unique was identifier provided. " +
                "For singular resource requests you must used the URL format /:resource/:identifer." +
                "If you intended to access a resource set, use a pluralised word instead of a singular one."
                break

        case 'InflectionPlural' :

            result.devMessage =
                result.devMessage +
                "A resource set was requested but a singular resource name was used. " +
                "For resource set requests you must used the URL format /:resource and use a plural resource name"
            break
    }

    result.userMessage =  "There was a problem accessing the item you requested. Please support if you require help with this issue."

    response.send(result)

}

/**
 * Note Found Response
 *
 * @param type
 * @param response
 */
Mongify.prototype.notFound = function(type, response) {

    var result = {}

    result.status = 404;
    result.error = "Bad request."
    result.devMessage = "No resource available at the specified URL. This is either due to an incorrect resource name in the request, or no records exist."

    switch(type) {

        case 'NoDefinition' :

            result.devMessage =
                result.devMessage +  "There is NO resource definition (model) for the resource you requested in the database layer. "

    }

    result.userMessage =  "Ooops, We couldn't find the item you requested. Please support if you require help with this issue."

    response.send(result)

}

module.exports = new Mongify()