var User = require('../models/User')
var OrderHistory = require('../models/OrderHistory')

/**
 * GET /
 */
exports.historyGet = function (req, res, next) {
  new User({ id: req.user.id })
    .fetch()
    .then(function (user) {

      OrderHistory.getHistory(user)
        .then(function (response) {
          console.log(response.data.items)
          res.render('order-history', {
            title: 'Order history',
            orders: response.data.items
          })
        })
        .catch(next)
    })
    .catch(next)
}
