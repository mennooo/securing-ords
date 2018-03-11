var bookshelf = require('../config/bookshelf')

var Application = bookshelf.Model.extend({
  tableName: 'applications',
  hasTimestamps: true
})

module.exports = Application
