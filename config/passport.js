// config/passport.js

var LocalStrategy   = require('passport-local').Strategy;
var User       		= require('../app/models/user');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err);
            if (user) {
				return done(null, false, req.flash('signupMessage', 'Email account is already exists'));
            } else {
                var newUser            		= new User();
				newUser.local.firstname    	= req.body.firstname;
				newUser.local.lastname    	= req.body.lastname;
                newUser.local.email    		= email;
                newUser.local.password 		= newUser.generateHash(password);
                newUser.local.resetPasswordToken 	= "0";
                newUser.local.resetPasswordExpires 	= Date.now() + 3600000; 

                newUser.save(function(err) {
					if (err)
						return done(err);
					return done(null, newUser);
                });
            }
        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { 

        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); 
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); 
            return done(null, user);
        });

    }));

};