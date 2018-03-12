var express = require('express')
var path = require('path')
var logger = require('morgan')
var compression = require('compression')
var methodOverride = require('method-override')
var session = require('express-session')
var flash = require('express-flash')
var bodyParser = require('body-parser')
var expressValidator = require('express-validator')
var dotenv = require('dotenv')
var passport = require('passport')

// Load environment variables from .env file
dotenv.load()

// Controllers
var HomeController = require('./controllers/home')
var userController = require('./controllers/user')
var contactController = require('./controllers/contact')
var orderHistoryController = require('./controllers/order-history')
var orderController = require('./controllers/order')
var callbackController = require('./controllers/callback')

// Passport OAuth strategies
require('./config/passport')

var app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('port', process.env.PORT || 3000)
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())
app.use(methodOverride('_method'))
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(function (req, res, next) {
  res.locals.user = req.user ? req.user.toJSON() : null
  next()
})
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', HomeController.index)
app.get('/contact', contactController.contactGet)
app.post('/contact', contactController.contactPost)
app.get('/account', userController.ensureAuthenticated, userController.accountGet)
app.put('/account', userController.ensureAuthenticated, userController.accountPut)
app.delete('/account', userController.ensureAuthenticated, userController.accountDelete)
app.get('/signup', userController.signupGet)
app.post('/signup', [userController.validateSignupFields, userController.validateEmail, userController.registerCustomer], userController.signupPost)
app.get('/login', userController.loginGet)
app.post('/login', userController.validateLoginFields, userController.loginPost)
app.get('/forgot', userController.forgotGet)
app.post('/forgot', userController.forgotPost)
app.get('/reset/:token', userController.resetGet)
app.post('/reset/:token', userController.resetPost)
app.get('/logout', userController.logout)
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink)
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }))
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }))

// Extra
app.get('/order-history', userController.ensureAuthenticated, orderHistoryController.historyGet)
app.get('/order', orderController.orderGet)
app.post('/order', userController.ensureAuthenticated, orderController.orderPost)
app.get('/callback', callbackController.callbackGet)

// Production error handler
if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.sendStatus(err.status || 500)
  })
} else {
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    var response = err.message
    if (err.body) {
      response = err.body
    }
    if (err.response) {
      response = err.response.data
    }
    res.status(500).send(response)
  })
}

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

module.exports = app
