/**
 * Common rest responses.
 */
var Errors = function() { }


/**
 * Bad Request Response
 *
 * @param type
 * @param response
 */
Errors.prototype.badRequest = function(developer_message)
{

    var schema = require('./schemas/error'), http = require('./http')

    schema.status  = http.BAD_REQUEST

    schema.error    = "Bad request."
    schema.message =  "There was a problem accessing the item you requested. Please support if you require help with this issue."
    schema.developer_message = developer_message ? developer_message : "The requested resource could not be retrieved due to a problem with the request."

    return schema

  //  response.send(schema)

}


/**
 * Bad Request Response
 *
 * @param type
 * @param response
 */
Common.prototype.badRequest = function(type, response) {


    var schema = require('./schemas/error'), http = require('./http')

    schema.status  = http.BAD_REQUEST

    schema.error    = "Bad request."
    schema.message =  "There was a problem accessing the item you requested. Please support if you require help with this issue."
    schema.developer_message = "The requested resource could not be retrieved due to a problem with the request."

    switch(type) {

        case 'InflectionSingular' :

            schema.devMessage =
                schema.devMessage +
                    "A singular resource was requested but no unique was identifier provided. " +
                    "For singular resource requests you must used the URL format /:resource/:identifer." +
                    "If you intended to access a resource set, use a pluralised word instead of a singular one."
            break

        case 'InflectionPlural' :

            schema.devMessage =
                schema.devMessage +
                    "A resource set was requested but a singular resource name was used. " +
                    "For resource set requests you must used the URL format /:resource and use a plural resource name"
            break
    }

    response.send(schema)

}

