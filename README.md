# LiveSql

As web application trends are growing towards stateful and real time applications, more applicable database engines such as MongoDB, Redis, CouchDB are being chosen to supply the data, which is great but what does that mean for database engines such as MySQL which millions of applications have been built around.


## So how does it work?
LiveSql is a library that uses varius componants such as [ZongJi](https://github.com/nevill/zongji) and [node-mysql](https://github.com/felixge/node-mysql/) to simulate a slave replication server.

> For replication, the binary log on a master replication server provides a record of the data changes to be sent to slave servers. The master server sends the events contained in its binary log to its slaves, which execute those events to make the same data changes that were made on the master.

[Source](https://dev.mysql.com/doc/refman/5.0/en/binary-log.html)

In the case of LiveSql, were actually just eaves dropping on the binlog events, which enables us to produce event's for the follwoing:

- Insert statements.
- Update statements.
- Delete statements.

**Note:** With update statements, you get 2 objects, the row before the object was modified and the row after it was modfied, allowing you to see waht columns was effected.

## Prerequisites
In order for you to be able to receive binlog events you must have a mysql server that's configured for binlog, You can enable binlogging via `my.cnf` like so:

```inf
# binlog config
server-id        = 1
log_bin          = /var/log/mysql/mysql-bin.log
expire_logs_days = 10            # optional
max_binlog_size  = 100M          # optional

# Very important if you want to receive write, update and delete row events
binlog_format    = row
```

and restart your MySQL Server.

Secondly you need a user account with replciation provileges, we suggest you create a new MySQL user that has access to the tables you will be monitoring.

You can then grant replication privs to that account like so:

```sql
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'replclient'@'localhost'
```

## Requirements
- Node.js v0.10+

## Example

```js
/**
 * Create a new isntance
 */
var manager = new LiveSQL({
    "host": "localhost",
    "user": "replclient",
    "password": "replclient"

    /**
     * @see node-mysql for connection options
     */
});

/**
 * Subscribe to the `blog` table
 */
manager.subscribe("blog");

/**
 * Listen for new posts on the `blog.posts` table
 *
 * Each time an insert happens on the posts table
 * this method is fired
 */
manager.on("blog.posts.insert", function(event){
	/**
	 * Log the effected rows
	 */
	console.log(event.rows());
});

/**
 * Catch all events on the `blog.posts` table
 */
manager.on("blog.posts.*", function(event){
	/**
	 * Log the event type
	 */
	console.log(event.type());
});

/**
 * Catch all events on all tables
 */
manager.on("blog.*.*", function(event){
	/**
	 * Log the event type
	 */
	console.log(event.type());
});

/**
 * Start the client
 */
manager.start();
```

## Contributions

We highly encourage contributions from the community, please feel free to create feature requests, pull requests and issues.

Please also note, the core of this project is [ZongJi](https://github.com/nevill/zongji), so if your feature/pr/issue is for that area of the project, please send ot to ZongJi.

## License
#### [MIT](http://opensource.org/licenses/MIT)
