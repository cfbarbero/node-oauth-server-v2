var express = require('express'),
    bodyParser = require('body-parser'),
    oauthserver = require('oauth2-server'),
    AWS = require('aws-sdk'),
    config = require('config');

console.log('Configuration', config.util.getConfigSources());

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

model = require('./model-' + config.get('model.name') + '.js');

app.oauth = oauthserver({
    model: model,
    grants: ['client_credentials'],
    debug: true,
    accessTokenLifetime: config.get('accessTokenExpirySeconds'),
    refreshTokenLifetime: config.get('refreshTokenExpirySeconds')
});

app.all('/oauth/token', app.oauth.grant());

app.get('/secret', app.oauth.authorise(), function(req, res) {
    // Will require a valid access_token
    res.send('Secret area');
});

app.get('/public', function(req, res) {
    // Does not require an access_token
    res.send('Public area');
});

app.get('/', function(req, res){
  res.send('Welcome to the JWT OAuth2 Authorization server.')
})

app.use(app.oauth.errorHandler());

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('app listening on port 3000!');
});
