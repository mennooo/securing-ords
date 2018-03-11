var axios = require('axios')
var ClientOAuth2 = require('client-oauth2')

var Application = require('../models/Application')

var restURL = process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.REST_MODULE

var axiosInstance = axios.create({
  baseURL: restURL
})

var appORDSAuth = new ClientOAuth2({
  clientId: process.env.APP_OAUTH_CLIENT_ID,
  clientSecret: process.env.APP_OAUTH_CLIENT_SECRET,
  accessTokenUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_TOKEN_PATH,
  authorizationUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_AUTHORIZE_PATH,
  redirectUri: 'http://localhost:3000',
  // scopes: ['demo.api.all'],
  state: 'boemba'
})
var userORDSAuth = new ClientOAuth2({
  clientId: process.env.USER_OAUTH_CLIENT_ID,
  clientSecret: process.env.USER_OAUTH_CLIENT_SECRET,
  accessTokenUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_TOKEN_PATH,
  authorizationUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_AUTHORIZE_PATH,
  redirectUri: 'http://localhost:3000',
  // scopes: ['demo.api.all'],
  state: 'boemba'
})

var useOauth = process.env.USE_OAUTH
var oAuthUser = null // For requests behalf of user
var oAuthAppUser = null // For requests on behalf of app
var authHeader = null

// ORDS supports the following Oauth flows
var userOAuthFlows = {
  client_credentials: {
    name: 'client_credentials',
    getToken: userORDSAuth.credentials.getToken
  },
  authorization_code: {
    name: 'authorization_code',
    getToken: userORDSAuth.token.getToken,
    uri: userORDSAuth.code.getUri()
  },
  implicit: {
    name: 'implicit',
    getToken: userORDSAuth.token.getToken,
    uri: userORDSAuth.token.getUri()
  }
}

var appOAuthFlow = {
  name: 'client_credentials',
  getToken: appORDSAuth.credentials.getToken
}
exports.init = function (appName) {
  // The app is also an oAuth user so always get an access token at startup
  new Application({ name: appName })
    .fetch()
    .then(function (app) {
      // With client_credentials
      appORDSAuth.credentials.getToken()
        .then(function (user) {
          user.expiresIn(user.data.expires_in + 1000000)
          oAuthAppUser = user
        })
    })
    .catch(function () {
      console.log('app does not exist')
      appORDSAuth.credentials.getToken()
        .then(function (user) {
          oAuthAppUser = user
          new Application({
            name: appName,
            access_token: user.accessToken,
            refresh_token: user.refreshToken
          }).save()
            .then(function (app) {
              console.log('Application is created, access token is', app.get('access_token'))
            })
        })
    })
}

exports.oAuthFlows
exports.appOAuthFlow = appOAuthFlow
exports.userOAuthFlow = userOAuthFlows[process.env.USER_OAUTH_FLOW]

exports.clientRequest = function (method, path, data) {
  if (useOauth) {
    return axiosInstance.request(oAuthAppUser.sign({
      method: method,
      url: path,
      data: data
    }))
  } else {
    return axiosInstance[method](path, data)
  }
}

exports.userRequest = function (method, path, data) {
  if (useOauth) {
    return axiosInstance.request(oAuthUser.sign({
      method: method,
      url: path,
      data: data
    }))
  } else {
    return axiosInstance[method](path, data)
  }
}

exports.setBasicAuthCredentials = function (username, password) {
  authHeader = 'Basic ' + new Buffer(username + ':' + password).toString('base64')
  axiosInstance = axios.create({
    baseURL: restURL,
    auth: {
      username: username,
      password: password
    }
  })
}

exports.getAuthHeader = function () {
  return authHeader
}

exports.useOauth = process.env.USE_OAUTH

exports.setOAuthUser = function (user) {
  console.log(user) // => { accessToken: '...', tokenType: 'bearer', ... }
  oAuthUser = user
}
