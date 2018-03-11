exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function (table) {
      table.increments()
      table.string('customerid').unique()
      table.string('firstname')
      table.string('lastname')
      table.string('email').unique()
      table.string('password')
      table.string('passwordResetToken')
      table.dateTime('passwordResetExpires')
      table.string('access_token')
      table.string('refresh_token')
      table.string('gender')
      table.string('location')
      table.string('website')
      table.string('picture')
      table.string('facebook')
      table.string('twitter')
      table.string('google')
      table.string('vk')
      table.timestamps()
    }),
    knex.schema.createTable('applications', function (table) {
      table.increments()
      table.string('name').unique()
      table.string('access_token')
      table.string('refresh_token')
      table.timestamps()
    })
  ])
}

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('applications')
  ])
}
