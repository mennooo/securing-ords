var crypto = require('crypto')
var bookshelf = require('../config/bookshelf')
var shajs = require('sha.js')

function sha256hash (text) {
  return shajs('sha256').update(text).digest('hex')
}

var User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

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
  }
})

module.exports = User
