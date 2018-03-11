var rest = require('../config/rest')

exports.getHistory = function () {
  return rest.userRequest('get', 'orders')
}
