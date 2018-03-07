var rest = require('../config/rest')

exports.getOrder = function () {
  return rest.request().get('products')
}

exports.postOrder = function (order) {
  console.log(order)
  return rest.request().post('orders', {
    'product_id': order.productId,
    'quantity': order.quantity
  })
}
