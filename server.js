var express = require('express'),
    bodyParser = require('body-parser'),
    oauthserver = require('oauth2-server'),
    AWS = require('aws-sdk'),
    config = require('./config.js');


var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

model = require('./model-' + config.model.name + '.js');

app.oauth = oauthserver({
    model: model,
    grants: ['client_credentials'],
    debug: true,
    accessTokenLifetime: config.accessTokenExpirySeconds,
    refreshTokenLifetime: config.refreshTokenExpirySeconds
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

app.use(app.oauth.errorHandler());

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

app.listen(3000);
