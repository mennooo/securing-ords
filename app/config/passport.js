var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var User = require('../models/User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  new User({ id: id}).fetch().then(function(user) {
    done(null, user);
  });
});

// Sign in with Email and Password
passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  // Save username and password for REST
  console.log(email, password)
  new User({ email: email })
    .fetch()
    .then(function(user) {
      if (!user) {
        return done(null, false, { msg: 'The email address ' + email + ' is not associated with any account. ' +
        'Double-check your email address and try again.' });
      }
      user.comparePassword(password, function(err, isMatch) {
        if (!isMatch) {
          return done(null, false, { msg: 'Invalid email or password' });
        }
        return done(null, user);
      });
    });
}));
