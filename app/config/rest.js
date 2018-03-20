var axios = require('axios')
var ClientOAuth2 = require('client-oauth2')

var Application = require('../models/Application')

var restURL = process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.REST_MODULE

var axiosAppInstance = axios.create({
  baseURL: restURL
})

var axiosUserInstance = axios.create({
  baseURL: restURL
})

var appORDSAuth = new ClientOAuth2({
  clientId: process.env.APP_CLIENT_CRED_OAUTH_CLIENT_ID,
  clientSecret: process.env.APP_CLIENT_CRED_OAUTH_CLIENT_SECRET,
  accessTokenUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_TOKEN_PATH
})

var userORDSAuth = new ClientOAuth2({
  clientId: process.env.USER_AUTH_CODE_OAUTH_CLIENT_ID,
  clientSecret: process.env.USER_AUTH_CODE_OAUTH_CLIENT_SECRET,
  accessTokenUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_TOKEN_PATH,
  authorizationUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_AUTHORIZE_PATH,
  state: 'boemba'
})

var userCredentialsORDSAuth = new ClientOAuth2({
  clientId: process.env.USER_CLIENT_CRED_OAUTH_CLIENT_ID,
  clientSecret: process.env.USER_CLIENT_CRED_OAUTH_CLIENT_SECRET,
  accessTokenUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_TOKEN_PATH
})

var userImplicitORDSAuth = new ClientOAuth2({
  clientId: process.env.USER_IMPLICIT_OAUTH_CLIENT_ID,
  authorizationUri: process.env.REST_HOST + process.env.REST_BASE_PATH + process.env.OAUTH_AUTHORIZE_PATH,
  state: 'boemba'
})

var useOauth = process.env.USE_OAUTH
var userToken = null // For requests behalf of user
var appToken = null // For requests on behalf of app
var authHeader = null
var userAccount = null

// ORDS supports the following Oauth flows
var userOAuthFlows = {
  client_credentials: {
    name: 'client_credentials',
    getToken: function () {
      return userCredentialsORDSAuth.credentials.getToken()
    }
  },
  authorization_code: {
    name: 'authorization_code',
    getToken: function (uri) {
      return userORDSAuth.code.getToken(uri)
    },
    uri: userORDSAuth.code.getUri()
  },
  implicit: {
    name: 'implicit',
    getToken: function (uri) {
      return userImplicitORDSAuth.token.getToken(uri)
    },
    uri: userImplicitORDSAuth.token.getUri()
  }
}

exports.init = function (appName) {
  // The app is also an oAuth user so always get an access token at startup
  new Application({ name: appName })
    .fetch()
    .then(function (app) {
      // With client_credentials
      appORDSAuth.credentials.getToken()
        .then(function (token) {
          token.expiresIn(token.data.expires_in + 1000000)
          appToken = token
        })
        .catch(function (err) {
          console.log(err)
        })
    })
    .catch(function () {
      console.log('app does not exist')
      appORDSAuth.credentials.getToken()
        .then(function (token) {
          appToken = token
          new Application({
            name: appName,
            access_token: token.accessToken,
            refresh_token: token.refreshToken
          }).save()
            .then(function (app) {
              console.log('Application is created, access token is', app.get('access_token'))
            })
        })
    })
}

exports.userOAuthFlows = userOAuthFlows
exports.userOAuthFlow = userOAuthFlows[process.env.USER_OAUTH_FLOW]

exports.clientRequest = function (method, path, data) {
  if (useOauth) {
    return axiosAppInstance.request(appToken.sign({
      method: method,
      url: path,
      data: data
    }))
  } else {
    return axiosAppInstance[method](path, data)
  }
}

exports.userRequest = function (method, path, data) {
  if (useOauth) {
    var params = {}
    if (exports.userOAuthFlow.name === 'client_credentials') {
      params = userAccount
    }
    console.log(params)
    return axiosUserInstance.request(userToken.sign({
      method: method,
      url: path,
      data: data,
      params: params
    }))
  } else {
    return axiosUserInstance[method](path, data)
  }
}

exports.setBasicAuthCredentials = function (username, password) {
  authHeader = 'Basic ' + new Buffer(username + ':' + password).toString('base64')
  axiosUserInstance = axios.create({
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

exports.setUserToken = function (token) {
  userToken = token
  return token
}

exports.createUserToken = function (accessToken, refreshToken) {
  userToken = userORDSAuth.createToken(accessToken, refreshToken, 'bearer')
  console.log('current token', userToken.accessToken)
  userToken.expiresIn(7200)
  if (refreshToken) {
    return userToken.refresh()
    .then(function (token) {
      console.log('new token', token.accessToken)
      userToken = token
      return token
    })
  } else {
    return new Promise(function (resolve, reject) {
      resolve(userToken)
    })
  }
}

exports.signUserOut = function () {
  return axios.request(userToken.sign({
    method: 'get',
    url: process.env.REST_HOST + process.env.REST_BASE_PATH + 'signed-out'
  }))
}

exports.changeUserAuthFlow = function (flowName) {
  exports.userOAuthFlow = userOAuthFlows[flowName]
  // Obtain the token

}

exports.setUserAccount = function (account) {
  userAccount = account
}

exports.host = process.env.REST_HOST
