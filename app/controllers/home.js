var Product = require('../models/Product')

function arrayTo2DArray (list, howMany) {
  let result = []
  let a = list.slice(0)
  while (a[0]) {
    result.push(a.splice(0, howMany))
  }
  return result
}

/**
 * GET /
 */
exports.index = function (req, res) {
  Product.getList()
    .then(function (response) {
      res.render('home', {
        title: 'Home',
        productsPerRow: arrayTo2DArray(response.data.items, 4)
      })
    })
    .catch(function (error) {
      console.log(1, Object.getOwnPropertyNames(error))
      res.send({
        messages: error.message
      })
    })
}
