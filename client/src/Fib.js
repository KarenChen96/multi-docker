import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    // fetch some data from backend API
    // lifet cycle method??
    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    // define helper methods
    async fetchValues() {
        // Make a request to get all distinct values have 
        // been stored on our API.
        const values = await axios.get('/api/values/current');
        this.setState( { 
            values: values.data 
        } );
    }

    // Get the list of indexes taht have been requested 
    // and stored inside of Postgres server.
    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState( { 
            seenIndexes: seenIndexes.data
        } );
    }

    // We want handleSubmit to be a bound function, 
    // -> handleSubmit equals an arrow function
    // This is an async funtion because we are going to send some info to backend API 
    handleSubmit = async event => {
        // Keep the form from attempting to submit itself by calling it. 
        event.preventDefault();

        // Make a axios POST request 
        await axios.post('/api/values', {
            index: this.state.index
        });

        // After successfully submitting this to the backend, clear out the input
        this.setState({ index: '' });
    };

    // when have we called fetchIndexes()?
    // --> seenIndexes is an array of a variety of different 
    //     objects and each object has a number property. 
    // The number propery is the number that we want to print 
    // out on the screen.
    // --> {numnber} means we only pull out just the number 
    // property that we care about.
    renderSeenIndexes() {
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    }


    // For POST request:
    // --> When geeting seenIndexes, we get back an array of objects which is 
    // the default return type when we're pulling data out of Postgres.
    // --> When getting calculated values, the table is stored in redis. 
    // When we pull data out of redis we're actually going to get back an 
    // object that has a bunch of key-value pair inside of it. 
    renderValues() {
        const entries = [];

        for( let key in this.state.values ) {
            entries.push(
                <div key={key}> 
                For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }
        return entries;        
    }

    render() {
        return (
            <div>
               <form onSubmit={this.handleSubmit}>
                   <label>Enter your index:</label>
                   <input 
                    value={this.state.index}
                    onChange={event => this.setState({ index: event.target.value })}
                    />
                   <button>Submit</button>
                   </form> 

                   <h3>Indexes I have seen: </h3>
                   {this.renderSeenIndexes()}

                   <h3>Calculated Vlues:</h3>
                   {this.renderValues()}
            </div>
        );
    }
}

export default Fib;

// Add on the ability for this thinf to be rendered onto 
// the screen of our browser and show some info to users.

// Add some event handlers for form tag and input tag 
// To watch for any time a user enters in some text and press the sbumit button

// rendering pieces