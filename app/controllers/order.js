

/**
 * GET /
 */
exports.orderGet = function (req, res) {
  res.render('order', {
    title: 'Order'
  })
}
