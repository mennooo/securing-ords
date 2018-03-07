const Backbone = require('backbone')

var Order = Backbone.Model.extend({
  defaults: {
    id: 1
  }
})

module.exports = Order
