
var rest = require('../config/rest')({
  secured: false
})

exports.getList = function () {
  return rest.get('products')
}
