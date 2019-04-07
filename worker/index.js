// out all of the primary logic for connecting to redis, 
// watching for values and eventually calculating Fibonacci value 

// all the configuration or kind of keys need to connect to redis

// First, requring a file: keys, which houses the host name and port 
// required to connect to Redis and create an object: keys
const keys = require('./keys'); 

// import a redis client
const redis = require('redis'); 

// create a redis client
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // Tell this redis client that if it ever lose conection 
    // to our redis server it should attempt to automatically 
    // reconnect to the server once every 1000ms.
    retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

// Recursion is slow and it will show why we want a seperate worker process.
function fib(index) {
    if( index < 2 ) return 1;
    return fib(index - 1) + fib(index - 2);
}

// Watch the redis whenever a new index is inserted into it. 
// When we see a new index, run fib function
// Sub get a message anytime a new value show up. 

// Anytime we get a new message run this callback function. 
// The callback function will be called with arguments (channle, message)
// hset got the hash code of values.
// Calculate a Fibonacci value and insert that into a hash of values. 
// The key is message(new index), the value is the fib result.
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert');