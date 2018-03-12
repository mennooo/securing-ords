var config = require('../knexfile')
var knex = require('knex')(config)
var bookshelf = require('bookshelf')(knex)
var rest = require('../config/rest')

bookshelf.plugin('virtuals')
bookshelf.plugin('visibility')

knex.migrate.latest()
  .then(function () {
    // Create application
    rest.init('fashion')
  })

module.exports = bookshelf
