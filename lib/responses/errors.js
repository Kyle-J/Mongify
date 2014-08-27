/**
 * Common Mongify error responses
 */
var Errors = function() { }

/**
 * Bad Request Response
 *
 * @param type
 * @param response
 */
Errors.prototype.badRequest = function(type, response) {

    var schema = require('../schemas/error'), http = require('./http')

    response.statusCode = http.BAD_REQUEST

    schema.status  = http.BAD_REQUEST

    schema.error    = "Bad request."
    schema.message  = "There was a problem accessing the item you requested. Please support if you require help with this issue."
    schema.developer_message = "The requested resource could not be retrieved due to a problem with the request."

    switch(type) {

        case 'InflectionSingular' :

            schema.developer_message =
                schema.developer_message +
                    "A singular resource was requested but no unique was identifier provided. " +
                    "For singular resource requests you must used the URL format /:resource/:identifer." +
                    "If you intended to access a resource set, use a pluralised word instead of a singular one."

            break

        case 'InflectionPlural' :

            schema.developer_message =
                schema.developer_message +
                    "A resource set was requested but a singular resource name was used. " +
                    "For resource set requests you must used the URL format /:resource and use a plural resource name"

            break
    }

    response.send(schema)

}

/**
 * Not Found Response
 *
 * @param type
 * @param response
 */
Errors.prototype.notFound = function (type, response) {

    var schema = require('../schemas/error')

    response.statusCode = http.NOT_FOUND

    schema.status = http.NOT_FOUND

    schema.message = "Resource Not Found"
    schema.developer_message = "No resource available at the specified URL. This is either due to an incorrect resource name in the request, or no records exist."

    switch (type) {

        case 'NoDefinition' :

            schema.developer_message = schema.developer_message + "There is NO resource definition (model) for the resource you requested in the database layer. "

            break

    }

    schema.user_message = "Ooops, We couldn't find the item you requested. Please support if you require help with this issue."

    response.send(schema)

}

module.exports = new Errors()