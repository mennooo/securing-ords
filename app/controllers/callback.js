
var rest = require('../config/rest')
var User = require('../models/User')

// rest.oAuthFlow.getToken(req.originalUrl)
        //   .then(function (oAuthUser) {
        //     console.log(1)
        //     rest.setOAuthUser(oAuthUser)
        //     user.save()
        //       .then(function (user) {
        //         // user.set()
        //         req.logIn(user, function (err) {
        //           res.redirect('/')
        //         })
        //       })
        //   })
        //   .catch(function (err) {
        //     console.log(err)
        //   })

exports.callbackGet = function (req, res) {
  rest.userOAuthFlow.code.getToken(req.originalUrl)
    .then(rest.setOAuthUser)
    .then(function () {
      res.redirect('/')
    })
    // How to save user?
}
