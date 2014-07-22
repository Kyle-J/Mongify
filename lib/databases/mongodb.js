var filesystem = require('fs');
var models = {};

var singleton = function singleton() {

    var mongoose = require("mongoose");
    var models_path = "";

    this.setup = function (model_path, database, username, password, obj) {

        models_path = model_path;

//        var connection_string = 'mongodb://'+username+':'+password+'@'+ obj.host+':'+obj.port +'/' + database +'?'+obj.options
//        mongoose.connect(connection_string);
//        mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
//        mongoose.connection.once('open', function connectionCallback(){
//
//            console.log('Mongify Connected to ' + obj.host + '/' + database)
//            this.connected = true;
//
//        })

        init();

    }

    this.model = function (name) {
        return models[name];
    }

    this.getAdapter = function () {
        return mongoose;
    }

    function init() {

        filesystem.readdirSync(models_path).forEach(function(name) {

            var object = require(models_path + "/" + name);

            var modelName = name.replace(/\.js$/i, "");

            models[modelName] = object;

        });

    }

    if(singleton.caller != singleton.getInstance) {
        throw new Error("This object cannot be instantiated like that.");
    }

}

singleton.instance = null;

singleton.getInstance = function() {

    if(this.instance === null) {
        this.instance = new singleton();
    }

    return this.instance;
}

module.exports = singleton.getInstance();