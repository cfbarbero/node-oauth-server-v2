var config = require('./config.js'),
    awsConfig = require('./aws.json'),
    _ = require('lodash'),
    AWS = require('aws-sdk'),
    bcrypt = require('bcrypt-as-promised'),
    jwtToken = require('./oauth-jwt.js');

AWS.config.loadFromPath(__dirname + '/aws.json');
AWS.config.dynamodb = awsConfig.dynamodb;

var docClient = new AWS.DynamoDB.DocumentClient();

require('./seed.js').run();

model = module.exports;

if (config.tokenFormat == 'jwt') {
    model.generateToken = jwtToken.generateToken;
    model.getAccessToken = jwtToken.getAccessToken;
    model.getRefreshToken = jwtToken.getRefreshToken;
    model.saveAccessToken = jwtToken.saveAccessToken;
} else {
    model.getAccessToken = getAccessTokenFromDynamo;
    model.saveAccessToken = saveAccessTokenToDynamo;
}


function getAccessTokenFromDynamo(bearerToken, callback) {
    console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');

    docClient.get({
            TableName: config.model.options.dynamoTables.oauthAccessToken,
            Key: {
                accessToken: bearerToken
            }
        })
        .promise()
        .then(function(data) {
            var token = data.Item;

            console.log('found token', token);
            if (token && token.expires) {
                token.expires = new Date(token.expires * 1000);
            }

            callback(false, token);
        })
        .catch(function(err) {
            callback(err);
        });
};

function saveAccessTokenToDynamo(accessToken, clientId, expires, user, callback) {
    console.log('in saveAccessToken (accessToken: ' + accessToken + ', clientId: ' + clientId + ', userId: ' + user.id + ', expires: ' + expires + ')');

    var token = {
        accessToken: accessToken,
        clientId: clientId,
        userId: user.userId
    };

    if (expires) token.expires = parseInt(expires / 1000, 10);
    console.log('saving', token);

    docClient.put({
        TableName: config.model.options.dynamoTables.oauthAccessToken,
        Item: token
    }, callback);
};

model.getClient = function(clientId, clientSecret, callback) {
    console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
    docClient.get({
            TableName: config.model.options.dynamoTables.oauthClient,
            Key: {
                clientId: clientId
            }
        }).promise()
        .then(function(data) {
            var client = data.Item;
            if (!client) {
                return callback(false, false);
            }

            bcrypt.compare(clientSecret, client.clientSecret)
                .then(function() {
                    callback(null, client);
                });
        })
        .catch(bcrypt.MISMATCH_ERROR, function(err) {
            return callback();
        })
        .catch(function(err) {
            callback(err);
        });
};


model.grantTypeAllowed = function(clientId, grantType, callback) {
    console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

    // all grant types supported for every client
    callback(false, true);

};




model.getUser = function(username, password, callback) {
    console.log('in getUser (username: ' + username + ', password: ' + password + ')');

    docClient.get({
            TableName: config.model.options.dynamoTables.oauthUser,
            Key: {
                username: username
            }
        }).promise()
        .then(function(data) {
          var user = data.Item;
            if (!user) {
                return callback(false, false);
            }

            bcrypt.compare(password, user.password)
                .then(function() {
                    callback(false, user.userId);
                });
        })
        .catch(bcrypt.MISMATCH_ERROR, function(err) {
             callback();
        })
        .catch(function(err) {
            callback(err);
        });
};

model.getUserFromClient = function(clientId, clientSecret, callback) {
    console.log('in getUserFromClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret);
    docClient.get({
            TableName: config.model.options.dynamoTables.oauthClient,
            Key: {
                'clientId': clientId
            }
        }).promise()
        .then(function(data) {
          var client = data.Item;
            if (!client) {
                console.log('client not found');
                return callback(false, false);
            }
            console.log('Found client', client);

            return docClient.get({
                TableName: config.model.options.dynamoTables.oauthUser,
                Key: {
                    username: client.username
                }
            }).promise();
        })
        .then(function(data) {
          var user = data.Item;
            if (!user) {
                console.log('user not found');
                callback(false, false);
            }
            console.log('found user', user);

            callback(false, user);
        })
        .catch(function(err) {
            console.log(err);
            callback(false, false);
        });
};
