/**
 * Copyright 2013-present NightWorld.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var config = require('./config.js'),
    _ = require('lodash'),
    AWS = require('aws-sdk');

AWS.config.loadFromPath(__dirname + '/aws.json');

var docClient = new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://localhost:8000'
});

if (config.seedDB) {
    require('./seed.js').seedData();
}

model = module.exports;

//
// node-oauth2-server callbacks
//
model.getAccessToken = function(bearerToken, callback) {
    console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');

    docClient.get({
            TableName: config.dynamoTables.oauthAccessToken,
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

model.getClient = function(clientId, clientSecret, callback) {
    console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
    docClient.get({
            TableName: config.dynamoTables.oauthClient,
            Key: {
                clientId: clientId
            }
        })
        .promise()
        .then(function(data) {
            if (!data.Item) {
                return callback(false, false);
            }
            if (data.Item.clientSecret !== clientSecret) return callback();
            callback(null, data.Item);
        })
        .catch(function(err) {
            callback(err);
        });
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to restrict certain grant types
var authorizedClientIds = ['abc1', 'def2'];
model.grantTypeAllowed = function(clientId, grantType, callback) {
    console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

    if (grantType === 'password') {
        return callback(false, authorizedClientIds.indexOf(clientId) >= 0);
    }

    callback(false, true);
};

model.saveAccessToken = function(accessToken, clientId, expires, user, callback) {
    console.log('in saveAccessToken (accessToken: ' + accessToken + ', clientId: ' + clientId + ', userId: ' + user.id + ', expires: ' + expires + ')');

    var token = {
        accessToken: accessToken,
        clientId: clientId,
        userId: user.userId
    };

    if (expires) token.expires = parseInt(expires / 1000, 10);
    console.log('saving', token);

    docClient.put({
        TableName: config.dynamoTables.oauthAccessToken,
        Item: token
    }, callback);
};


model.getUser = function(username, password, callback) {
    console.log('in getUser (username: ' + username + ', password: ' + password + ')');

    docClient.get({
            TableName: config.dynamoTables.oauthUser,
            Key: {
                username: username
            }
        })
        .promise()
        .then(function(data) {
            if (!data.Item) {
                callback(false, false);
            }
            callback(false, data.Item.userId);
        })
        .catch(function(err) {
            callback(err);
        });
};

model.getUserFromClient = function(clientId, clientSecret, callback) {
    console.log('in getUserFromClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret);
    docClient.get({
            TableName: config.dynamoTables.oauthClient,
            Key: {
                'clientId': clientId
            }
        }).promise()
        .then(function(client) {
            if (!client.Item) {
                console.log('client not found');
                callback(false, false);
            }
            console.log('found client', client.Item);

            return docClient.get({
                TableName: config.dynamoTables.oauthUser,
                Key: {
                    username: client.Item.username
                }
            }).promise();
        })
        .then(function(user) {
            if (!user.Item) {
                console.log('user not found');
                callback(false, false);
            }
            console.log('found user', user.Item);

            callback(false, user.Item);
        })
        .catch(function(err) {
            console.log(err);
            callback(false, false);
        });
};
