var rest = require('../config/rest')
var User = require('../models/User')

// There seems to be a BUG in ORDS, the authorization_code is not yet committed
// https://community.oracle.com/thread/4128491
exports.callbackGet = function (req, res, next) {
  setTimeout(function () {
    rest.userOAuthFlow.getToken(req.originalUrl)
      .then(rest.setUserToken)
      .then(function (token) {
        rest.userRequest('get', 'me')
          .then(function (response) {
            new User({
              firstname: response.data.cust_first_name,
              lastname: response.data.cust_last_name,
              email: response.data.cust_email,
              password: response.data.cust_password,
              customerid: response.data.customer_id,
              access_token: token.accessToken,
              refresh_token: token.refreshToken
            }).save()
              .then(function (user) {
                req.logIn(user, function (err) {
                  res.redirect('/')
                })
              })
              .catch(next)
          })
      })
  }, 1000)
}

