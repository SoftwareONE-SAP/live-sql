/**
 * LiveSQL
 *
 * @description A node based binlog monitor that emits
 *              events when changes occure on
 *              tracked tables.
 *
 * @author Robert Pitt <rpitt@centiq.co.uk>
 * @copyright 2015 Centiq LTD
 * @license MIT
 */

/**
 * Require dependancies
 */
var ZongJi          = require("zongji"),
    _               = require("underscore"),
    Event           = require('./event.js');
    EventEmitter    = require("eventemitter2").EventEmitter2
    util            = require("util")

/**
 * Export the module
 * @type {LiveSQL}
 */
exports = module.exports = LiveSQL;

/**
 * @class MySQL Subscription LiveSQL
 * @param {Object} options MySQL Connection Options
 * @extends {EventEmitter2}
 */
function LiveSQL(connOptions, ZongJiOptions) {
    /**
     * Call the parant constructor
     */
    EventEmitter.call(this, {wildcard: true});

    /**
     * Options object for ZongJi
     * @type {Object}
     */
    this._z_opts = _.extend({
        /**
         * Start at the end of the binlog
         * @type {Boolean}
         */
        startAtEnd : true,

        /**
         * Schema we are monitoring
         * @type {Object}
         */
        includeSchema: {},

        /**
         * Schema we are monitoring
         * @type {Object}
         */
        excludeSchema: {},

        /**
         * Events to track
         * @type {Array}
         */
        includeEvents: [
            "tablemap",
            "writerows",
            "updaterows",
            "deleterows"
        ]
    }, ZongJiOptions || {});

    /**
     * Create a new ZongJi Instance
     * @type {ZongJi}
     */
    this._z = new ZongJi(connOptions);

    /**
     * Monitor all binlog events
     */
    this._z.on("binlog", this._onBinLogEvent.bind(this));
};
util.inherits(LiveSQL, EventEmitter);

/**
 * Fetch the connection for the mysql server
 * @return {Connection} Connection to MySQL.
 */
LiveSQL.prototype.connection = function() {
    return this._z.connection;
};

/**
 * Subscribe to a schema / table
 * @param  {String} database   Database
 * @param  {Array} opt_tables Optional tables to watch (Defaults to all)
 *
 * @todo Implement tables
 * @return void
 */
LiveSQL.prototype.subscribe = function(database, opt_tables) {
    if(!_.isArray(opt_tables)) {
        opt_tables = true;
    };

    this._z_opts.includeSchema[database] = opt_tables;
};

/**
 * Unsubscribe from a database
 * @param  {String} database   Database
 * @param  {Array} opt_tables Optional tables to watch (Defaults to all)
 *
 * @todo Implement tables
 * @return void
 */
LiveSQL.prototype.unsubscribe = function(database) {
    if(database in this._z_opts.includeSchema){
        delete this._z_opts.includeSchema[database];
    }
};

/**
 * Binlog event handler
 * @param  {Event} event Event from ZongJi
 * @return void
 */
LiveSQL.prototype._onBinLogEvent = function(event) {

    /**
     * Create a new event object
     */
    var _event = new Event(event);

    /**
     * Declare the root namespace
     */
    var RNS = [_event.schema(), _event.table(), _event.type()];

    /**
     * Publish the event
     */
    this.emit(RNS, _event);
};

/**
 * Start monitoring
 */
LiveSQL.prototype.start = function() {
    return this._z.start(this._z_opts);
};

/**
 * Stop monitoring
 */
LiveSQL.prototype.stop = function() {
    return this._z.stop();
};
