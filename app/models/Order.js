var rest = require('../config/rest')

exports.getOrder = function () {
  return rest.clientRequest('get', 'products')
}

exports.postOrder = function (order) {
  return rest.userRequest('post', 'orders', {
    'product_id': order.productId,
    'quantity': order.quantity
  })
}
