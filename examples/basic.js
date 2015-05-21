/**
 * Require the LiveSQL Manager
 */
var LiveSQL = require("../index.js");

/**
 * Create a new isntance
 */
var manager = new LiveSQL({
    "host": "localhost",
    "user": "livesql",
    "password": "livesql"
});

/**
 * Subscribe to a database
 */
manager.subscribe("platform");


/**
 * Monitor everything
 *
 * Event name structure is as follows
 * <schema>.<table>.<type>
 *
 * Where type can be one of either
 * - tablemap
 * - insertrows
 * - updaterows
 * - deleterows
 *
 * Note: You cannot wildcard like database.*
 *       as you will nt get any events, you
 *       need to include all three segments
 *       such as x.x.x
 */
manager.on("*.*.*", function(event) {
    /**
     * Skip over tablemaps
     */
    if(event.type() == 'tablemap')
        return;

    /**
     * Log out the event
     */
    console.log(">> %s -> %s.%s with %s effected rows", 
        event.type(),
        event.schema(),
        event.tableName(),
        event.effected()
    );

    if(event.type() == 'update') {
        for (var i = event.effected() - 1; i >= 0; i--) {
            console.log("(%s) >>> %j", i, event.diff(i));
        };
    }
});