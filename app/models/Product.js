
var rest = require('../config/rest')

exports.getList = function () {
  return rest.request().get('products')
}

exports.getProduct = function (id) {
  return rest.request().get('products/' + id)
}
