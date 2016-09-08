var config = require('./config.js'),
    AWS = require('aws-sdk'),
    _ = require('lodash');

AWS.config.loadFromPath(__dirname + '/aws.json');
var docClient = new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://localhost:8000'
});

createTables = function() {
    //
    // Table definitions
    //
    var OAuth2AccessToken = {
        AttributeDefinitions: [{
            AttributeName: "accessToken",
            AttributeType: "S"
        }],
        TableName: config.dynamoTables.oauthAccessToken,
        KeySchema: [{
            AttributeName: "accessToken",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 12,
            WriteCapacityUnits: 6
        }
    };

    var OAuth2RefreshToken = {
        AttributeDefinitions: [{
            AttributeName: "refreshToken",
            AttributeType: "S"
        }],
        TableName: config.dynamoTables.oauthRefreshToken,
        KeySchema: [{
            AttributeName: "refreshToken",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    };

    var OAuth2AuthCode = {
        AttributeDefinitions: [{
            AttributeName: "authCode",
            AttributeType: "S"
        }],
        TableName: config.dynamoTables.oauthAuthCode,
        KeySchema: [{
            AttributeName: "authCode",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    };

    var OAuth2Client = {
        AttributeDefinitions: [{
            AttributeName: "clientId",
            AttributeType: "S"
        }],
        TableName: config.dynamoTables.oauthClient,
        KeySchema: [{
            AttributeName: "clientId",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    };

    var OAuth2User = {
        AttributeDefinitions: [{
            AttributeName: "username",
            AttributeType: "S"
        }],
        TableName: config.dynamoTables.oauthUser,
        KeySchema: [{
            AttributeName: "username",
            KeyType: "HASH"
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 6,
            WriteCapacityUnits: 6
        }
    };

    dal.db.createTable(OAuth2AccessToken, function(err, data) {
        if (err) console.log(err); // an error occurred
    });

    dal.db.createTable(OAuth2RefreshToken, function(err, data) {
        if (err) console.log(err); // an error occurred
    });

    dal.db.createTable(OAuth2AuthCode, function(err, data) {
        if (err) console.log(err); // an error occurred
    });

    dal.db.createTable(OAuth2Client, function(err, data) {
        if (err) console.log(err); // an error occurred
    });

    dal.db.createTable(OAuth2User, function(err, data) {
        if (err) console.log(err); // an error occurred
    });

}

seedClients = function() {
    var clients = [{
        clientId: 'foo',
        clientSecret: 'bar',
        username: 'cfbarbero'
    }, {
        clientId: 'ThisIsALongClientId',
        clientSecret: 'bar',
        username: 'cfbarbero'
    }];

    _(clients).forEach(function(client) {
        console.log('Creating:', client);
        docClient.put({
                TableName: config.dynamoTables.oauthClient,
                Item: client
            })
            .promise()
            .then(function(data) {
                console.log(data);
            })
            .catch(function(err) {
                console.log(err);
            });
    });
}

seedUsers = function() {
    var users = [{
        username: 'cfbarbero',
        password: 'test',
        userId: '123'
    }];

    _(users).forEach(function(user) {
        console.log('Creating:', user);
        docClient.put({
                TableName: config.dynamoTables.oauthUser,
                Item: user
            })
            .promise()
            .then(function(data) {
                console.log(data);
            })
            .catch(function(err) {
                console.log(err);
            });
    });
}

seedData = function() {
    seedClients();
    seedUsers();
}

module.exports = {
    createTables: createTables,
    seedData: seedData
}
