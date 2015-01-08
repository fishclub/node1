// app/routes.js
module.exports = function(app, passport) {

	var Beers = require('./models/beer');
	var beer = new Beers();
	
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
		Beers.find( function(error, beers){
			res.render('index', { title: 'ToDo List with Mongoose and Express', h1: 'ToDo List', beers: beers});
		});
        //res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
	
	app.get('/addnote', function(req, res) {
        res.render('addnote.ejs', { message: req.flash('loginMessage') }); 
    });
	 
	app.post('/addnote', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/addnote', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
	
	
	
	// Create endpoint /api/beers for POSTS
	app.post('/beers', function(req, res) {
	  // Create a new instance of the Beer model
	  // Set the beer properties that came from the POST data
	  Beers.findOne({ 'name' :  req.body.name }, function(err, beer) {
		// if there are any errors, return the error
		if (err)
			return done(err);

		// check to see if theres already a user with that email
		if (beer) {
			return done(null, false, req.flash('signupMessage', 'That name is already taken.'));
		} else {
			var tempbeer = new Beers();
			tempbeer.name = req.body.name;
			tempbeer.type = req.body.type;
			tempbeer.quantity = req.body.quantity;

			// Save the beer and check for errors
			tempbeer.save(function(err, Beers) {
			if (err)
				res.send(err);
			res.redirect('/');
				//res.json({ message: 'Beer added to the locker!', data: beer });
			});
		}
	  });
	});
	
	// Create endpoint /api/beers for GET
	app.get('/beers', function(req, res) {
	  // Use the Beer model to find all beer
	  beer.find(function(err, beers) {
		if (err)
		  res.send(err);

		res.json(beers);
	  });
	});
	
	app.get('/beers/:beer_id', function(req, res) {
	  // Use the Beer model to find a specific beer
	  Beers.findById(req.params.beer_id, function(err, beer) {
		if (err)
		  res.send(err);
		beer.save( function(error){
		  res.render('beerprofile', {beer : beer});
		});
	  });
	});
	
	// Create endpoint /api/beers/:beer_id for PUT
	app.put('/beers/:beer_id', function(req, res) {
	  // Use the Beer model to find a specific beer
	  beer.findById(req.params.beer_id, function(err, beer) {
		if (err)
		  res.send(err);

		// Update the existing beer quantity
		beer.quantity = req.body.quantity;

		// Save the beer and check for errors
		beer.save(function(err) {
		  if (err)
			res.send(err);

		  res.json(beer);
		});
	  });
	});

	// Create endpoint /api/beers/:beer_id for DELETE
	app.get('/delete/:beer_id', function(req, res) {
	  // Use the Beer model to find a specific beer and remove it
	  Beers.findById(req.params.beer_id, function(error, beer){
		beer.remove( function(error, beer){
			res.redirect('/');
		});
	  });
	});
	
	app.get('/addbeer', function(req, res) {
        res.render('beer.ejs', { message: req.flash('loginMessage') }); 
    });
	
	app.get('/beerprofile', function(req, res) {
        res.render('beerprofile.ejs', {
            beer : req.beer
        });
    });

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
