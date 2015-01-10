// app/routes.js
module.exports = function(app, passport) {

	var Beers = require('./models/beer');
	var beer = new Beers();
	var User = require('./models/user');
	
    app.get('/', isLoggedIn, function(req, res) {
		Beers.find( function(error, beers){
			res.render('index', { title: 'ToDo List with Mongoose and Express', h1: 'ToDo List', beers: beers});
		});
        //res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

    app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

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
	
	app.post('/beers', function(req, res) {
	  Beers.findOne({ 'name' :  req.body.name }, function(err, beer) {
		if (err)
			return done(err);

		if (beer) {
			return done(null, false, req.flash('signupMessage', 'That name is already taken.'));
		} else {
			var tempbeer = new Beers();
			tempbeer.username = req.user.local.email;
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
	
	app.get('/beers', function(req, res) {
	  beer.find(function(err, beers) {
		if (err)
		  res.send(err);

		res.json(beers);
	  });
	});
	
	app.get('/beers/:beer_id', function(req, res) {
	  Beers.findById(req.params.beer_id, function(err, beer) {
		if (err)
		  res.send(err);
		beer.save( function(error){
		  res.render('beerprofile', {beer : beer});
		});
	  });
	});
	
	app.post('/updatebeer/:beer_id', function(req, res) {
	  Beers.findById(req.params.beer_id, function(err, beer) {
		if (err)
		  res.send(err);

		beer.quantity = req.body.quantity;
		beer.save(function(err) {
		  if (err)
			res.send(err);

		  res.redirect('/');
		});
	  });
	});

	app.get('/delete/:beer_id', function(req, res) {
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

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
