var axios = require('axios')

var securedRequest = axios.create({
  baseURL: process.env.REST_BASE_URL,
  auth: {
    username: 'janedoe',
    password: 's00pers3cret'
  }
})

var publicRequest = axios.create({
  baseURL: process.env.REST_BASE_URL
})

module.exports = function (secured) {
  return (secured) ? securedRequest : publicRequest
}

