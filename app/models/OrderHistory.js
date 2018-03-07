var rest = require('../config/rest')

exports.getHistory = function () {
  return rest.request().get('orders')
}
