var axios = require('axios')

var basicAuthCredentials = {
  username: null,
  password: null
}

exports.request = function () {
  return axios.create({
    baseURL: process.env.REST_BASE_URL,
    auth: basicAuthCredentials
  })
}

exports.setBasicAuthCredentials = function (username, password) {
  basicAuthCredentials.username = username
  basicAuthCredentials.password = password
}
