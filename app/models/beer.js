// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var beerSchema   = new mongoose.Schema({
  username: String,	
  name: String,
  type: String,
  quantity: Number
});

// Export the Mongoose model
module.exports = mongoose.model('Beers', beerSchema);