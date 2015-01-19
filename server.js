// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var util = require('util');
var expressValidator = require('express-validator');


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(expressValidator()); // this line must be immediately after express.bodyParser()!

app.get('/test1', function(req, res) {
	req.checkBody('postparam', 'Invalid postparam').notEmpty().isInt();
	req.checkParams('urlparam', 'Invalid urlparam').isAlpha();
	req.checkQuery('getparam', 'Invalid getparam').isInt();
	req.sanitize('postparam').toBoolean();

	var errors = req.validationErrors();
		if (errors) {
			res.render('addnote.ejs', { message: 'There have been validation errors: ' + util.inspect(errors) }); 
		//res.send('There have been validation errors: ' + util.inspect(errors), 400);
		//return;
	}
});

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);