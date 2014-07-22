var Filesystem = require('fs')

/**
 * Contains utility functions and loaders for setting
 * up the Mongify service.
 *
 * @constructor
 */

var Utils = function() {}

/**
 * Mongify automatic model loader.
 *
 * Reads schemas from file system and builds models to moongoose
 * instance from mongoose schemas.
 *
 * @param mongoose - Mongoose instance
 * @param schemas_path - Path to mode schemas directory
 */
Utils.prototype.modelLoader = function(mongoose, schemas_path) {

    Filesystem.readdirSync(schemas_path).forEach(function(file_name) {

        var schema_object = require(schemas_path + "/" + file_name)

        var model_name = file_name.replace(/\.js$/i, "")

        mongoose.model(model_name, schema_object)

    });

}

/**
 * Mongify automatic resource loader.
 *
 * Gets resource definitions from file system and registered them
 * with mongify.
 *
 * @param mongify - Mongify instance
 * @param resource_path - Path to resource definitions directory
 */
Utils.prototype.resourceLoader = function(mongify, resource_path) {

    Filesystem.readdirSync(resource_path).forEach(function(file_name) {

        var resource_object = require(resource_path + "/" + file_name)

        var resource_name = file_name.replace(/\.js$/i, "")

        mongify.registerResource(resource_name, resource_object)

    });

}

module.exports = new Utils();
