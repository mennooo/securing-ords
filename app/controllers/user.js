var async = require('async')
var crypto = require('crypto')
var nodemailer = require('nodemailer')
var passport = require('passport')
var User = require('../models/User')
var rest = require('../config/rest')
var shajs = require('sha.js')

function sha256hash (text) {
  return shajs('sha256').update(text).digest('hex')
}

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/login?redirect=' + req.url)
  }
}

exports.validateSignupFields = function (req, res, next) {
  req.assert('firstname', 'First Name cannot be blank').notEmpty()
  req.assert('lastname', 'Last Name cannot be blank').notEmpty()
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('email', 'Email cannot be blank').notEmpty()
  req.assert('password', 'Password must be at least 4 characters long').len(4)
  req.sanitize('email').normalizeEmail({ remove_dots: false })

  var errors = req.validationErrors()

  if (errors) {
    req.flash('error', errors)
    res.redirect('/signup')
  } else {
  // Hash the password
    req.body.password = sha256hash(req.body.password)

    next()
  }
}

exports.validateLoginFields = function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('email', 'Email cannot be blank').notEmpty()
  req.assert('password', 'Password cannot be blank').notEmpty()
  req.sanitize('email').normalizeEmail({ remove_dots: false })

  var errors = req.validationErrors()

  if (errors) {
    req.flash('error', errors)
    return res.redirect('/login')
  } else {
    next()
  }
}

exports.validateEmail = function (req, res, next) {
  // First check if user exists
  new User({ email: req.body.email })
    .fetch()
    .then(function (user) {
      if (user) {
        req.flash('error', { msg: 'The email address you have entered is already associated with another account.' })
        return res.redirect('/signup')
      }
      next()
    })
}

exports.registerCustomer = function (req, res, next) {
  rest.clientRequest('post', '/customers', {
    'first_name': req.body.firstname,
    'last_name': req.body.lastname,
    'email': req.body.email,
    'password': req.body.password
  })
  .then(function (response) {
    // req.body.customerid = response.data.location
    // Get oauth access token (if needed)
    if (rest.useOauth && rest.userOAuthFlow.uri) {
      console.log('User needs to grant access to obtain access token to REST resources')
      res.redirect(rest.userOAuthFlow.uri)
    } else {
      rest.setUserAccount({
        email: req.body.email
      })
      rest.userOAuthFlow.getToken()
        .then(function (token) {
          rest.setUserToken(token)
        })
        .then(next)
    }
  })
}

/**
 * GET /login
 */
exports.loginGet = function (req, res) {
  if (req.user) {
    return res.redirect('/')
  }
  res.render('account/login', {
    title: 'Log in',
    redirect: req.query.redirect || '/'
  })
}

/**
 * POST /login
 */
exports.loginPost = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (!user) {
      req.flash('error', info)
      return res.redirect('/login')
    }
    if (rest.useOauth) {
      if (rest.userOAuthFlow.name === rest.userOAuthFlows.implicit.name) {
        // For implicit flow the user has to grant access again
        rest.userOAuthFlow.getToken(req.originalUrl)
          .then(function (token) {
            rest.setUserToken(token)
            req.logIn(user, function (err) {
              res.redirect(req.body.redirect)
            })
          })
      } else {
        rest.createUserToken(user.get('access_token'), user.get('refresh_token'))
          .then(function (token) {
            user.set({
              access_token: token.accessToken,
              refresh_token: token.refreshToken
            })
            user.save()
            req.logIn(user, function (err) {
              res.redirect(req.body.redirect)
            })
          })
          .catch(next)
      }
    } else {
      req.logIn(user, function (err) {
        res.redirect(req.body.redirect)
      })
    }
  })(req, res, next)
}

/**
 * GET /logout
 */
exports.logout = function (req, res, next) {
  req.logout()
  if (rest.useOauth) {
    rest.signUserOut()
      .then(function () {
        res.redirect('/')
      })
      .catch(next)
  } else {
    res.redirect('/')
  }
}

/**
 * GET /signup
 */
exports.signupGet = function (req, res) {
  if (req.user) {
    return res.redirect('/')
  }
  res.render('account/signup', {
    title: 'Sign up'
  })
}

/**
 * POST /signup
 */
exports.signupPost = function (req, res, next) {
  new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    customerid: req.body.customerid
  }).save()
    .then(function (user) {
      req.logIn(user, function (err) {
        res.redirect('/')
      })
    })
    .catch(next)
}

/**
 * GET /account
 */
exports.accountGet = function (req, res) {
  res.render('account/profile', {
    title: 'My Account'
  })
}

