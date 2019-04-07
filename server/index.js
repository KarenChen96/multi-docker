const keys = require("./keys");

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // cross origin resource sharing

// app is an object that receives and reponses to any http 
// requests that are coming or going back to the react server.
const app = express(); // crreate a new express application
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool( {
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    post: keys.pgPort
});
// Erro Listener
pgClient.on('error', () => console.log('Lost PG connection'));

/* .query(): Create a table with name: values. The table will 
   save a signle column of info that will be reffered to as number.

 * .catch(): If anything wrong with creating the table, 
   console log that error.
*/
pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.log(err)); 

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// Express route Handlers

// Test routes used to make sure our application is working.
// Function: Anytime someone makes a request to the route route(路径路由) 
// of express apllication, send back a response 'Hi'.
app.get('/', (req, res) => {
    res.send('Hi');
});

// This handler will query our running Postgres instance and
// retrieve all the different values that have been submitted.
// A async error function.
app.get('/values/all', async (req, res) => {
    // make a sql query to Postgres instance.
    const values = await pgClient.query('SELECT * from values');
    // Send back all the info back to whoever makes the request to this route.
    res.send(values.rows);
});

// Reach redis, retrieve all different indeices and calculated values
// that have been submitted to the backend.
// (req, res) is a cllback function. What is a callback function???
app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values',(err, values) => {
        res.send(values);
    });
});

// Reveive new index from the react application.
// Listening on a post request. 
app.post('/values', async (req, res) => {
    // get the index the user just submitted
    const index = req.body.index;

    // constraint index
    if( parseInt(index) > 40 ) {
        return res.status(422).send('Index too high');
    }

    // Take index and put it into redis. 
    // Eventaully the worker is going to come to the hash 
    // (the data structure) inside of redis and 
    // replace 'Nothing yet!' with the calculated value.
    redisClient.hset('values', index, 'Nothing yet!');
    
    // Publish a new insert event of this index. 
    // It's going to be the message that gets sent over to the 
    // worker process and wake worker process up.
    redisPublisher.publish('insert', index); 

    // Take the submitted index and permanently store it inside of Postgres
    // We are inserting for the number column.
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening...');
});