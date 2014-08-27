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

module.exports = new Utils();