/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function (req, res, next) {
  if ('password' in req.body) {
    req.assert('password', 'Password must be at least 4 characters long').len(4)
    req.assert('confirm', 'Passwords must match').equals(req.body.password)
  } else {
    req.assert('email', 'Email is not valid').isEmail()
    req.assert('email', 'Email cannot be blank').notEmpty()
    req.sanitize('email').normalizeEmail({ remove_dots: false })
  }

  var errors = req.validationErrors()

  if (errors) {
    req.flash('error', errors)
    return res.redirect('/account')
  }

  var user = new User({ id: req.user.id })
  if ('password' in req.body) {
    user.save({ password: req.body.password }, { patch: true })
  } else {
    user.save({
      email: req.body.email,
      name: req.body.name,
      gender: req.body.gender,
      location: req.body.location,
      website: req.body.website
    }, { patch: true })
  }
  user.then(function (user) {
    if ('password' in req.body) {
      req.flash('success', { msg: 'Your password has been changed.' })
    } else {
      req.flash('success', { msg: 'Your profile information has been updated.' })
    }
    res.redirect('/account')
  }).catch(function (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', { msg: 'The email address you have entered is already associated with another account.' })
    }
  })
}

/**
 * DELETE /account
 */
exports.accountDelete = function (req, res, next) {
  new User({ id: req.user.id }).destroy().then(function (user) {
    req.logout()
    req.flash('info', { msg: 'Your account has been permanently deleted.' })
    res.redirect('/')
  })
}

/**
 * GET /unlink/:provider
 */
exports.unlink = function (req, res, next) {
  new User({ id: req.user.id })
    .fetch()
    .then(function (user) {
      switch (req.params.provider) {
        case 'facebook':
          user.set('facebook', null)
          break
        case 'google':
          user.set('google', null)
          break
        case 'twitter':
          user.set('twitter', null)
          break
        case 'vk':
          user.set('vk', null)
          break
        default:
          req.flash('error', { msg: 'Invalid OAuth Provider' })
          return res.redirect('/account')
      }
      user.save(user.changed, { patch: true }).then(function () {
        req.flash('success', { msg: 'Your account has been unlinked.' })
        res.redirect('/account')
      })
    })
}

/**
 * GET /forgot
 */
exports.forgotGet = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  })
}

/**
 * POST /forgot
 */
exports.forgotPost = function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('email', 'Email cannot be blank').notEmpty()
  req.sanitize('email').normalizeEmail({ remove_dots: false })

  var errors = req.validationErrors()

  if (errors) {
    req.flash('error', errors)
    return res.redirect('/forgot')
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, function (err, buf) {
        var token = buf.toString('hex')
        done(err, token)
      })
    },
    function (token, done) {
      new User({ email: req.body.email })
        .fetch()
        .then(function (user) {
          if (!user) {
            req.flash('error', { msg: 'The email address ' + req.body.email + ' is not associated with any account.' })
            return res.redirect('/forgot')
          }
          user.set('passwordResetToken', token)
          user.set('passwordResetExpires', new Date(Date.now() + 3600000)) // expire in 1 hour
          user.save(user.changed, { patch: true }).then(function () {
            done(null, token, user.toJSON())
          })
        })
    },
    function (token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      })
      var mailOptions = {
        to: user.email,
        from: 'support@yourdomain.com',
        subject: '✔ Reset your password on Mega Boilerplate',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      }
      transporter.sendMail(mailOptions, function (err) {
        req.flash('info', { msg: 'An email has been sent to ' + user.email + ' with further instructions.' })
        res.redirect('/forgot')
      })
    }
  ])
}

/**
 * GET /reset
 */
exports.resetGet = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  new User({ passwordResetToken: req.params.token })
    .where('passwordResetExpires', '>', new Date())
    .fetch()
    .then(function (user) {
      if (!user) {
        req.flash('error', { msg: 'Password reset token is invalid or has expired.' })
        return res.redirect('/forgot')
      }
      res.render('account/reset', {
        title: 'Password Reset'
      })
    })
}

/**
 * POST /reset
 */
exports.resetPost = function (req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4)
  req.assert('confirm', 'Passwords must match').equals(req.body.password)

  var errors = req.validationErrors()

  if (errors) {
    req.flash('error', errors)
    return res.redirect('back')
  }

  async.waterfall([
    function (done) {
      new User({ passwordResetToken: req.params.token })
        .where('passwordResetExpires', '>', new Date())
        .fetch()
        .then(function (user) {
          if (!user) {
            req.flash('error', { msg: 'Password reset token is invalid or has expired.' })
            return res.redirect('back')
          }
          user.set('password', req.body.password)
          user.set('passwordResetToken', null)
          user.set('passwordResetExpires', null)
          user.save(user.changed, { patch: true }).then(function () {
            req.logIn(user, function (err) {
              done(err, user.toJSON())
            })
          })
        })
    },
    function (user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      })
      var mailOptions = {
        from: 'support@yourdomain.com',
        to: user.email,
        subject: 'Your Mega Boilerplate password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      }
      transporter.sendMail(mailOptions, function (err) {
        req.flash('success', { msg: 'Your password has been changed successfully.' })
        res.redirect('/account')
      })
    }
  ])
}
