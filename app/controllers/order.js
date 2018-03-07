var Product = require('../models/Product')
var Order = require('../models/Order')

/**
 * GET /
 */
exports.orderGet = function (req, res) {
  Product.getProduct(req.query.id)
    .then(function (response) {
      res.render('order', {
        title: 'Order',
        product: response.data
      })
    })
    .catch(function (error) {
      res.send(error.message)
      console.log(error)
    })
}

/**
 * POST /order
 */
exports.orderPost = function (req, res, next) {
  Order.postOrder({
    productId: req.body.product_id,
    quantity: req.body.quantity
  })
    .then(function (response) {
      res.redirect('/order-history')
    })
    .catch(function (error) {
      res.send(error.message)
      console.log(error)
    })
}
