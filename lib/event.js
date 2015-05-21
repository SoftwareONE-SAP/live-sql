/**
 * LiveSQL - Event
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

/**
 * Export the Class
 */
exports = module.exports = Event;

/**
 * Small diffing util
 */
var diff = function(before, after) {
  var ret = {};
  for(var i in after) {
    if(!before.hasOwnProperty(i) || after[i] !== before[i]) {
      ret[i] = after[i];
    }
  }
  return ret;
};


/**
 * Event Class
 * @param {event} event ZongJi Event Object
 */
function Event(event) {

	/**
	 * Set the raw event to the scope
	 * @type {Object}
	 */
	this.__e = event;
}
/**
 * Table ID
 * @return {Number} Efected Ttable ID Number
 */
Event.prototype.tableId = function() {
	return this.__e.tableId;
};

/**
 * Table Name
 * @return {String} Effected Table Name
 */
Event.prototype.tableName = function() {
	return this.table().tableName;
};

/**
 * Schema Name
 * @return {String} Effected Schema Name
 */
Event.prototype.schema = function() {
	return this.__e.tableMap[this.tableId()].parentSchema;
};

/**
 * Table Object
 * @return {Object} Table Object
 */
Event.prototype.table = function() {
	return this.__e.tableMap[this.tableId()];
};

/**
 * Event Type
 * @return {String} Event Type
 */
Event.prototype.type = function() {
	return this.__e.getEventName().replace("rows", "");
};

/**
 * Effected Rows
 * @return {Array} Array containing effected rows
 */
Event.prototype.rows = function() {
	return 'rows' in this.__e ? this.__e.rows : []
};

/**
 * Effected Rows
 * @return {Number} Number of effected rows
 */
Event.prototype.effected = function() {
	return this.rows().length;
};

/**
 * Effected columns (only application with updaterows event)
 * @param  {Number} index Effected row index, defaults to 0
 * @return {Object}       Objected containing the changed values and keys
 *                        only for the columns effected
 */
Event.prototype.diff = function(index) {
	return diff(this.rows()[index || 0].before, this.rows()[index || 0].after);
};