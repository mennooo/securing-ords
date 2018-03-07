var rest = require('../config/rest')({
  secured: false
})

exports.getHistory = function () {
  return rest.get('products')
}
