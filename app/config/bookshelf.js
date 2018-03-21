var config = require('../knexfile')
var knex = require('knex')(config)
var bookshelf = require('bookshelf')(knex)
var rest = require('../config/rest')
var knexCleaner = require('knex-cleaner')

bookshelf.plugin('virtuals')
bookshelf.plugin('visibility')

// knexCleaner.clean(bookshelf.knex)
//   .then(function () {
//     console.log('Data is cleaned')
//   })

// knex.migrate.latest()
//   .then(function () {
//     rest.init('fashion')
//   })

knex.migrate.latest()
  .then(function () {
    knexCleaner.clean(bookshelf.knex, {
      mode: 'delete',
      ignoreTables: ['knex_migrations', 'knex_migrations_lock']
    })
      .then(function () {
        console.log('Data is cleaned')
        rest.init('fashion')
      })
  })

module.exports = bookshelf
