// app/routes.js
module.exports = function(app, passport) {

	var Beers = require('./models/beer');
	var beer = new Beers();
	var beersall = new Beers();
	var User = require('./models/user');
	var nodemailer = require('nodemailer');
	
	app.get('/', isLoggedIn, function(req, res) {
		Beers.find( {username: req.user.local.email}, function(error, beers){
			beer.name = '';
			beer.type = '';
			beer.quantity = 0;
			res.render('index', { message: '', beers: beers, beer: beer, isNew: true});
		});
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
	 
	app.post('/addnote', isLoggedIn, passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/addnote', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/addbeer', function(req, res) {
		beer = new Beers();
		beer.name = '';
		beer.type = '';
		beer.quantity = 0;
		req.flash('error', 'Could not update your name, please contact our support team');
        res.render('beer', {flash: {type: 'alert alert-danger', messages: ''}, message: '', beer: beer}); 
    });
	
	app.post('/beers', function(req, res) {
	req.checkBody('name', 'Invalid Name').notEmpty();
	req.checkBody('type', 'Invalid Type').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		beer.name = req.body.name;
		beer.type = req.body.type;
		res.render('beer', { flash: { type: 'alert alert-danger', messages: errors }, message: '', beer: beer, isNew: true }); 
	} else {
			
	  Beers.findOne({ 'name' :  req.body.name, 'username' :  req.user.local.email }, function(err, beer) {
		if (err)
			return done(err);
		if (beer) {
			Beers.find( {username: req.user.local.email}, function(error, beers){
				res.render('index', { message: 'The Name Already Exist.' , beers: beers, beer: beer, isNew: true});
			});			
		} else {
			var tempbeer = new Beers();
			tempbeer.username = req.user.local.email;
			tempbeer.name = req.body.name;
			tempbeer.type = req.body.type;
			tempbeer.quantity = req.body.quantity;

			// Save the beer and check for errors
			tempbeer.save(function(err, beer) {
			if (err)
				res.send(err);
				
			Beers.find( {username: req.user.local.email}, function(error, beers){
				res.render('index', { message: 'Save Success.' , beers: beers, beer: beer, isNew: false});
			});		
			});
		}
	  });
	}
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
			Beers.find( {username: req.user.local.email}, function(error, beers){
				res.render('index', {message: '', beers: beers, beer: beer, isNew: false});
			});		
		});
	  });
	});
	
	app.post('/updatebeer/:beer_id', function(req, res) {
	  Beers.findById(req.params.beer_id, function(err, beer) {
		if (err)
		  res.send(err);
		beer.name = req.body.name;
		beer.type = req.body.type;
		beer.quantity = req.body.quantity;
		beer.save(function(err) {
		if (err)
			res.send(err);
		Beers.find( {username: req.user.local.email}, function(error, beers){
			res.render('index', { message: 'Update Success.', beers: beers, beer: beer, isNew: false});
		});
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
	
	
	app.get('/beerprofile', function(req, res) {
        res.render('beerprofile.ejs', { message: '', beer : req.beer });
    });

	app.get('/forgot', function(req, res) {
	  res.render('forgot', {user: req.user, message: ''});
	});

	app.post('/forgot', function(req, res, next) {	
		User.findOne({ 'local.email' :  req.body.email }, function(err, user) {
            if (!user) {
            	res.render('forgot', {user: '', message: 'No account with that email address exists.'});
	        }  else {

		        user.local.resetPasswordToken = "0"; //user.generateToken();
	        	user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

		        user.save(function(err) {
		          
		        });

	        	var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
			        auth: {
			          user: 'gainfishclub@gmail.com',
			          pass: '23gain1299'
			        }
		        });
				var mailOptions = {
					to: user.local.email,
					from: 'first@demo.com',
					subject: 'Node.js Password Reset',
					text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/reset/' + user.local.resetPasswordToken + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					res.render('forgot', {user: '', message: 'An e-mail has been sent to ' + user.local.email + ' with further instructions.'});
				});
	    	}
        });
	});
	
	app.get('/reset/:token', function(req, res) {
		User.findOne({'local.resetPasswordToken': req.params.token}, function(err, user) {
			if (!user) {
			  req.flash('error', 'Password reset token is invalid or has expired.');
			  return res.redirect('/forgot');
			}
			res.render('reset', {
			  user: user, message: ''
			});
		});
	});
	
	app.post('/reset/:token', function(req, res) {
		User.findOne({'local.resetPasswordToken' :  req.params.token }, function(err, user) {
			if (user) {
				user.local.password = user.generateHash(req.body.password);
				user.save(function(err) {
                    if (err)
                        throw err;
                });
			} else {
				req.flash('error', 'Reset Password is invalid.');
			}
			res.redirect('/');	
		});
	});
	
	app.get('/note', function(req, res) {
		req.flash('error', 'test error1');
		req.flash('error', 'test error2');
		req.flash('info', 'test info');
		req.flash('success', 'test success');
		res.render('note',  {errors: req.flash('error'), infos: req.flash('info'), successes: req.flash('success')});
	});
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
