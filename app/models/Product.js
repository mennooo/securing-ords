
var rest = require('../config/rest')

exports.getList = function () {
  return rest.clientRequest('get', 'products')
}

exports.getProduct = function (id) {
  return rest.clientRequest('get', 'products/' + id)
}
