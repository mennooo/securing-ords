var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy

var User = require('../models/User')
var rest = require('../config/rest')

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (id, done) {
  new User({ id: id}).fetch().then(function (user) {
    done(null, user)
  })
})

// Sign in with Email and Password
passport.use(new LocalStrategy({ usernameField: 'email' }, function (email, password, done) {
  new User({ email: email })
    .fetch()
    .then(function (user) {
      if (!user) {
        return done(null, false, { msg: 'The email address ' + email + ' is not associated with any account. ' +
          'Double-check your email address and try again.' })
      }
      
      user.comparePassword(password, function (err, isMatch) {
        if (!isMatch) {
          return done(null, false, { msg: 'Invalid email or password' })
        }

        if (!rest.useOauth) {
          rest.setBasicAuthCredentials(email, password)
        }
        
        return done(null, user)
      })
    })
}))

// Sign in with Facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['name', 'email', 'gender', 'location'],
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    // Update existing user
    new User({ facebook: profile.id })
      .fetch()
      .then(function (user) {
        if (user) {
          req.flash('error', { msg: 'There is already an existing account linked with Facebook that belongs to you.' })
          return done(null)
        }
        console.log(profile)
        rest.clientRequest('post', '/customers', {
          'first_name': profile.name.givenName,
          'last_name': profile.name.familyName,
          'email': profile.emails[0].value,
          'facebook_id': profile.id
        })
        .then(function (response) {
          // We don't use authorization code flow anymore for facebook users
          // Because the user password is so they can't authorize anything (they have to login)
          rest.changeUserAuthFlow(rest.userOAuthFlows.client_credentials.name)
          rest.userOAuthFlow.getToken()
            .then(function (token) {
              rest.setUserToken(token)
              new User({ id: req.user.id })
              .fetch()
              .then(function (user) {
                rest.setUserAccount({
                  facebookid: profile.id,
                  email: user.get('email')
                })
                user.set('firstname', user.get('firstname') || profile.name.givenName)
                user.set('lastname', user.get('lastname') || profile.name.familyName)
                user.set('gender', user.get('gender') || profile._json.gender)
                user.set('picture', user.get('picture') || 'https://graph.facebook.com/' + profile.id + '/picture?type=large')
                user.set('facebook', profile.id)
                user.set('access_token', token.accessToken)
                user.set('refresh_token', token.refreshToken)
                user.save(user.changed, { patch: true }).then(function () {
                  req.flash('success', { msg: 'Your Facebook account has been linked.' })
                  done(null, user)
                })
              })
            })
        })
        .catch(done)
      })
  } else {
    // New user
    new User({ facebook: profile.id })
      .fetch()
      .then(function (user) {
        if (user) {
          rest.changeUserAuthFlow(rest.userOAuthFlows.client_credentials.name)
          rest.setUserAccount({
            facebookid: profile.id,
            email: user.get('email')
          })
          rest.userOAuthFlow.getToken()
            .then(function (token) {
              rest.setUserToken(token)
              return done(null, user)
            })
        } else {
          new User({ email: profile._json.email })
          .fetch()
          .then(function (user) {
            if (user) {
              req.flash('error', { msg: user.get('email') + ' is already associated with another account.' })
              return done()
            }
            console.log(profile)
            
            rest.clientRequest('post', '/customers', {
              'first_name': profile.name.givenName,
              'last_name': profile.name.familyName,
              'email': profile.emails[0].value,
              'facebook_id': profile.id
            })
            .then(function (response) {
              // We don't use authorization code flow anymore for facebook users
              // Because the user password is so they can't authorize anything (they have to login)
              rest.changeUserAuthFlow(rest.userOAuthFlows.client_credentials.name)
              rest.userOAuthFlow.getToken()
                .then(function (token) {
                  rest.setUserToken(token)
                  user = new User()
                  user.set('firstname', user.get('firstname') || profile.name.givenName)
                  user.set('lastname', user.get('lastname') || profile.name.familyName)
                  user.set('email', profile._json.email)
                  user.set('gender', profile._json.gender)
                  user.set('location', profile._json.location && profile._json.location.name)
                  user.set('picture', 'https://graph.facebook.com/' + profile.id + '/picture?type=large')
                  user.set('facebook', profile.id)
                  user.set('access_token', token.accessToken)
                  user.set('refresh_token', token.refreshToken)
                  user.save().then(function (user) {
                    rest.setUserAccount({
                      facebookid: profile.id,
                      email: user.get('email')
                    })
                    done(null, user)
                  })
                })
            })
            .catch(done)
          })
        }
      })
  }
}))
