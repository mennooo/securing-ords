var OrderHistory = require('../models/OrderHistory')

/**
 * GET /
 */
exports.historyGet = function (req, res) {
  OrderHistory.getHistory()
    .then(function (response) {
      res.render('order-history', {
        title: 'Order history',
        content: JSON.stringify(response.data)
      })
    })
    .catch(function (error) {
      console.log(error)
    })
}
