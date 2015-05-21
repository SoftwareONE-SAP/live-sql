# LiveSql

The LiveSQL project aims to create a simple and lightweight interface on to of [ZongJi](https://github.com/nevill/zongji)

The combination of the two allows you to connect to a mysql server as a replication client and recieve real time updates of changes to your tables.

## How does it work
LiveSQL works by connecting to a mysql server as a replication slave and receiving MySQL BinLog events.

Binlog events are then decoded and transformed into Javascript Object.

The core of this project is [ZongJi](https://github.com/nevill/zongji), ZongJi does all the heavy lifting and this project tries to provide a more intuative interface.

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