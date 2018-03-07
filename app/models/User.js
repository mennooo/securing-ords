var crypto = require('crypto')
var bookshelf = require('../config/bookshelf')
var rest = require('../config/rest')
var shajs = require('sha.js')

function sha256hash (text) {
  return shajs('sha256').update(text).digest('hex')
}

var User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function () {
    this.on('created', this.addAsCustomer, this)
    this.on('saving', this.hashPassword, this)
  },

  hashPassword: function (model, attrs, options) {
    var password = options.patch ? attrs.password : model.get('password')
    if (!password) { return }
    model.set('password', sha256hash(password))

    return
  },

  comparePassword: function (password, done) {
    done(null, (sha256hash(password) === this.get('password')))
  },

  hidden: ['password', 'passwordResetToken', 'passwordResetExpires'],

  virtuals: {
    gravatar: function () {
      if (!this.get('email')) {
        return 'https://gravatar.com/avatar/?s=200&d=retro'
      }
      var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex')
      return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro'
    }
  },

  addAsCustomer: function (model, attrs, options) {
    return new Promise(function (resolve, reject) {
      rest.request().post('/customers', {
        'first_name': model.get('firstname'),
        'last_name': model.get('lastname'),
        'email': model.get('email'),
        'password': model.get('password')
      })
        .then(function (response) {
          console.log(response.data)
          model.set('customerid', response.data.location)
          resolve(response.data)
        })
        .catch(reject)
    })
  }
})

module.exports = User
