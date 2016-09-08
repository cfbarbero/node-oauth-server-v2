var _ = require('lodash'),
    token = require('./oauth-jwt.js');

var model = module.exports;

// In-memory datastores
var oauthClients = [{
    clientId: 'foo',
    clientSecret: 'bar',
    redirectUri: '',
    userId: '123'
}, {
    clientId: 'ThisIsALongClientId',
    clientSecret: 'bar',
    redirectUri: '',
    userId: '123'
}];

// key is grant_type
// value is the array of authorized clientId's
var authorizedClientIds = {
    password: [
        'thom'
    ],
    refresh_token: [
        'thom'
    ]
};

// current registered users
var users = [{
    id: '123',
    username: 'cfbarbero',
    password: 'test'
}];


// Functions required to implement the model for oauth2-server

// generateToken
model.generateToken = token.generateToken;

// The bearer token is a JWT, so we decrypt and verify it. We get a reference to the
// user in this function which oauth2-server puts into the req object
model.getAccessToken = token.getAccessToken;

// As we're using JWT there's no need to store the token after it's generated
model.saveAccessToken = function(accessToken, clientId, expires, userId, callback) {
    return callback(false);
};

// The bearer token is a JWT, so we decrypt and verify it. We get a reference to the
// user in this function which oauth2-server puts into the req object
model.getRefreshToken = token.getRefreshToken;

// required for grant_type=refresh_token
// As we're using JWT there's no need to store the token after it's generated
model.saveRefreshToken = function(refreshToken, clientId, expires, userId, callback) {
    return callback(false);
};

// authenticate the client specified by id and secret
model.getClient = function(clientId, clientSecret, callback) {
    for (var i = 0, len = oauthClients.length; i < len; i++) {
        var elem = oauthClients[i];
        if (elem.clientId === clientId &&
            (clientSecret === null || elem.clientSecret === clientSecret)) {
            return callback(false, elem);
        }
    }
    callback(false, false);
};

// determine whether the client is allowed the requested grant type
model.grantTypeAllowed = function(clientId, grantType, callback) {
    callback(false, true);
};

// authenticate a user
// for grant_type password
model.getUser = function(username, password, callback) {
    for (var i = 0, len = users.length; i < len; i++) {
        var elem = users[i];
        if (elem.username === username && elem.password === password) {
            return callback(false, elem);
        }
    }
    callback(false, false);
};

var getUserById = function(userId) {
    for (var i = 0, len = users.length; i < len; i++) {
        var elem = users[i];
        if (elem.id === userId) {
            return elem;
        }
    }
    return null;
};

// for grant_type client_credentials
// given client credentials
//   authenticate client
//   lookup user
//   return that user...
//     oauth replies with access token and renewal token
model.getUserFromClient = function(clientId, clientSecret, callback) {
    console.log("getUserFromClient", clientId, clientSecret);
    try {
        var client = _.find(oauthClients, {
            'clientId': clientId
        });

        if (!client) {
            console.log('client not found');
            callback(false, false);
        }

        var user = _.find(users, {
            'id': client.userId
        });
        if (!client) {
            console.log('user not found');
            callback(false, false);
        }

        callback(false, user);

    } catch (err) {
        console.log("getClient - Err: ", err);
    }
};
