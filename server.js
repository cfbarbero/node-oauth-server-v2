var express = require('express');
var bodyParser = require('body-parser');
var oauthserver = require('oauth2-server');
var memorystore = require('./model.js');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.oauth = oauthserver({
  model: memorystore,
  grants: ['client_credentials'],
  debug: true,
  accessTokenLifetime: memorystore.JWT_ACCESS_TOKEN_EXPIRY_SECONDS,   // expiry time in seconds, consistent with JWT setting in model.js
  refreshTokenLifetime: memorystore.JWT_REFRESH_TOKEN_EXPIRY_SECONDS   // expiry time in seconds, consistent with JWT setting in model.js
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
  res.send('Secret area');
});

app.use(app.oauth.errorHandler());

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json( {
    message: err.message,
    error: err
  });
});

app.listen(3000);
